import { describe, it, expect } from 'vitest';
import { parseSRT, parseVTT, selectSubtitles } from '../utils/subtitleParser';

describe('subtitleParser', () => {
  describe('parseSRT', () => {
    it('should parse a valid SRT file', () => {
      const srtContent = `1
00:00:01,000 --> 00:00:03,000
Hello, world!

2
00:00:05,500 --> 00:00:08,000
This is a test subtitle.`;

      const result = parseSRT(srtContent);
      
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        index: 1,
        startTime: 1,
        endTime: 3,
        text: 'Hello, world!'
      });
    });
  });

  describe('parseVTT', () => {
    it('should parse a valid VTT file', () => {
      const vttContent = `WEBVTT

00:00:01.000 --> 00:00:03.000
Hello, world!

00:00:05.500 --> 00:00:08.000
This is a test subtitle.`;

      const result = parseVTT(vttContent);
      
      expect(result).toHaveLength(2);
      expect(result[0].startTime).toBe(1);
    });
  });

  describe('selectSubtitles', () => {
    it('should select evenly spaced subtitles', () => {
      const subtitles = Array.from({ length: 100 }, (_, i) => ({
        index: i + 1,
        startTime: i,
        endTime: i + 1,
        text: `Subtitle ${i + 1}`
      }));

      const selected = selectSubtitles(subtitles, 10);
      
      expect(selected).toHaveLength(10);
      expect(selected[0].index).toBe(1);
    });
  });
});
