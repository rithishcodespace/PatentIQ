import { describe, it, expect } from 'vitest';
import { TextNormalizer } from '../../../src/modules/upload/utils/text-normalizer.js';

describe('TextNormalizer Unit Tests', () => {
  describe('normalize', () => {
    it('should strip Unicode control characters and normalize CRLF line endings', () => {
      const raw = 'Title:\u0000 Wireless Drone\r\n\r\nAbstract:\u0007\tInductive charging.\r\n';
      const normalized = TextNormalizer.normalize(raw);

      expect(normalized).not.toContain('\u0000');
      expect(normalized).not.toContain('\u0007');
      expect(normalized).not.toContain('\r\n');
      expect(normalized).toContain('Title: Wireless Drone');
      expect(normalized).toContain('Abstract: Inductive charging.');
    });

    it('should convert inline tabs and duplicate horizontal spaces to single spaces while preserving paragraph breaks', () => {
      const raw = 'Paragraph 1  with   extra    spaces.\t\tAnd tabs.\n\nParagraph 2\n\n\nParagraph 3';
      const normalized = TextNormalizer.normalize(raw);

      expect(normalized).toBe('Paragraph 1 with extra spaces. And tabs.\n\nParagraph 2\n\nParagraph 3');
    });

    it('should preserve numbering and claim order', () => {
      const raw = '1. A wireless system.\n2. The system of claim 1, further comprising:\n   [0001] A secondary coil.';
      const normalized = TextNormalizer.normalize(raw);

      expect(normalized).toContain('1. A wireless system.');
      expect(normalized).toContain('2. The system of claim 1, further comprising:');
      expect(normalized).toContain('[0001] A secondary coil.');
    });
  });

  describe('normalizeKeywords', () => {
    it('should trim, clean, filter empty, and deduplicate keywords case-insensitively', () => {
      const input = ['  Wireless  ', 'charging', 'WIRELESS', '', '   ', 'drone'];
      const keywords = TextNormalizer.normalizeKeywords(input);

      expect(keywords).toEqual(['Wireless', 'charging', 'drone']);
    });
  });

  describe('extractPatentSections', () => {
    it('should parse explicit section headers correctly', () => {
      const rawDoc = `Title: Smart Grid Battery System
Abstract: High efficiency power storage for grids.
Claims: 1. A grid battery comprising lithium cells.
Keywords: battery, grid, power`;

      const result = TextNormalizer.extractPatentSections(rawDoc);

      expect(result.title).toBe('Smart Grid Battery System');
      expect(result.abstract).toBe('High efficiency power storage for grids.');
      expect(result.claims).toBe('1. A grid battery comprising lithium cells.');
      expect(result.keywords).toEqual(['battery', 'grid', 'power']);
      expect(result.fullText).toContain('Smart Grid Battery System');
    });

    it('should fallback gracefully when section headers are absent', () => {
      const rawDoc = `Solar Panel Mounting Bracket

This invention relates to an adjustable mounting bracket for photovoltaic panels.

1. An adjustable bracket comprising a swivel hinge and locking pin.`;

      const result = TextNormalizer.extractPatentSections(rawDoc, undefined, 'solar_panel.txt');

      expect(result.title).toBe('Solar Panel Mounting Bracket');
      expect(result.abstract).toContain('This invention relates to an adjustable mounting bracket');
      expect(result.claims).toContain('1. An adjustable bracket comprising a swivel hinge');
      expect(result.keywords).toEqual([]);
    });
  });

  describe('fromDirectText', () => {
    it('should produce standardized output object from direct text input', () => {
      const result = TextNormalizer.fromDirectText(
        ' Wireless Drone ',
        ' Resonant inductive charging. ',
        ' 1. A drone receiver. ',
        ['wireless', 'DRONE']
      );

      expect(result.title).toBe('Wireless Drone');
      expect(result.abstract).toBe('Resonant inductive charging.');
      expect(result.claims).toBe('1. A drone receiver.');
      expect(result.keywords).toEqual(['wireless', 'DRONE']);
      expect(result.fullText).toBe(
        'Title: Wireless Drone\n\nAbstract:\nResonant inductive charging.\n\nClaims:\n1. A drone receiver.\n\nKeywords: wireless, DRONE'
      );
    });
  });
});
