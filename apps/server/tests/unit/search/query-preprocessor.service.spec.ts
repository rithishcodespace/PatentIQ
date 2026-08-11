import { describe, it, expect } from 'vitest';
import { QueryPreprocessorService } from '../../../src/modules/search/services/query-preprocessor.service.js';

describe('QueryPreprocessorService Unit Tests Across Multiple Technical Domains', () => {
  const preprocessor = new QueryPreprocessorService();

  describe('1. Domain: Photonics & Fiber Optics', () => {
    it('should process multi-paragraph disclosure without hardcoded domain rules', () => {
      const queryText = `
        Title: Self-Healing Underground Fiber-Optic Cable Using Distributed Optical Sensing and Microcapsule-Based Localized Repair
        Problem Statement: Underground fiber optical cables suffer micro-cracks from thermal expansion.
        Technical Description: The assembly comprises a optical cable housing distributed optical sensing fibers and microcapsule repair agents.
        Components: fiber-optic cable, distributed optical sensing fibers, microcapsule units.
        Mechanisms: localized repair, optical sensing, thermal strain telemetry.
      `;

      const result = preprocessor.process(queryText);

      expect(result.originalQuery).toBe(queryText.trim());
      expect(result.title).toBe('Self-Healing Underground Fiber-Optic Cable Using Distributed Optical Sensing and Microcapsule-Based Localized Repair');
      
      // Verify preserved technical phrases
      expect(result.technicalPhrases).toContain('fiber-optic');
      expect(result.technicalPhrases).toContain('distributed optical sensing');
      
      // Verify components & mechanisms classification
      expect(result.components.some((c) => c.includes('cable') || c.includes('microcapsule'))).toBe(true);
      expect(result.mechanisms.some((m) => m.includes('sensing') || m.includes('repair'))).toBe(true);

      // Verify normalized query contains key terms
      expect(result.normalizedQuery).toContain('fiber-optic');
      expect(result.normalizedQuery).toContain('distributed optical sensing');
    });
  });

  describe('2. Domain: Agriculture & IoT', () => {
    it('should process soil moisture and automatic valve control query', () => {
      const queryText = `
        Automated Soil Moisture Sensor and Automatic Valve Control System
        An IoT irrigation apparatus incorporating a soil moisture sensor probe and an automatic valve control circuit.
      `;

      const result = preprocessor.process(queryText);

      expect(result.title).toBe('Automated Soil Moisture Sensor and Automatic Valve Control System');
      expect(result.technicalPhrases).toContain('soil moisture sensor');
      expect(result.technicalPhrases).toContain('automatic valve control');

      expect(result.components.some((c) => c.includes('soil moisture sensor'))).toBe(true);
      expect(result.mechanisms.some((m) => m.includes('automatic valve control'))).toBe(true);
    });
  });

  describe('3. Domain: Energy & Materials Science', () => {
    it('should process phase-change material thermal storage disclosure', () => {
      const queryText = `
        Thermal Energy Storage Using Phase-Change Material with Graphitic Nanoparticles
        Disclosed is a phase-change material thermal battery module incorporating graphitic nanoparticles to increase thermal conductivity.
      `;

      const result = preprocessor.process(queryText);

      expect(result.technicalPhrases).toContain('phase-change material');
      expect(result.technicalPhrases).toContain('graphitic nanoparticles');
      expect(result.components.some((c) => c.includes('material') || c.includes('nanoparticles'))).toBe(true);
    });
  });

  describe('4. Domain: Transportation & Predictive AI', () => {
    it('should process railway track predictive maintenance disclosure', () => {
      const queryText = `
        AI-Powered Railway Track Inspection and Predictive Maintenance System
        A railway track inspection vehicle utilizing ultrasonic transducers and deep neural network models for predictive maintenance.
      `;

      const result = preprocessor.process(queryText);

      expect(result.technicalPhrases).toContain('predictive maintenance');
      expect(result.technicalPhrases).toContain('railway track inspection');
      expect(result.mechanisms.some((m) => m.includes('predictive maintenance') || m.includes('inspection'))).toBe(true);
    });
  });

  describe('5. Edge Case & Stop-Word Downweighting', () => {
    it('should handle empty or whitespace queries gracefully', () => {
      const emptyResult = preprocessor.process('');
      expect(emptyResult.technicalTerms).toEqual([]);
      expect(emptyResult.normalizedQuery).toBe('');
    });

    it('should strip patent noise stop-words like "comprising", "apparatus", "method"', () => {
      const queryText = 'An apparatus comprising a method for doing something configured as a device';
      const result = preprocessor.process(queryText);

      expect(result.technicalPhrases).not.toContain('apparatus comprising');
      expect(result.technicalPhrases).not.toContain('method for');
    });
  });
});
