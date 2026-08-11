import { describe, it, expect } from 'vitest';
import { SearchMapper } from '../../../src/modules/search/mappers/search.mapper.js';
import type { PineconeMatchResult, PineconeVectorMetadata } from '../../../src/modules/search/interfaces/search.interface.js';

describe('Patent Indexing & Chunk Metadata Integrity Suite', () => {
  describe('1. Metadata Integrity & Field Normalization', () => {
    it('should preserve all normalized metadata fields without fabricating missing values', () => {
      const rawMatch: PineconeMatchResult = {
        id: 'US9876543_claim_c1',
        score: 0.9421,
        metadata: {
          patentId: 'US9876543',
          publicationNumber: 'US9876543B2',
          sectionType: 'claim',
          chunkId: 'c1',
          claimNumber: 1,
          title: 'Autonomous Solar Panel Thermal Inspection System',
          abstract: 'An autonomous aerial drone equipped with thermal imaging sensors...',
          claims: '1. An autonomous inspection apparatus comprising...',
          description: 'Detailed specification describing quadcopter rotor control and thermal telemetry...',
          ipc: 'B64C 39/02',
          cpc: 'B64C 2201/12',
          country: 'US',
          owner: 'SolarTech Innovations LLC',
          applicants: 'SolarTech Innovations LLC',
          inventors: 'Dr. Jane Doe, Alan Smith',
          publicationDate: '2024-01-15',
          filingDate: '2022-06-10',
          priorityDate: '2021-12-01',
          sourceUrl: 'https://patents.google.com/patent/US9876543B2/en',
        },
      };

      const result = SearchMapper.toSearchResultDto(rawMatch, 1);

      expect(result.rank).toBe(1);
      expect(result.score).toBe(0.9421);
      expect(result.patentId).toBe('US9876543');
      expect(result.publicationNumber).toBe('US9876543B2');
      expect(result.title).toBe('Autonomous Solar Panel Thermal Inspection System');
      expect(result.abstract).toBe('An autonomous aerial drone equipped with thermal imaging sensors...');
      expect(result.claims).toBe('1. An autonomous inspection apparatus comprising...');
      expect(result.description).toBe('Detailed specification describing quadcopter rotor control and thermal telemetry...');
      expect(result.ipc).toBe('B64C 39/02');
      expect(result.cpc).toBe('B64C 2201/12');
      expect(result.country).toBe('US');
      expect(result.owner).toBe('SolarTech Innovations LLC');
      expect(result.applicants).toBe('SolarTech Innovations LLC');
      expect(result.inventors).toBe('Dr. Jane Doe, Alan Smith');
      expect(result.publicationDate).toBe('2024-01-15');
      expect(result.filingDate).toBe('2022-06-10');
      expect(result.priorityDate).toBe('2021-12-01');
      expect(result.sectionType).toBe('claim');
      expect(result.chunkId).toBe('c1');
      expect(result.claimNumber).toBe(1);
      expect(result.sourceUrl).toBe('https://patents.google.com/patent/US9876543B2/en');
    });

    it('should format array inventors/applicants into clean strings without fabrication', () => {
      const metaWithArrays: PineconeVectorMetadata = {
        patentId: 'EP1234567',
        ipc: 'G06F 17/00',
        inventors: ['Alice Johnson', 'Bob Williams'] as any,
        applicants: ['Robotics Ltd', 'AI Corp'] as any,
      };

      const result = SearchMapper.toSearchResultDto({ id: 'EP1234567_title', score: 0.85, metadata: metaWithArrays }, 1);

      expect(result.inventors).toBe('Alice Johnson, Bob Williams');
      expect(result.applicants).toBe('Robotics Ltd, AI Corp');
    });
  });

  describe('2. Patent & Chunk Association', () => {
    it('should map individual section chunks back to their parent patentId and publicationNumber', () => {
      const titleChunk: PineconeMatchResult = {
        id: 'US11223344_title_t0',
        score: 0.91,
        metadata: {
          patentId: 'US11223344',
          publicationNumber: 'US11223344B1',
          sectionType: 'title',
          chunkId: 't0',
          ipc: 'H04L 9/00',
        },
      };

      const claimChunk: PineconeMatchResult = {
        id: 'US11223344_claim_c2',
        score: 0.87,
        metadata: {
          patentId: 'US11223344',
          publicationNumber: 'US11223344B1',
          sectionType: 'claim',
          chunkId: 'c2',
          claimNumber: 2,
          ipc: 'H04L 9/00',
        },
      };

      const titleResult = SearchMapper.toSearchResultDto(titleChunk, 1);
      const claimResult = SearchMapper.toSearchResultDto(claimChunk, 2);

      expect(titleResult.patentId).toBe('US11223344');
      expect(titleResult.sectionType).toBe('title');
      expect(titleResult.chunkId).toBe('t0');

      expect(claimResult.patentId).toBe('US11223344');
      expect(claimResult.sectionType).toBe('claim');
      expect(claimResult.chunkId).toBe('c2');
      expect(claimResult.claimNumber).toBe(2);
    });
  });

  describe('3. Duplicate Patent Handling & Chunk Merging', () => {
    it('should deduplicate multiple chunks belonging to the same patent and merge missing section text', () => {
      const matches: PineconeMatchResult[] = [
        {
          id: 'US7788990_title_t0',
          score: 0.95,
          metadata: {
            patentId: 'US7788990',
            publicationNumber: 'US7788990',
            sectionType: 'title',
            title: 'High-Efficiency Photovoltaic Solar Inverter',
            ipc: 'H02M 7/00',
          },
        },
        {
          id: 'US7788990_abstract_a0',
          score: 0.92,
          metadata: {
            patentId: 'US7788990',
            publicationNumber: 'US7788990',
            sectionType: 'abstract',
            abstract: 'A photovoltaic inverter utilizing wide-bandgap silicon carbide switches...',
            ipc: 'H02M 7/00',
          },
        },
        {
          id: 'US7788990_claim_c1',
          score: 0.89,
          metadata: {
            patentId: 'US7788990',
            publicationNumber: 'US7788990',
            sectionType: 'claim',
            claimNumber: 1,
            claims: '1. A solar inverter circuit comprising a primary bridge...',
            ipc: 'H02M 7/00',
          },
        },
        {
          id: 'US5544332_title_t0',
          score: 0.80,
          metadata: {
            patentId: 'US5544332',
            publicationNumber: 'US5544332',
            sectionType: 'title',
            title: 'Unrelated Power Distribution Network',
            abstract: 'An electrical grid power monitoring unit...',
            ipc: 'H02J 13/00',
          },
        },
      ];

      const deduplicated = SearchMapper.toSearchResultList(matches, 10);

      expect(deduplicated.length).toBe(2);

      const topResult = deduplicated[0];
      expect(topResult.patentId).toBe('US7788990');
      expect(topResult.rank).toBe(1);
      expect(topResult.score).toBe(0.95);
      expect(topResult.title).toBe('High-Efficiency Photovoltaic Solar Inverter');
      expect(topResult.abstract).toBe('A photovoltaic inverter utilizing wide-bandgap silicon carbide switches...');
      expect(topResult.claims).toBe('1. A solar inverter circuit comprising a primary bridge...');

      const secondResult = deduplicated[1];
      expect(secondResult.patentId).toBe('US5544332');
      expect(secondResult.rank).toBe(2);
      expect(secondResult.score).toBe(0.80);
    });
  });

  describe('4. Missing Metadata Handling', () => {
    it('should keep optional fields as undefined when missing, without fabricating fake values', () => {
      const matchWithMissingFields: PineconeMatchResult = {
        id: 'WO2023000001_abstract',
        score: 0.7654,
        metadata: {
          patentId: 'WO2023000001',
          ipc: 'A61K 31/00',
          title: 'Novel Pharmaceutical Composition',
          abstract: 'A pharmaceutical composition for targeted drug delivery...',
        },
      };

      const result = SearchMapper.toSearchResultDto(matchWithMissingFields, 1);

      expect(result.patentId).toBe('WO2023000001');
      expect(result.claims).toBeUndefined();
      expect(result.description).toBeUndefined();
      expect(result.cpc).toBeUndefined();
      expect(result.country).toBeUndefined();
      expect(result.owner).toBeUndefined();
      expect(result.inventors).toBeUndefined();
      expect(result.publicationDate).toBeUndefined();
      expect(result.filingDate).toBeUndefined();
      expect(result.priorityDate).toBeUndefined();
    });
  });

  describe('5. Source URL Correctness', () => {
    it('should generate official Google Patents URL when explicit sourceUrl is absent', () => {
      const match1 = SearchMapper.toSearchResultDto(
        { id: '3939331_title', score: 0.9, metadata: { patentId: '3939331', ipc: 'B64C' } },
        1
      );
      expect(match1.sourceUrl).toBe('https://patents.google.com/patent/US3939331/en');

      const match2 = SearchMapper.toSearchResultDto(
        { id: 'EP0123456_title', score: 0.9, metadata: { patentId: 'EP0123456', ipc: 'G06F' } },
        2
      );
      expect(match2.sourceUrl).toBe('https://patents.google.com/patent/EP0123456/en');
    });

    it('should preserve explicit sourceUrl when provided in vector metadata', () => {
      const customUrlMatch = SearchMapper.toSearchResultDto(
        {
          id: 'PAT99_title',
          score: 0.9,
          metadata: {
            patentId: 'PAT99',
            ipc: 'B64C',
            sourceUrl: 'https://custom-patent-repository.org/patents/PAT99',
          },
        },
        1
      );
      expect(customUrlMatch.sourceUrl).toBe('https://custom-patent-repository.org/patents/PAT99');
    });
  });
});
