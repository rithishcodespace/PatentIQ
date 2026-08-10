import { describe, it, expect, vi, beforeEach } from 'vitest';
import { FeatureDeconstructionService } from '../../../src/modules/rag/services/feature-deconstruction.service.js';
import { FeatureDeconstructionPromptBuilder } from '../../../src/modules/rag/prompts/feature-deconstruction.prompt.js';
import { BadRequestError } from '../../../src/common/errors/http-errors.js';
describe('FeatureDeconstructionService Unit Tests', () => {
    let mockLLMProvider;
    let service;
    beforeEach(() => {
        mockLLMProvider = {
            generateCompletion: vi.fn(),
        };
        service = new FeatureDeconstructionService(mockLLMProvider);
    });
    describe('Input Validation', () => {
        it('should throw BadRequestError if input text is empty or whitespace', async () => {
            await expect(service.deconstructInvention('')).rejects.toThrow(BadRequestError);
            await expect(service.deconstructInvention('   ')).rejects.toThrow(BadRequestError);
            await expect(service.deconstructInvention({ query: '' })).rejects.toThrow(BadRequestError);
        });
    });
    describe('LLM Extraction Success Path', () => {
        it('should extract structured features when LLM returns valid JSON', async () => {
            const mockJsonResponse = JSON.stringify({
                coreTitle: 'Smart Solar Water Purification System',
                technicalDomain: ['C02F 1/32', 'B01D 35/00'],
                extractedFeatures: [
                    {
                        id: 'F1',
                        name: 'UV-C LED Sterilization Reactor',
                        description: 'Integrated UV-C LED ring emitting at 265nm to neutralize waterborne pathogens.',
                        category: 'Hardware',
                        importance: 'CRITICAL',
                    },
                    {
                        id: 'F2',
                        name: 'IoT Water Quality Sensor Module',
                        description: 'Turbidity and TDS sensors providing real-time purity measurements via Bluetooth.',
                        category: 'Software / Electronics',
                        importance: 'HIGH',
                    },
                ],
            });
            mockLLMProvider.generateCompletion.mockResolvedValue(mockJsonResponse);
            const result = await service.deconstructInvention('Smart solar water bottle with UV-C LED sterilization and IoT quality sensors.');
            expect(result).toBeDefined();
            expect(result.coreTitle).toBe('Smart Solar Water Purification System');
            expect(result.technicalDomain).toEqual(['C02F 1/32', 'B01D 35/00']);
            expect(result.extractedFeatures).toHaveLength(2);
            expect(result.extractedFeatures[0]?.id).toBe('F1');
            expect(result.extractedFeatures[0]?.importance).toBe('CRITICAL');
            expect(result.isFallback).toBe(false);
        });
        it('should handle JSON responses wrapped in markdown code fences', async () => {
            const wrappedResponse = `\`\`\`json
{
  "coreTitle": "Inductive Charging Stand",
  "technicalDomain": ["H02J 50/10"],
  "extractedFeatures": [
    {
      "id": "F1",
      "name": "Resonant Primary Coil",
      "description": "Multi-turn copper coil generating dynamic magnetic flux.",
      "category": "Hardware",
      "importance": "CRITICAL"
    }
  ]
}
\`\`\``;
            mockLLMProvider.generateCompletion.mockResolvedValue(wrappedResponse);
            const result = await service.deconstructInvention('Inductive wireless charging stand.');
            expect(result.coreTitle).toBe('Inductive Charging Stand');
            expect(result.extractedFeatures).toHaveLength(1);
            expect(result.isFallback).toBe(false);
        });
    });
    describe('Heuristic Fallback Path', () => {
        it('should trigger heuristic fallback if LLM returns invalid non-JSON string', async () => {
            mockLLMProvider.generateCompletion.mockResolvedValue('I am a patent AI model. The invention is about solar water purification.');
            const result = await service.deconstructInvention('Smart solar water purification bottle with integrated UV-C LED and IoT quality monitoring.');
            expect(result).toBeDefined();
            expect(result.isFallback).toBe(true);
            expect(result.extractedFeatures.length).toBeGreaterThan(0);
            expect(result.extractedFeatures[0]?.id).toBe('F1');
        });
        it('should trigger heuristic fallback if LLM provider throws an exception', async () => {
            mockLLMProvider.generateCompletion.mockRejectedValue(new Error('Ollama service unavailable'));
            const result = await service.deconstructInvention('Dynamic torque screwdriver with digital pressure gauge and Bluetooth syncing.');
            expect(result).toBeDefined();
            expect(result.isFallback).toBe(true);
            expect(result.coreTitle).toBeDefined();
            expect(result.extractedFeatures.length).toBeGreaterThan(0);
        });
    });
    describe('FeatureDeconstructionPromptBuilder Unit Tests', () => {
        it('should generate system prompt and prompt containing user invention disclosure', () => {
            const sysPrompt = FeatureDeconstructionPromptBuilder.getSystemPrompt();
            const prompt = FeatureDeconstructionPromptBuilder.buildPrompt('Autonomous aerial drone delivery pod');
            expect(sysPrompt).toContain('senior patent attorney');
            expect(prompt).toContain('Autonomous aerial drone delivery pod');
        });
        it('createFallbackResult should extract features from multi-sentence text', () => {
            const fallback = FeatureDeconstructionPromptBuilder.createFallbackResult('First sentence describing solar panel array. Second sentence describing MPPT controller. Third sentence describing battery backup unit.');
            expect(fallback.isFallback).toBe(true);
            expect(fallback.extractedFeatures.length).toBeGreaterThanOrEqual(3);
        });
    });
});
//# sourceMappingURL=feature-deconstruction.service.spec.js.map