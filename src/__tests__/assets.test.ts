import { describe, it, expect } from 'vitest';
import {
  getImageUrl,
  getModImage,
  getShardImage,
  getDamageIcon,
  getPolarityIcon,
  assets,
} from '../utils/assets';

const CDN = 'https://cdn.warframestat.us/img/';

describe('getImageUrl', () => {
  it('returns CDN URL for a given image name', () => {
    expect(getImageUrl('test.png')).toBe(`${CDN}test.png`);
  });

  it('URL-encodes the image name', () => {
    expect(getImageUrl('foo bar.png')).toBe(`${CDN}foo%20bar.png`);
  });

  it('returns placeholder when imageName is empty', () => {
    expect(getImageUrl('')).toBe(`${CDN}placeholder.png`);
  });

  it('returns placeholder when imageName is undefined', () => {
    expect(getImageUrl()).toBe(`${CDN}placeholder.png`);
  });
});

describe('getShardImage', () => {
  it('generates normal shard URL', () => {
    expect(getShardImage('amber')).toBe(`${CDN}Shard_Amber.png`);
  });

  it('generates tauforged shard URL', () => {
    expect(getShardImage('azure', true)).toBe(`${CDN}Shard_Azure_Tau.png`);
  });

  it('capitalizes color name', () => {
    expect(getShardImage('CRIMSON')).toBe(`${CDN}Shard_Crimson.png`);
  });
});

describe('getDamageIcon', () => {
  it('returns CDN URL with capitalized type', () => {
    expect(getDamageIcon('heat')).toBe(`${CDN}Heat.png`);
    expect(getDamageIcon('SLASH')).toBe(`${CDN}Slash.png`);
  });

  it('trims whitespace', () => {
    expect(getDamageIcon('  viral  ')).toBe(`${CDN}Viral.png`);
  });
});

describe('getPolarityIcon', () => {
  it('returns CDN URL with capitalized polarity', () => {
    expect(getPolarityIcon('MADURAI')).toBe(`${CDN}Polarity_Madurai.png`);
    expect(getPolarityIcon('vazarin')).toBe(`${CDN}Polarity_Vazarin.png`);
  });
});

describe('getModImage', () => {
  it('uses getImageUrl with mod.imageName', () => {
    expect(getModImage({ imageName: 'mod.png' })).toBe(`${CDN}mod.png`);
  });

  it('falls back to placeholder when no imageName', () => {
    expect(getModImage({})).toBe(`${CDN}placeholder.png`);
  });
});

describe('assets namespace', () => {
  it('exports all URL builders', () => {
    expect(assets.getImageUrl).toBe(getImageUrl);
    expect(assets.getShardImage).toBe(getShardImage);
    expect(assets.getDamageIcon).toBe(getDamageIcon);
    expect(assets.getPolarityIcon).toBe(getPolarityIcon);
  });
});
