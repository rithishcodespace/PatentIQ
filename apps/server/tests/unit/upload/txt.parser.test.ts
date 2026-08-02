import { describe, it, expect } from 'vitest';
import { TxtParser } from '../../../src/modules/upload/parsers/txt.parser.js';
import { BadRequestError } from '../../../src/common/errors/http-errors.js';

describe('TxtParser Unit Tests', () => {
  const parser = new TxtParser();

  it('should decode UTF-8 text and normalize line endings', async () => {
    const rawText = 'Line 1\r\nLine 2\rLine 3';
    const buffer = Buffer.from(rawText, 'utf-8');

    const result = await parser.parse(buffer);
    expect(result.bodyText).toBe('Line 1\nLine 2\nLine 3');
  });

  it('should throw BadRequestError on empty buffer', async () => {
    await expect(parser.parse(Buffer.alloc(0))).rejects.toThrow(BadRequestError);
  });

  it('should throw BadRequestError on whitespace-only TXT document', async () => {
    const buffer = Buffer.from('   \n\r\t   ');
    await expect(parser.parse(buffer)).rejects.toThrow('Document is empty');
  });
});
