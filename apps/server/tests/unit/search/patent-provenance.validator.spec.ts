import { describe, it, expect } from 'vitest';
import { PatentProvenanceValidator } from '../../../src/modules/search/validators/patent-provenance.validator.js';
import type { SearchResult } from '../../../src/modules/search/interfaces/search.interface.js';
import { EVALUATION_CORPUS } from '../../evaluation/eval-runner.js';

describe('PatentProvenanceValidator Unit & Integration Tests', () => {
  const validator = new PatentProvenanceValidator();

  it('should verify patent ID normalization and patent number extraction', () => {
    expect(PatentProvenanceValidator.normalizePatentId('US-9876543-B2')).toBe('US9876543B2');
    expect(PatentProvenanceValidator.normalizePatentId('9876543')).toBe('US9876543');
    expect(PatentProvenanceValidator.normalizePatentId('US 10,001')).toBe('US10001');

    const url = 'https://patents.google.com/patent/US9876543B2/en';
    const extracted = PatentProvenanceValidator.extractPatentNumbersFromText(url);
    expect(extracted).toContain('US9876543B2');
  });

  it('should PASS valid patent results with consistent ID, publication number, title, abstract, and URL', () => {
    const validResult: SearchResult = {
      rank: 1,
      score: 0.95,
      patentId: 'US10001',
      publicationNumber: 'US-10001-B2',
      title: 'Wearable continuous glucose monitor with transdermal electrochemical sensor',
      abstract: 'Subcutaneous blood glucose monitoring patch comprising a flexible enzymatic electrode wire.',
      sourceUrl: 'https://patents.google.com/patent/US10001B2/en',
      ipc: 'A61B',
    };

    const audit = validator.validateResult(validResult);
    expect(audit.isValid).toBe(true);
    expect(audit.status).toBe('VERIFIED');
    expect(audit.violations).toHaveLength(0);
  });

  it('should FAIL validation when patentId and publicationNumber mismatch (Patent A ID + Patent B Pub Number)', () => {
    const corruptedResult: SearchResult = {
      rank: 1,
      score: 0.9,
      patentId: 'US10001', // Patent A ID
      publicationNumber: 'US9999999', // Patent B Publication Number mismatch
      title: 'Wearable continuous glucose monitor',
      abstract: 'Subcutaneous blood glucose monitoring patch.',
      sourceUrl: 'https://patents.google.com/patent/US10001/en',
      ipc: 'A61B',
    };

    const audit = validator.validateResult(corruptedResult);
    expect(audit.isValid).toBe(false);
    expect(audit.status).toBe('FAILED_MISMATCH');
    expect(audit.violations.some((v) => v.includes('ID_PUBLICATION_MISMATCH'))).toBe(true);
  });

  it('should FAIL validation when sourceUrl points to a different patent (Patent A ID + Patent C URL)', () => {
    const corruptedUrlResult: SearchResult = {
      rank: 1,
      score: 0.88,
      patentId: 'US10001', // Patent A ID
      publicationNumber: 'US10001',
      title: 'Wearable continuous glucose monitor',
      abstract: 'Subcutaneous blood glucose monitoring patch.',
      sourceUrl: 'https://patents.google.com/patent/US7777777B2/en', // Patent C URL mismatch
      ipc: 'A61B',
    };

    const audit = validator.validateResult(corruptedUrlResult);
    expect(audit.isValid).toBe(false);
    expect(audit.status).toBe('FAILED_MISMATCH');
    expect(audit.violations.some((v) => v.includes('SOURCE_URL_MISMATCH'))).toBe(true);
  });

  it('should FAIL validation when title contains conflicting patent references (Content Cross-Contamination)', () => {
    const crossContaminatedResult: SearchResult = {
      rank: 1,
      score: 0.85,
      patentId: 'US10001', // Patent A ID
      publicationNumber: 'US10001',
      title: 'System according to US-8888888 for autonomous drone inspection', // Conflicting Patent ID in title
      abstract: 'Subcutaneous blood glucose monitoring patch.',
      sourceUrl: 'https://patents.google.com/patent/US10001/en',
      ipc: 'A61B',
    };

    const audit = validator.validateResult(crossContaminatedResult);
    expect(audit.isValid).toBe(false);
    expect(audit.status).toBe('FAILED_MISMATCH');
    expect(audit.violations.some((v) => v.includes('TITLE_CROSS_CONTAMINATION'))).toBe(true);
  });

  it('should FAIL validation when required provenance fields (patentId, title, abstract) are missing', () => {
    const incompleteResult: SearchResult = {
      rank: 1,
      score: 0.8,
      patentId: '', // Missing ID
      title: '',
      abstract: '',
      ipc: 'A61B',
    };

    const audit = validator.validateResult(incompleteResult);
    expect(audit.isValid).toBe(false);
    expect(audit.violations.length).toBeGreaterThan(0);
  });

  it('should EXCLUDE corrupted mismatch results when strictMode is enabled in validateAndFilterResults', () => {
    const results: SearchResult[] = [
      {
        rank: 1,
        score: 0.95,
        patentId: 'US1001',
        publicationNumber: 'US1001',
        title: 'Autonomous drone agricultural crop inspection system using multispectral cameras',
        abstract: 'An agricultural drone equipped with multispectral imaging sensors.',
        sourceUrl: 'https://patents.google.com/patent/US1001/en',
        ipc: 'A01B',
      },
      {
        rank: 2,
        score: 0.90,
        patentId: 'US2001', // Patent A ID
        publicationNumber: 'US-99999-B2', // CORRUPTED: Mismatched pub number
        title: 'Corrupted Patent Title',
        abstract: 'Corrupted Abstract',
        sourceUrl: 'https://patents.google.com/patent/US88888/en',
        ipc: 'B25J',
      },
      {
        rank: 3,
        score: 0.85,
        patentId: 'US3001',
        publicationNumber: 'US3001',
        title: 'Zero-trust network access control with dynamic identity tokens',
        abstract: 'A cybersecurity architecture enforcing continuous zero-trust authentication.',
        sourceUrl: 'https://patents.google.com/patent/US3001/en',
        ipc: 'H04L',
      },
    ];

    const filtered = validator.validateAndFilterResults(results, { strictMode: true, logViolations: false });

    // The corrupted result (rank 2) MUST be excluded from the final API output list
    expect(filtered).toHaveLength(2);
    expect(filtered[0].patentId).toBe('US1001');
    expect(filtered[0].rank).toBe(1);
    expect(filtered[1].patentId).toBe('US3001');
    expect(filtered[1].rank).toBe(2);
  });

  it('should perform a strict provenance audit on at least 20 real retrieved patents from corpus', () => {
    const testPatents = EVALUATION_CORPUS.slice(0, 25);
    expect(testPatents.length).toBeGreaterThanOrEqual(20);

    const searchResults: SearchResult[] = testPatents.map((p, idx) => ({
      rank: idx + 1,
      score: 0.9 - idx * 0.01,
      patentId: p.patentId,
      publicationNumber: p.patentId,
      title: p.title,
      abstract: p.abstract,
      sourceUrl: `https://patents.google.com/patent/${p.patentId}/en`,
      ipc: p.ipc || 'G06F',
    }));

    const verifiedList = validator.validateAndFilterResults(searchResults, { strictMode: true, logViolations: false });

    expect(verifiedList).toHaveLength(testPatents.length);

    for (const res of verifiedList) {
      expect(res.provenanceVerified).toBe(true);
      expect(res.provenanceStatus).toBe('VERIFIED');
      expect(res.patentId).toBeDefined();
      expect(res.title).toBeDefined();
      expect(res.abstract).toBeDefined();
    }
  });
});
