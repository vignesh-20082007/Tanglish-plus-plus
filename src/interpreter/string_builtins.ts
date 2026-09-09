/**
 * Python-compatible string algorithms and helpers for Tanglish++ (T++)
 * Implements: len, capitalize, centre/center, find, isalnum, isalpha, isdigit,
 *             lower, islower, isupper, upper, title, swapcase, count
 */

export function adjustSlice(length: number, start?: number, end?: number): [number, number] {
  let s = start === undefined || start === null ? 0 : Number(start);
  let e = end === undefined || end === null ? length : Number(end);
  if (s < 0) s = Math.max(0, length + s);
  if (s > length) s = length;
  if (e < 0) e = Math.max(0, length + e);
  if (e > length) e = length;
  if (s > e) s = e;
  return [s, e];
}

export function pyLen(val: any): number {
  if (typeof val === 'string' || Array.isArray(val)) {
    return val.length;
  }
  if (val && typeof val === 'object') {
    return Object.keys(val).length;
  }
  throw new TypeError(`'${typeof val}' len() support pannaadhu`);
}

export function pyCapitalize(s: string): string {
  if (!s || s.length === 0) return '';
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

export function pyCenter(s: string, width: number, fillchar: string = ' '): string {
  const w = Math.floor(Number(width) || 0);
  if (w <= s.length) return s;
  const fill = (fillchar && fillchar.length > 0) ? fillchar[0] : ' ';
  const pad = w - s.length;
  const leftPad = Math.floor(pad / 2);
  const rightPad = pad - leftPad;
  return fill.repeat(leftPad) + s + fill.repeat(rightPad);
}

export function pyFind(s: string, sub: string, start?: number, end?: number): number {
  const [sliceStart, sliceEnd] = adjustSlice(s.length, start, end);
  if (sub === '') return sliceStart;
  const targetSlice = s.slice(sliceStart, sliceEnd);
  const idx = targetSlice.indexOf(sub);
  return idx === -1 ? -1 : sliceStart + idx;
}

export function pyIsAlnum(s: string): boolean {
  if (!s || s.length === 0) return false;
  return /^[\p{L}\p{N}]+$/u.test(s);
}

export function pyIsAlpha(s: string): boolean {
  if (!s || s.length === 0) return false;
  return /^\p{L}+$/u.test(s);
}

export function pyIsDigit(s: string): boolean {
  if (!s || s.length === 0) return false;
  return /^\p{Nd}+$/u.test(s);
}

export function pyLower(s: string): string {
  return s.toLowerCase();
}

export function pyIsLower(s: string): boolean {
  if (!s || s.length === 0) return false;
  let hasCased = false;
  for (const ch of s) {
    if (ch.toLowerCase() !== ch.toUpperCase()) {
      hasCased = true;
      if (ch !== ch.toLowerCase()) return false;
    }
  }
  return hasCased;
}

export function pyIsUpper(s: string): boolean {
  if (!s || s.length === 0) return false;
  let hasCased = false;
  for (const ch of s) {
    if (ch.toLowerCase() !== ch.toUpperCase()) {
      hasCased = true;
      if (ch !== ch.toUpperCase()) return false;
    }
  }
  return hasCased;
}

export function pyUpper(s: string): string {
  return s.toUpperCase();
}

export function pyTitle(s: string): string {
  let result = '';
  let prevIsCased = false;
  for (const ch of s) {
    const isCased = ch.toLowerCase() !== ch.toUpperCase();
    if (isCased) {
      if (!prevIsCased) {
        result += ch.toUpperCase();
      } else {
        result += ch.toLowerCase();
      }
      prevIsCased = true;
    } else {
      result += ch;
      prevIsCased = false;
    }
  }
  return result;
}

export function pySwapCase(s: string): string {
  let result = '';
  for (const ch of s) {
    const lower = ch.toLowerCase();
    const upper = ch.toUpperCase();
    if (ch === lower && ch !== upper) {
      result += upper;
    } else if (ch === upper && ch !== lower) {
      result += lower;
    } else {
      result += ch;
    }
  }
  return result;
}

export function pyCount(
  target: string | any[],
  sub: any,
  start?: number,
  end?: number,
  isEqual?: (a: any, b: any) => boolean
): number {
  if (typeof target === 'string') {
    const strSub = String(sub);
    const [sStart, sEnd] = adjustSlice(target.length, start, end);
    const slice = target.slice(sStart, sEnd);
    if (strSub === '') return slice.length + 1;
    let count = 0;
    let pos = 0;
    while ((pos = slice.indexOf(strSub, pos)) !== -1) {
      count++;
      pos += strSub.length;
    }
    return count;
  }

  if (Array.isArray(target)) {
    const [sStart, sEnd] = adjustSlice(target.length, start, end);
    const slice = target.slice(sStart, sEnd);
    const eq = isEqual || ((a: any, b: any) => a === b);
    return slice.filter(x => eq(x, sub)).length;
  }

  return 0;
}
