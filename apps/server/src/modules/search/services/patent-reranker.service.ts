import type { SearchResult } from '../interfaces/search.interface.js';
import type { ILLMProvider } from '../../../providers/llm/llm-provider.interface.js';

export interface TechnicalRelevanceRerankResult {
  patentId: string;
  retrievalRelevanceScore: number;
  reason: string;
}

export interface PatentRerankerOutput {
  rerankedResults: SearchResult[];
  relevanceScores: TechnicalRelevanceRerankResult[];
  usedLlmReranker: boolean;
}

/**
 * Optional Second-Stage Technical Relevance Reranker Service.
 * Evaluates technical disclosure relevance ("Invention query vs patent technical text")
 * for top candidate patents (e.g. top 30-50 from RRF) and outputs top N (e.g. top 10-20).
 *
 * Fault-tolerant fallback: If the LLM provider fails, times out, or is omitted,
 * it returns candidates in their original RRF ranking order without crashing the search service.
 */
export class PatentRerankerService {
  private readonly llmProvider?: ILLMProvider | undefined;
  private readonly enabled: boolean;

  constructor(llmProvider?: ILLMProvider | undefined, enabled = true) {
    this.llmProvider = llmProvider;
    this.enabled = enabled;
  }

  /**
   * Performs technical relevance reranking over top candidates.
   */
  public async rerank(
    query: string,
    candidates: SearchResult[],
    topK = 20
  ): Promise<PatentRerankerOutput> {
    if (!candidates || candidates.length === 0) {
      return { rerankedResults: [], relevanceScores: [], usedLlmReranker: false };
    }

    // Fallback if LLM provider is disabled or not provided
    if (!this.enabled || !this.llmProvider) {
      return this.fallbackRRF(candidates, topK);
    }

    try {
      // 1. Prepare candidate payloads for evaluation prompt
      const candidatePayloads = candidates.map((c) => ({
        patentId: c.patentId,
        title: c.title || '',
        abstract: c.abstract || '',
        claims: c.claims ? c.claims.substring(0, 300) : '',
      }));

      const systemPrompt = `You are a technical document retrieval relevance evaluator.
Your ONLY task is to evaluate the technical relevance of candidate patents against the target invention disclosure.

STRICT RULES:
1. Evaluate ONLY technical relevance and domain overlap.
2. Do NOT perform novelty analysis, patentability analysis, risk scoring, legal analysis, design-around analysis, or claim infringement analysis.
3. Return valid JSON only with array "evaluations" containing:
   [
     {
       "patentId": "...",
       "retrievalRelevanceScore": 0.85, (float from 0.0 to 1.0)
       "reason": "Concise 1-sentence technical justification of domain relevance"
     }
   ]`;

      const userPrompt = `Target Invention Query: "${query}"

Candidate Patents to Evaluate:
${JSON.stringify(candidatePayloads, null, 2)}`;

      const rawResponse = await this.llmProvider.generateCompletion(userPrompt, {
        systemPrompt,
        temperature: 0.1,
      });

      // Parse JSON from LLM response
      const parsed = this.parseResponseJSON(rawResponse);
      if (!parsed || !Array.isArray(parsed.evaluations) || parsed.evaluations.length === 0) {
        console.warn('[PatentRerankerService] Failed to parse LLM JSON response. Falling back to RRF.');
        return this.fallbackRRF(candidates, topK);
      }

      // Map evaluation scores to candidate objects
      const evalMap = new Map<string, TechnicalRelevanceRerankResult>();
      for (const item of parsed.evaluations) {
        if (item && item.patentId) {
          const rawScore = typeof item.retrievalRelevanceScore === 'number' ? item.retrievalRelevanceScore : 0.5;
          const clampedScore = Math.max(0, Math.min(1, Number(rawScore.toFixed(4))));
          evalMap.set(String(item.patentId).trim(), {
            patentId: String(item.patentId).trim(),
            retrievalRelevanceScore: clampedScore,
            reason: item.reason ? String(item.reason).trim() : 'Evaluated by technical relevance model.',
          });
        }
      }

      // Combine scores with candidates
      const rerankedList: SearchResult[] = candidates.map((cand) => {
        const evalInfo = evalMap.get(cand.patentId);
        const relevanceScore = evalInfo ? evalInfo.retrievalRelevanceScore : Number((cand.score || 0.5).toFixed(4));
        const relevanceReason = evalInfo ? evalInfo.reason : 'Fallback RRF technical rank.';

        return {
          ...cand,
          retrievalRelevanceScore: relevanceScore,
          relevanceReason,
        };
      });

      // Sort descending by technical retrieval relevance score
      rerankedList.sort((a, b) => (b.retrievalRelevanceScore || 0) - (a.retrievalRelevanceScore || 0));

      // Re-assign ranks
      const finalReranked = rerankedList.slice(0, topK).map((item, idx) => ({
        ...item,
        rank: idx + 1,
        finalRank: idx + 1,
      }));

      const relevanceScores: TechnicalRelevanceRerankResult[] = finalReranked.map((item) => ({
        patentId: item.patentId,
        retrievalRelevanceScore: item.retrievalRelevanceScore || 0,
        reason: item.relevanceReason || 'Evaluated by technical relevance model.',
      }));

      return {
        rerankedResults: finalReranked,
        relevanceScores,
        usedLlmReranker: true,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.warn(`[PatentRerankerService] Reranker execution failed (${msg}). Falling back to RRF ranking.`);
      return this.fallbackRRF(candidates, topK);
    }
  }

  /**
   * Fallback to original RRF ranking order when LLM is unavailable or fails.
   */
  private fallbackRRF(candidates: SearchResult[], topK: number): PatentRerankerOutput {
    const sliced = candidates.slice(0, topK).map((c, idx) => {
      const fallbackScore = Number((c.score || 0.5).toFixed(4));
      return {
        ...c,
        rank: idx + 1,
        finalRank: idx + 1,
        retrievalRelevanceScore: fallbackScore,
        relevanceReason: 'Standard RRF rank fallback.',
      };
    });

    const relevanceScores: TechnicalRelevanceRerankResult[] = sliced.map((c) => ({
      patentId: c.patentId,
      retrievalRelevanceScore: c.retrievalRelevanceScore || 0,
      reason: c.relevanceReason || 'Standard RRF rank fallback.',
    }));

    return {
      rerankedResults: sliced,
      relevanceScores,
      usedLlmReranker: false,
    };
  }

  private parseResponseJSON(text: string): { evaluations?: any[] } | null {
    if (!text) return null;
    try {
      const direct = JSON.parse(text);
      if (direct && typeof direct === 'object') return direct;
    } catch {
      const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (jsonMatch && jsonMatch[1]) {
        try {
          return JSON.parse(jsonMatch[1]);
        } catch {
          return null;
        }
      }
    }
    return null;
  }
}
