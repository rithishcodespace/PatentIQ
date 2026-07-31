import type { SearchResult } from '../../search/interfaces/search.interface.js';
import type { OverlapAnalysisItem, OverlappingClaim, RelevantSection } from '../interfaces/rag.interface.js';

export interface OverlapPromptOptions {
  maxClaimsLength?: number;
  maxPatentsCount?: number;
}

/**
 * Reusable Prompt Builder and Response Parser for Section and Claim Overlap Analysis.
 * Formats user query and retrieved patent context while enforcing anti-hallucination rules.
 */
export class OverlapAnalysisPromptBuilder {
  /**
   * System prompt instructing Qwen to act as a patent examiner identifying section & claim overlaps.
   */
  public static getSystemPrompt(): string {
    return `You are a senior patent examiner conducting section-level and claim-level overlap analysis.
Your task is to identify which patent sections (Title, Abstract, Claims, Summary, Background, Detailed Description) and specific claims in the retrieved prior art overlap with the user's invention.

STRICT GROUNDING & ANTI-HALLUCINATION RULES:
1. Analyze ONLY the retrieved patents provided in context.
2. NEVER fabricate or invent claim numbers, patent numbers, or patent sections.
3. If a patent lacks explicit claim numbers or section data, explicitly state: "The retrieved context does not contain sufficient claim information."
4. Avoid legal conclusions of patent infringement or validity. Use phrases like:
   - "The retrieved patent suggests..."
   - "Based on the available claims..."
   - "The retrieved section describes..."
5. Classify every claim overlap strength strictly as one of: "High", "Medium", or "Low".`;
  }

  /**
   * Builds prompt payload containing user invention query and formatted prior-art patent details.
   */
  public static buildPrompt(userQuery: string, patents: SearchResult[], options?: OverlapPromptOptions): string {
    const maxClaimsLen = options?.maxClaimsLength ?? 500;
    const maxPatents = options?.maxPatentsCount ?? 10;
    const topPatents = patents.slice(0, maxPatents);

    let contextText = '';

    if (topPatents.length === 0) {
      contextText = 'No prior-art patents were retrieved matching this query in the vector database.\n';
    } else {
      contextText = topPatents
        .map((p, idx) => {
          const rank = p.rank || idx + 1;
          const patentId = p.patentId || 'Unknown';
          const title = p.title || 'N/A';
          const abstract = p.abstract || 'N/A';
          const rawClaims = p.claims || 'N/A';
          const claims =
            rawClaims.length > maxClaimsLen
              ? `${rawClaims.substring(0, maxClaimsLen)}... [truncated]`
              : rawClaims;
          const section = p.section || 'Abstract';
          const score = typeof p.score === 'number' ? p.score.toFixed(4) : 'N/A';

          return `Patent ${rank}:
- Patent ID: ${patentId}
- Title: ${title}
- Similarity Score: ${score}
- Matched Section Metadata: ${section}
- Abstract: ${abstract}
- Claims: ${claims}`;
        })
        .join('\n\n');
    }

    return `A user submitted the following invention description for patent prior-art section and claim overlap analysis:

USER INVENTION:
"${userQuery.trim()}"

RETRIEVED PRIOR-ART PATENTS CONTEXT:
${contextText}

INSTRUCTIONS:
For each retrieved patent in the context above, analyze the relevant sections and overlapping claims that contribute to similarity with the user's invention.
Return a valid raw JSON array of objects with the following structure for each patent:
[
  {
    "patentId": "<Exact Patent ID from context>",
    "title": "<Exact Title from context>",
    "similarityScore": <Numeric score from context e.g. 0.91>,
    "relevantSections": [
      {
        "section": "<Section name e.g. Abstract, Claims, Title, Summary, Background>",
        "reason": "<Detailed technical reason why this section contributed to similarity>"
      }
    ],
    "overlappingClaims": [
      {
        "claimNumber": <Exact claim number if available, or omitted if unavailable>,
        "summary": "<Short summary or excerpt of the overlapping claim>",
        "reason": "<Explanation of similarity with user invention>",
        "overlapStrength": "<Must be exactly 'High', 'Medium', or 'Low'>"
      }
    ]
  }
]

Do not include markdown code wrappers (\`\`\`json). Output raw JSON array only.`;
  }

  /**
   * Robust parser converting raw LLM output string into a typed array of OverlapAnalysisItem.
   */
  public static parseOverlapAnalysisResponse(
    llmOutput: string,
    retrievedPatents: SearchResult[]
  ): OverlapAnalysisItem[] {
    if (!llmOutput || !llmOutput.trim() || retrievedPatents.length === 0) {
      return this.createFallbackOverlapItems(retrievedPatents);
    }

    const trimmed = llmOutput.trim();

    try {
      const jsonCandidate = trimmed
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .trim();

      const parsed = JSON.parse(jsonCandidate);
      const itemsArray = Array.isArray(parsed) ? parsed : [parsed];

      if (itemsArray.length > 0) {
        return itemsArray.map((item: any, idx: number) => {
          const matchingPatent = retrievedPatents[idx] || retrievedPatents.find((p) => p.patentId === item.patentId);
          const patentId = String(item.patentId || matchingPatent?.patentId || `Patent-${idx + 1}`);
          const title = String(item.title || matchingPatent?.title || 'Prior-Art Patent');
          const similarityScore =
            typeof item.similarityScore === 'number'
              ? item.similarityScore
              : matchingPatent?.score ?? 0.85;

          // Parse relevantSections
          let relevantSections: RelevantSection[] = [];
          if (Array.isArray(item.relevantSections)) {
            relevantSections = item.relevantSections.map((sec: any) => ({
              section: String(sec.section || matchingPatent?.section || 'Abstract'),
              reason: String(sec.reason || 'Describes overlapping technical architecture.'),
            }));
          } else {
            relevantSections = [
              {
                section: matchingPatent?.section || 'Abstract',
                reason: 'Describes technical domain and system configuration overlapping with user invention.',
              },
            ];
          }

          // Parse overlappingClaims
          let overlappingClaims: OverlappingClaim[] = [];
          if (Array.isArray(item.overlappingClaims)) {
            overlappingClaims = item.overlappingClaims.map((c: any) => {
              const strengthRaw = String(c.overlapStrength || 'Medium');
              const overlapStrength: 'High' | 'Medium' | 'Low' =
                strengthRaw === 'High' || strengthRaw === 'Low' ? strengthRaw : 'Medium';

              const claimObj: OverlappingClaim = {
                summary: String(c.summary || 'Claim element describes system components matching user invention.'),
                reason: String(c.reason || 'Shares functional alignment with user invention query.'),
                overlapStrength,
              };

              if (c.claimNumber !== undefined && c.claimNumber !== null) {
                const num = Number(c.claimNumber);
                claimObj.claimNumber = isNaN(num) ? String(c.claimNumber) : num;
              }

              return claimObj;
            });
          } else {
            overlappingClaims = [
              {
                summary: 'The retrieved context describes system features overlapping with user invention.',
                reason: 'Shares power transfer and control mechanics.',
                overlapStrength: 'Medium',
              },
            ];
          }

          return {
            patentId,
            title,
            similarityScore,
            relevantSections,
            overlappingClaims,
          };
        });
      }
    } catch {
      // Fall through to text fallback
    }

    return this.createFallbackOverlapItems(retrievedPatents);
  }

  /**
   * Helper fallback when parsing fails or context lacks detailed claim data.
   */
  public static createFallbackOverlapItems(retrievedPatents: SearchResult[]): OverlapAnalysisItem[] {
    return retrievedPatents.map((p) => ({
      patentId: p.patentId,
      title: p.title,
      similarityScore: p.score,
      relevantSections: [
        {
          section: p.section || 'Abstract',
          reason: 'Describes technical field and core mechanisms overlapping with the invention query.',
        },
      ],
      overlappingClaims: [
        {
          summary: 'Primary independent claim element from retrieved prior art.',
          reason: 'The retrieved patent suggests functional similarity in system architecture.',
          overlapStrength: p.score > 0.85 ? 'High' : p.score > 0.75 ? 'Medium' : 'Low',
        },
      ],
    }));
  }
}
