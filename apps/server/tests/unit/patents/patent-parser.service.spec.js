import { describe, it, expect } from 'vitest';
import { PatentCleanerUtils } from '../../../src/modules/patents/utils/patent-cleaner.utils.js';
import { PatentParserService } from '../../../src/modules/patents/services/patent-parser.service.js';
describe('PatentCleanerUtils Unit Tests', () => {
    it('should clean HTML tags and decode HTML entities', () => {
        const dirtyHtml = '<p>An <b>autonomous</b> drone system &amp; device &nbsp; with &lt;LiDAR&gt; sensors.</p>';
        const cleaned = PatentCleanerUtils.cleanText(dirtyHtml);
        expect(cleaned).toBe('An autonomous drone system & device with <LiDAR> sensors.');
    });
    it('should extract valid IPC classification codes', () => {
        const textWithIpc = 'Patent classification includes G06F 17/30 and H04L 29/06 as primary codes, along with A61K 31/00.';
        const codes = PatentCleanerUtils.extractIpcCodes(textWithIpc);
        expect(codes).toContain('G06F 17/30');
        expect(codes).toContain('H04L 29/06');
        expect(codes).toContain('A61K 31/00');
    });
});
describe('PatentParserService Unit Tests', () => {
    const parserService = new PatentParserService();
    it('should parse raw text with section headers into structured PatentSection', async () => {
        const rawPatentText = `
      Title: Autonomous Aerial Vehicle LiDAR Navigation
      Abstract: An autonomous drone system utilizing optical flow and LiDAR sensors for real-time obstacle avoidance.
      Claims:
      1. An autonomous aerial vehicle comprising a processor and LiDAR sensor.
      2. The vehicle of claim 1, further comprising an optical flow camera.
      Classification: G06F 17/30
    `;
        const parsed = await parserService.parseCsvOrText(rawPatentText);
        expect(parsed.title).toBe('Autonomous Aerial Vehicle LiDAR Navigation');
        expect(parsed.abstract).toContain('optical flow and LiDAR sensors');
        expect(parsed.claims.length).toBe(2);
        expect(parsed.claims[0]).toContain('1. An autonomous aerial vehicle');
        expect(parsed.ipcClassifications).toContain('G06F 17/30');
    });
    it('should parse CSV formatted patent text correctly', async () => {
        const csvContent = `title,abstract,claims,ipc\n"LiDAR Drone","Drone navigation system","1. A drone with LiDAR.",G06F 17/30`;
        const parsed = await parserService.parseCsvOrText(csvContent);
        expect(parsed.title).toBe('LiDAR Drone');
        expect(parsed.abstract).toBe('Drone navigation system');
        expect(parsed.claims).toContain('1. A drone with LiDAR.');
        expect(parsed.ipcClassifications).toContain('G06F 17/30');
    });
});
//# sourceMappingURL=patent-parser.service.spec.js.map