import { describe, it, expect } from 'vitest';
import { parseWhatsAppFormattingToHtml } from '../whatsapp';

describe('parseWhatsAppFormattingToHtml', () => {
  it('should convert newlines to <br/> tags', () => {
    const input = 'Hello\nWorld';
    const expected = 'Hello<br/>World';
    expect(parseWhatsAppFormattingToHtml(input)).toBe(expected);
  });

  it('should convert bold text (surrounded by *) to <strong> tags', () => {
    const input = 'Hello *bold* World';
    const expected = 'Hello <strong>bold</strong> World';
    expect(parseWhatsAppFormattingToHtml(input)).toBe(expected);
  });

  it('should convert italic text (surrounded by _) to <i> tags', () => {
    const input = 'Hello _italic_ World';
    const expected = 'Hello <i>italic</i> World';
    expect(parseWhatsAppFormattingToHtml(input)).toBe(expected);
  });

  it('should convert strikethrough text (surrounded by ~) to <s> tags', () => {
    const input = 'Hello ~strikethrough~ World';
    const expected = 'Hello <s>strikethrough</s> World';
    expect(parseWhatsAppFormattingToHtml(input)).toBe(expected);
  });

  it('should convert monospace text (surrounded by ```) to <tt> tags', () => {
    const input = 'Hello ```monospace``` World';
    const expected = 'Hello <tt>monospace</tt> World';
    expect(parseWhatsAppFormattingToHtml(input)).toBe(expected);
  });

  it('should handle multiple formatting in the same text', () => {
    const input = '*Bold* and _italic_ and ~strikethrough~ and ```monospace```';
    const expected =
      '<strong>Bold</strong> and <i>italic</i> and <s>strikethrough</s> and <tt>monospace</tt>';
    expect(parseWhatsAppFormattingToHtml(input)).toBe(expected);
  });

  it('should handle text with no formatting', () => {
    const input = 'Plain text without any formatting';
    expect(parseWhatsAppFormattingToHtml(input)).toBe(input);
  });

  it('should handle text with multiple newlines', () => {
    const input = 'Line 1\nLine 2\nLine 3';
    const expected = 'Line 1<br/>Line 2<br/>Line 3';
    expect(parseWhatsAppFormattingToHtml(input)).toBe(expected);
  });
});
