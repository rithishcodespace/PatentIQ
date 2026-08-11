import type { SearchResult } from '../interfaces/search.interface.js';

export interface ProvenanceValidationResult {
  isValid: boolean;
  patentId: string;
  publicationNumber?: string | undefined;
  sourceUrl?: string | undefined;
  status: 'VERIFIED' | 'FAILED_MISMATCH' | 'UNVERIFIED';
  violations: string[];
}

export interface ProvenanceValidationOptions {
  strictMode?: boolean; // If true, filter out results with provenance violations
  logViolations?: boolean;
}

/**
 * Strict Patent Provenance Validator Service.
 * Ensures that patentId, publicationNumber, title, abstract, metadata, and sourceUrl
 * all belong to the EXACT SAME patent without cross-contamination.
 */
export class PatentProvenanceValidator {
  /**
   * Normalizes patent IDs and publication numbers to standard alphanumeric canonical format.
   * e.g. "US-9876543-B2" -> "US9876543B2", "9876543" -> "US9876543", "US 10,001" -> "US10001"
   */
  public static normalizePatentId(id: string | null | undefined): string {
    if (!id) return '';
    let cleaned = id.trim().toUpperCase().replace(/[\s\-\,\.]/g, '');
    if (/^\d+/.test(cleaned)) {
      cleaned = `US${cleaned}`;
    }
    return cleaned;
  }

  /**
   * Extracts patent publication numbers embedded in URLs or text strings.
   * e.g. "https://patents.google.com/patent/US9876543B2/en" -> ["US9876543B2"]
   */
  public static extractPatentNumbersFromText(text: string | null | undefined): string[] {
    if (!text) return [];
    const matches = text.match(/\b(?:US)?[0-9]{6,11}(?:[A-Z][0-9]?)?\b/gi) || [];
    return Array.from(new Set(matches.map((m) => PatentProvenanceValidator.normalizePatentId(m))));
  }

  /**
   * Validates a single search result for strict patent provenance integrity.
   */
  public validateResult(result: SearchResult): ProvenanceValidationResult {
    const violations: string[] = [];
    const rawId = result.patentId;
    const rawPubNum = result.publicationNumber;
    const rawUrl = result.sourceUrl;

    const canonicalId = PatentProvenanceValidator.normalizePatentId(rawId);
    const canonicalPubNum = PatentProvenanceValidator.normalizePatentId(rawPubNum);

    // 1. Mandatory Field Checks
    if (!rawId || !rawId.trim()) {
      violations.push('MISSING_PATENT_ID: Search result lacks a valid patentId.');
    }
    if (!result.title || !result.title.trim()) {
      violations.push('MISSING_TITLE: Search result lacks a valid patent title.');
    }
    if (!result.abstract || !result.abstract.trim()) {
      violations.push('MISSING_ABSTRACT: Search result lacks a valid patent abstract.');
    }

    // 2. Patent ID vs Publication Number Consistency
    if (canonicalId && canonicalPubNum) {
      // Check if one is prefix/base of the other (e.g. US9876543 vs US9876543B2)
      const baseId = canonicalId.replace(/[A-Z][0-9]?$/, '');
      const basePub = canonicalPubNum.replace(/[A-Z][0-9]?$/, '');

      if (baseId !== basePub && canonicalId !== canonicalPubNum) {
        violations.push(
          `ID_PUBLICATION_MISMATCH: patentId (${rawId}) does not match publicationNumber (${rawPubNum}).`
        );
      }
    }

    // 3. Source URL Provenance Verification
    if (rawUrl && rawUrl.trim()) {
      const urlPatentNumbers = PatentProvenanceValidator.extractPatentNumbersFromText(rawUrl);
      if (urlPatentNumbers.length > 0 && canonicalId) {
        const baseId = canonicalId.replace(/[A-Z][0-9]?$/, '');
        const urlMatchesId = urlPatentNumbers.some(
          (num) => num === canonicalId || num.replace(/[A-Z][0-9]?$/, '') === baseId
        );
        if (!urlMatchesId) {
          violations.push(
            `SOURCE_URL_MISMATCH: sourceUrl (${rawUrl}) references patent ${urlPatentNumbers.join(', ')} which conflicts with patentId (${rawId}).`
          );
        }
      }
    }

    // 4. Content Cross-Contamination Check (Title / Abstract)
    if (result.title) {
      const titlePatentNumbers = PatentProvenanceValidator.extractPatentNumbersFromText(result.title);
      if (titlePatentNumbers.length > 0 && canonicalId) {
        const baseId = canonicalId.replace(/[A-Z][0-9]?$/, '');
        const conflictingInTitle = titlePatentNumbers.filter(
          (num) => num !== canonicalId && num.replace(/[A-Z][0-9]?$/, '') !== baseId
        );
        if (conflictingInTitle.length > 0) {
          violations.push(
            `TITLE_CROSS_CONTAMINATION: Title explicitly mentions conflicting patent ${conflictingInTitle.join(', ')} while result is assigned to ${rawId}.`
          );
        }
      }
    }

    if (result.abstract) {
      const abstractPatentNumbers = PatentProvenanceValidator.extractPatentNumbersFromText(result.abstract);
      if (abstractPatentNumbers.length > 0 && canonicalId) {
        const baseId = canonicalId.replace(/[A-Z][0-9]?$/, '');
        const conflictingInAbstract = abstractPatentNumbers.filter(
          (num) => num !== canonicalId && num.replace(/[A-Z][0-9]?$/, '') !== baseId
        );
        if (conflictingInAbstract.length > 0) {
          violations.push(
            `ABSTRACT_CROSS_CONTAMINATION: Abstract explicitly mentions conflicting patent ${conflictingInAbstract.join(', ')} while result is assigned to ${rawId}.`
          );
        }
      }
    }

    const isValid = violations.length === 0;

    return {
      isValid,
      patentId: rawId,
      publicationNumber: rawPubNum,
      sourceUrl: rawUrl,
      status: isValid ? 'VERIFIED' : 'FAILED_MISMATCH',
      violations,
    };
  }

  /**
   * Processes a list of search results, annotating provenance verification metadata
   * and optionally excluding corrupted results in strict mode.
   */
  public validateAndFilterResults(
    results: SearchResult[],
    options: ProvenanceValidationOptions = { strictMode: true, logViolations: true }
  ): SearchResult[] {
    if (!results || results.length === 0) return [];

    const validatedList: SearchResult[] = [];

    for (const item of results) {
      const audit = this.validateResult(item);

      if (!audit.isValid) {
        if (options.logViolations) {
          console.warn(
            `[PatentProvenanceValidator] Provenance audit FAILED for patentId="${item.patentId}":`,
            audit.violations
          );
        }

        if (options.strictMode) {
          // Exclude corrupted mismatch results from API output
          continue;
        }
      }

      validatedList.push({
        ...item,
        provenanceVerified: audit.isValid,
        provenanceStatus: audit.status,
        provenanceViolations: audit.violations.length > 0 ? audit.violations : undefined,
      });
    }

    // Re-rank 1-based ranks after strict filtering
    return validatedList.map((item, idx) => ({
      ...item,
      rank: idx + 1,
      finalRank: idx + 1,
    }));
  }
}
