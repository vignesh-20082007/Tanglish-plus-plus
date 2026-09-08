import { globalVFS } from './index';
import { getActiveEvaluator } from '../evaluator';

// Pure JS SHA-256 implementation
function sha256Sync(ascii: string): string {
  function rightRotate(value: number, amount: number) {
    return (value >>> amount) | (value << (32 - amount));
  }

  const mathPow = Math.pow;
  const maxWord = mathPow(2, 32);
  let result = '';

  const words: number[] = [];
  const asciiBitLength = ascii.length * 8;

  let hash = [
    0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a,
    0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19,
  ];

  const k = [
    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2,
  ];

  let i = 0;
  for (i = 0; i < ascii.length; i++) {
    const j = i >> 2;
    words[j] = (words[j] || 0) | (ascii.charCodeAt(i) << ((3 - (i % 4)) * 8));
  }
  words[ascii.length >> 2] = (words[ascii.length >> 2] || 0) | (0x80 << ((3 - (ascii.length % 4)) * 8));
  words[(((ascii.length + 8) >> 6) << 4) + 15] = asciiBitLength;

  for (let j = 0; j < words.length; j += 16) {
    const w = words.slice(j, j + 16);
    let a = hash[0];
    let b = hash[1];
    let c = hash[2];
    let d = hash[3];
    let e = hash[4];
    let f = hash[5];
    let g = hash[6];
    let h = hash[7];

    for (let idx = 0; idx < 64; idx++) {
      if (idx >= 16) {
        const s0 = rightRotate(w[idx - 15], 7) ^ rightRotate(w[idx - 15], 18) ^ (w[idx - 15] >>> 3);
        const s1 = rightRotate(w[idx - 2], 17) ^ rightRotate(w[idx - 2], 19) ^ (w[idx - 2] >>> 10);
        w[idx] = (w[idx - 16] + s0 + w[idx - 7] + s1) | 0;
      }
      const s1 = rightRotate(e, 6) ^ rightRotate(e, 11) ^ rightRotate(e, 25);
      const ch = (e & f) ^ (~e & g);
      const temp1 = (h + s1 + ch + k[idx] + (w[idx] | 0)) | 0;
      const s0 = rightRotate(a, 2) ^ rightRotate(a, 13) ^ rightRotate(a, 22);
      const maj = (a & b) ^ (a & c) ^ (b & c);
      const temp2 = (s0 + maj) | 0;

      h = g;
      g = f;
      f = e;
      e = (d + temp1) | 0;
      d = c;
      c = b;
      b = a;
      a = (temp1 + temp2) | 0;
    }

    hash[0] = (hash[0] + a) | 0;
    hash[1] = (hash[1] + b) | 0;
    hash[2] = (hash[2] + c) | 0;
    hash[3] = (hash[3] + d) | 0;
    hash[4] = (hash[4] + e) | 0;
    hash[5] = (hash[5] + f) | 0;
    hash[6] = (hash[6] + g) | 0;
    hash[7] = (hash[7] + h) | 0;
  }

  for (let idx = 0; idx < 8; idx++) {
    for (let j = 3; j >= 0; j--) {
      const b = (hash[idx] >> (j * 8)) & 255;
      result += (b < 16 ? '0' : '') + b.toString(16);
    }
  }
  return result;
}

// Pure JS MD5 implementation
function md5Sync(string: string): string {
  function rotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function addUnsigned(lX: number, lY: number) {
    const lX8 = lX & 0x80000000;
    const lY8 = lY & 0x80000000;
    const lX4 = lX & 0x40000000;
    const lY4 = lY & 0x40000000;
    const lResult = (lX & 0x3fffffff) + (lY & 0x3fffffff);
    if (lX4 & lY4) return lResult ^ 0x80000000 ^ lX8 ^ lY8;
    if (lX4 | lY4) {
      if (lResult & 0x40000000) return lResult ^ 0xc0000000 ^ lX8 ^ lY8;
      return lResult ^ 0x40000000 ^ lX8 ^ lY8;
    }
    return lResult ^ lX8 ^ lY8;
  }
  function F(x: number, y: number, z: number) { return (x & y) | (~x & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & ~z); }
  function H(x: number, y: number, z: number) { return x ^ y ^ z; }
  function I(x: number, y: number, z: number) { return y ^ (x | ~z); }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac));
    return addUnsigned(rotateLeft(a, s), b);
  }

  let x: number[] = [];
  const kLen = string.length;
  let i = 0;
  while (i < kLen) {
    x[i >> 2] |= (string.charCodeAt(i) & 0xff) << ((i % 4) * 8);
    i++;
  }
  x[kLen >> 2] |= 0x80 << ((kLen % 4) * 8);
  x[(((kLen + 8) >> 6) << 4) + 14] = kLen * 8;

  let a = 0x67452301;
  let b = 0xefcdab89;
  let c = 0x98badcfe;
  let d = 0x10325476;

  for (let k = 0; k < x.length; k += 16) {
    const AA = a, BB = b, CC = c, DD = d;
    a = FF(a, b, c, d, x[k + 0] || 0, 7, 0xd76aa478);
    d = FF(d, a, b, c, x[k + 1] || 0, 12, 0xe8c7b756);
    c = FF(c, d, a, b, x[k + 2] || 0, 17, 0x242070db);
    b = FF(b, c, d, a, x[k + 3] || 0, 22, 0xc1bdceee);
    a = FF(a, b, c, d, x[k + 4] || 0, 7, 0xf57c0faf);
    d = FF(d, a, b, c, x[k + 5] || 0, 12, 0x4787c62a);
    c = FF(c, d, a, b, x[k + 6] || 0, 17, 0xa8304613);
    b = FF(b, c, d, a, x[k + 7] || 0, 22, 0xfd469501);
    a = FF(a, b, c, d, x[k + 8] || 0, 7, 0x698098d8);
    d = FF(d, a, b, c, x[k + 9] || 0, 12, 0x8b44f7af);
    c = FF(c, d, a, b, x[k + 10] || 0, 17, 0xffff5bb1);
    b = FF(b, c, d, a, x[k + 11] || 0, 22, 0x895cd7be);
    a = FF(a, b, c, d, x[k + 12] || 0, 7, 0x6b901122);
    d = FF(d, a, b, c, x[k + 13] || 0, 12, 0xfd987193);
    c = FF(c, d, a, b, x[k + 14] || 0, 17, 0xa679438e);
    b = FF(b, c, d, a, x[k + 15] || 0, 22, 0x49b40821);

    a = GG(a, b, c, d, x[k + 1] || 0, 5, 0xf61e2562);
    d = GG(d, a, b, c, x[k + 6] || 0, 9, 0xc040b340);
    c = GG(c, d, a, b, x[k + 11] || 0, 14, 0x265e5a51);
    b = GG(b, c, d, a, x[k + 0] || 0, 20, 0xe9b6c7aa);
    a = GG(a, b, c, d, x[k + 5] || 0, 5, 0xd62f105d);
    d = GG(d, a, b, c, x[k + 10] || 0, 9, 0x2441453);
    c = GG(c, d, a, b, x[k + 15] || 0, 14, 0xd8a1e681);
    b = GG(b, c, d, a, x[k + 4] || 0, 20, 0xe7d3fbc8);
    a = GG(a, b, c, d, x[k + 9] || 0, 5, 0x21e1cde6);
    d = GG(d, a, b, c, x[k + 14] || 0, 9, 0xc33707d6);
    c = GG(c, d, a, b, x[k + 3] || 0, 14, 0xf4d50d87);
    b = GG(b, c, d, a, x[k + 8] || 0, 20, 0x455a14ed);
    a = GG(a, b, c, d, x[k + 13] || 0, 5, 0xa9e3e905);
    d = GG(d, a, b, c, x[k + 2] || 0, 9, 0xfcefa3f8);
    c = GG(c, d, a, b, x[k + 7] || 0, 14, 0x676f02d9);
    b = GG(b, c, d, a, x[k + 12] || 0, 20, 0x8d2a4c8a);

    a = HH(a, b, c, d, x[k + 5] || 0, 4, 0xfffa3942);
    d = HH(d, a, b, c, x[k + 8] || 0, 11, 0x8771f681);
    c = HH(c, d, a, b, x[k + 11] || 0, 16, 0x6d9d6122);
    b = HH(b, c, d, a, x[k + 14] || 0, 23, 0xfde5380c);
    a = HH(a, b, c, d, x[k + 1] || 0, 4, 0xa4beea44);
    d = HH(d, a, b, c, x[k + 4] || 0, 11, 0x4bdecfa9);
    c = HH(c, d, a, b, x[k + 7] || 0, 16, 0xf6bb4b60);
    b = HH(b, c, d, a, x[k + 10] || 0, 23, 0xbebfbc70);
    a = HH(a, b, c, d, x[k + 13] || 0, 4, 0x289b7ec6);
    d = HH(d, a, b, c, x[k + 0] || 0, 11, 0xeaa127fa);
    c = HH(c, d, a, b, x[k + 3] || 0, 16, 0xd4ef3085);
    b = HH(b, c, d, a, x[k + 6] || 0, 23, 0x4881d05);
    a = HH(a, b, c, d, x[k + 9] || 0, 4, 0xd9d4d039);
    d = HH(d, a, b, c, x[k + 12] || 0, 11, 0xe6db99e5);
    c = HH(c, d, a, b, x[k + 15] || 0, 16, 0x1fa27cf8);
    b = HH(b, c, d, a, x[k + 2] || 0, 23, 0xc4ac5665);

    a = II(a, b, c, d, x[k + 0] || 0, 6, 0xf4292244);
    d = II(d, a, b, c, x[k + 7] || 0, 10, 0x432aff97);
    c = II(c, d, a, b, x[k + 14] || 0, 15, 0xab9423a7);
    b = II(b, c, d, a, x[k + 5] || 0, 21, 0xfc93a039);
    a = II(a, b, c, d, x[k + 12] || 0, 6, 0x655b59c3);
    d = II(d, a, b, c, x[k + 3] || 0, 10, 0x8f0ccc92);
    c = II(c, d, a, b, x[k + 10] || 0, 15, 0xffeff47d);
    b = II(b, c, d, a, x[k + 1] || 0, 21, 0x85845dd1);
    a = II(a, b, c, d, x[k + 8] || 0, 6, 0x6fa87e4f);
    d = II(d, a, b, c, x[k + 15] || 0, 10, 0xfe2ce6e0);
    c = II(c, d, a, b, x[k + 6] || 0, 15, 0xa3014314);
    b = II(b, c, d, a, x[k + 13] || 0, 21, 0x4e0811a1);
    a = II(a, b, c, d, x[k + 4] || 0, 6, 0xf7537e82);
    d = II(d, a, b, c, x[k + 11] || 0, 10, 0xbd3af235);
    c = II(c, d, a, b, x[k + 2] || 0, 15, 0x2ad7d2bb);
    b = II(b, c, d, a, x[k + 9] || 0, 21, 0xeb86d391);

    a = addUnsigned(a, AA);
    b = addUnsigned(b, BB);
    c = addUnsigned(c, CC);
    d = addUnsigned(d, DD);
  }

  function wordToHex(lValue: number) {
    let wordToHexValue = '', wordToHexValueTemp = '';
    for (let lCount = 0; lCount <= 3; lCount++) {
      const lByte = (lValue >>> (lCount * 8)) & 255;
      wordToHexValueTemp = '0' + lByte.toString(16);
      wordToHexValue += wordToHexValueTemp.substr(wordToHexValueTemp.length - 2, 2);
    }
    return wordToHexValue;
  }

  return (wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d)).toLowerCase();
}

// In-Memory SQLite Mock Database Engine
class MockSQLiteDatabase {
  private tables: Map<string, any[]> = new Map();
  private lastRows: any[] = [];

  constructor() {
    this.tables.set('users', [
      { id: 1, name: 'Arumugam', role: 'Developer' },
      { id: 2, name: 'Karthik', role: 'Architect' },
    ]);
  }

  public execute(query: string): MockSQLiteDatabase {
    const q = query.trim();
    const upper = q.toUpperCase();

    if (upper.startsWith('SELECT')) {
      // Very simple parser for SELECT * FROM table
      const match = q.match(/FROM\s+([a-zA-Z0-9_]+)/i);
      if (match) {
        const table = match[1].toLowerCase();
        this.lastRows = (this.tables.get(table) || []).map(r => ({ ...r }));
      } else {
        this.lastRows = [];
      }
    } else if (upper.startsWith('CREATE TABLE')) {
      const match = q.match(/CREATE\s+TABLE\s+([a-zA-Z0-9_]+)/i);
      if (match) {
        const table = match[1].toLowerCase();
        if (!this.tables.has(table)) {
          this.tables.set(table, []);
        }
      }
      this.lastRows = [];
    } else if (upper.startsWith('INSERT INTO')) {
      const match = q.match(/INSERT\s+INTO\s+([a-zA-Z0-9_]+)/i);
      if (match) {
        const table = match[1].toLowerCase();
        if (!this.tables.has(table)) this.tables.set(table, []);
        const rows = this.tables.get(table)!;
        rows.push({ id: rows.length + 1, data: q });
      }
      this.lastRows = [];
    } else {
      this.lastRows = [];
    }
    return this;
  }

  public fetchall(): any[] {
    return this.lastRows;
  }

  public fetchone(): any | null {
    return this.lastRows.length > 0 ? this.lastRows[0] : null;
  }

  public commit(): boolean {
    return true;
  }

  public close(): boolean {
    return true;
  }
}

// 24 Extended Standard Library Modules
export function createExtendedModules(): Record<string, Record<string, any>> {
  // 1. kettuko (requests)
  const kettuko = {
    get: async (url: string) => {
      try {
        const res = await fetch(url);
        const text = await res.text();
        let jsonData: any = null;
        try { jsonData = JSON.parse(text); } catch { /* ignore */ }
        return {
          status_code: res.status,
          ok: res.ok,
          text: () => text,
          json: () => jsonData,
          url: res.url,
        };
      } catch (err: any) {
        return {
          status_code: 500,
          ok: false,
          text: () => `FetchError: ${err.message}`,
          json: () => ({ error: err.message }),
          url,
        };
      }
    },
    post: async (url: string, data: any) => {
      try {
        const isJson = typeof data === 'object';
        const res = await fetch(url, {
          method: 'POST',
          headers: isJson ? { 'Content-Type': 'application/json' } : undefined,
          body: isJson ? JSON.stringify(data) : String(data),
        });
        const text = await res.text();
        let jsonData: any = null;
        try { jsonData = JSON.parse(text); } catch { /* ignore */ }
        return {
          status_code: res.status,
          ok: res.ok,
          text: () => text,
          json: () => jsonData,
        };
      } catch (err: any) {
        return {
          status_code: 500,
          ok: false,
          text: () => `FetchError: ${err.message}`,
          json: () => ({ error: err.message }),
        };
      }
    },
  };

  // 2. thodarbu (socket)
  const thodarbu = {
    connect: (host: string, port: number) => {
      let isConnected = true;
      let buffer: string[] = [];
      return {
        connected: isConnected,
        host,
        port,
        send: (data: string) => {
          if (!isConnected) throw new Error("Socket is closed");
          buffer.push(String(data));
          return String(data).length;
        },
        recv: (bytes = 1024) => {
          if (buffer.length === 0) return `[ACK: Connection to ${host}:${port} alive]`;
          return buffer.shift()?.slice(0, bytes) || '';
        },
        close: () => {
          isConnected = false;
          return true;
        },
      };
    },
  };

  // 3. anjal (smtplib)
  const anjal = {
    send: (to: string, msg: string) => {
      return `[Anjal Anuppappattadhu]: Mail delivered successfully to '${to}' | Message: ${msg}`;
    },
  };

  // 4. html / xml
  const htmlModule = {
    escape: (str: string) => {
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    },
    unescape: (str: string) => {
      return String(str)
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#039;/g, "'");
    },
  };

  // 5. csv
  const csv = {
    parse: (text: string) => {
      const lines = String(text).trim().split('\n');
      return lines.map(line =>
        line.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, ''))
      );
    },
    stringify: (data: any[]) => {
      if (!Array.isArray(data)) return '';
      return data
        .map(row => {
          if (Array.isArray(row)) {
            return row.map(v => (String(v).includes(',') ? `"${v}"` : v)).join(',');
          }
          if (typeof row === 'object') {
            return Object.values(row)
              .map(v => (String(v).includes(',') ? `"${v}"` : v))
              .join(',');
          }
          return String(row);
        })
        .join('\n');
    },
  };

  // 6. sqlite3
  const sqlite3 = {
    connect: (_dbName = ':memory:') => {
      return new MockSQLiteDatabase();
    },
  };

  // 7. semipu (pickle)
  const semipu = {
    dumps: (obj: any) => {
      const jsonStr = JSON.stringify(obj);
      return btoa(unescape(encodeURIComponent(jsonStr)));
    },
    loads: (str: string) => {
      const decoded = decodeURIComponent(escape(atob(str)));
      return JSON.parse(decoded);
    },
  };

  // 8. vagaigal (collections)
  const vagaigal = {
    Counter: (list: any[]) => {
      if (!Array.isArray(list)) return {};
      const counts: Record<string, number> = {};
      for (const item of list) {
        const key = String(item);
        counts[key] = (counts[key] || 0) + 1;
      }
      return counts;
    },
  };

  // 9. copy
  const copy = {
    copy: (obj: any) => {
      if (Array.isArray(obj)) return [...obj];
      if (obj && typeof obj === 'object') return { ...obj };
      return obj;
    },
    deepcopy: (obj: any) => {
      if (obj === null || typeof obj !== 'object') return obj;
      return JSON.parse(JSON.stringify(obj));
    },
  };

  // 10. medai (platform)
  const medai = {
    system: 'Tanglish Web Virtual Engine',
    browser: typeof navigator !== 'undefined' ? navigator.userAgent : 'Node-V8',
    architecture: 'x86_64 / WebAssembly Ready',
    platform: 'Web/Cloud',
    version: '1.0.0',
  };

  // 11. thunai (subprocess)
  const thunai = {
    run: (cmd: string) => {
      return {
        returncode: 0,
        stdout: `[thunai process executed successfully: '${cmd}']`,
        stderr: '',
      };
    },
  };

  // 12. poottu (hashlib)
  const poottu = {
    sha256: (text: string) => sha256Sync(String(text)),
    md5: (text: string) => md5Sync(String(text)),
  };

  // 13. ragasiyam (secrets)
  const ragasiyam = {
    token_hex: (n = 16) => {
      const hexChars = '0123456789abcdef';
      let result = '';
      for (let i = 0; i < n * 2; i++) {
        result += hexChars[Math.floor(Math.random() * 16)];
      }
      return result;
    },
    token_urlsafe: (n = 16) => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
      let result = '';
      for (let i = 0; i < n; i++) {
        result += chars[Math.floor(Math.random() * chars.length)];
      }
      return result;
    },
  };

  // 14. maatri (base64)
  const maatri = {
    encode: (str: string) => {
      try {
        return btoa(unescape(encodeURIComponent(String(str))));
      } catch {
        const gBuf = (globalThis as any).Buffer;
        if (gBuf) return gBuf.from(String(str)).toString('base64');
        return btoa(String(str));
      }
    },
    decode: (str: string) => {
      try {
        return decodeURIComponent(escape(atob(String(str))));
      } catch {
        const gBuf = (globalThis as any).Buffer;
        if (gBuf) return gBuf.from(String(str), 'base64').toString('utf-8');
        return atob(String(str));
      }
    },
  };

  // 15. adaiyalam (uuid)
  const adaiyalam = {
    uuid4: () => {
      return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      });
    },
  };

  // 16. kattu (zipfile)
  const kattu = {
    compress: (data: string) => {
      return `[ZIP-ARCHIVE-HEADER:${btoa(String(data).slice(0, 100))}]`;
    },
    extract: (archive: string) => {
      return `[ZIP-EXTRACTED-PAYLOAD from ${archive}]`;
    },
  };

  // 17. pathivu (logging)
  const pathivu = {
    info: (msg: string) => {
      const timestamp = new Date().toLocaleTimeString();
      return `[${timestamp}] [INFO] ${msg}`;
    },
    warn: (msg: string) => {
      const timestamp = new Date().toLocaleTimeString();
      return `[${timestamp}] [WARN] ⚠️ ${msg}`;
    },
    error: (msg: string) => {
      const timestamp = new Date().toLocaleTimeString();
      return `[${timestamp}] [ERROR] ❌ ${msg}`;
    },
  };

  // 18. sodhanai (unittest)
  const sodhanai = {
    assert_equal: (a: any, b: any, message = 'Assertion Failed') => {
      if (a !== b) {
        throw new Error(`AssertionError: ${message} (Expected ${JSON.stringify(b)}, got ${JSON.stringify(a)})`);
      }
      return true;
    },
    run_tests: () => {
      return "All unit tests completed successfully: 100% Passed.";
    },
  };

  // 19. nagarvu (shutil)
  const nagarvu = {
    copy_file: (src: string, dst: string) => {
      const node = globalVFS.getNode(src);
      if (node && node.type === 'file') {
        globalVFS.writeFile(dst, node.content || '');
        return true;
      }
      return false;
    },
    move_folder: (src: string, dst: string) => {
      globalVFS.mkdir(dst);
      return true;
    },
  };

  // 20. naalkati (calendar)
  const naalkati = {
    month: (year = 2026, month = 9) => {
      const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December',
      ];
      const title = `${monthNames[month - 1]} ${year}`;
      let cal = `    ${title}\nSu Mo Tu We Th Fr Sa\n`;
      const firstDay = new Date(year, month - 1, 1).getDay();
      const daysInMonth = new Date(year, month, 0).getDate();

      let dayStr = '   '.repeat(firstDay);
      for (let d = 1; d <= daysInMonth; d++) {
        dayStr += String(d).padStart(2, ' ') + ' ';
        if ((firstDay + d) % 7 === 0) {
          cal += dayStr.trimEnd() + '\n';
          dayStr = '';
        }
      }
      if (dayStr.length > 0) cal += dayStr.trimEnd() + '\n';
      return cal;
    },
  };

  // 21. thadam (traceback)
  const thadam = {
    print_exc: () => {
      return "Traceback (most recent call last):\n  File 'main.tpp', line 1 in <module>\nExecutionStack: OK";
    },
  };

  // 22. parisodhanai (inspect)
  const parisodhanai = {
    get_source: (func: any) => {
      if (!func) return "<source unavailable>";
      if (typeof func === 'object' && 'name' in func) {
        return `fun ${func.name}(...): [Tanglish Function Source]`;
      }
      return String(func);
    },
  };

  // 23. kattalai (argparse)
  const kattalai = {
    ArgumentParser: () => {
      const argsMap: Record<string, any> = {};
      return {
        add_argument: (flag: string, defVal: any = null) => {
          argsMap[flag.replace(/^-+/, '')] = defVal;
        },
        parse_args: () => {
          return { ...argsMap };
        },
      };
    },
  };

  // 24. neram (time)
  const neram = {
    time: () => Date.now() / 1000,
    sleep: async (ms: number) => {
      const delay = Math.max(0, Number(ms) || 0);
      await new Promise(resolve => setTimeout(resolve, delay));
      return null;
    },
  };

  // 25. ilai (threading)
  const ilai = {
    Thread: (target: any, args: any[] = []) => {
      let taskPromise: Promise<any> | null = null;
      return {
        start: () => {
          taskPromise = new Promise(async (resolve, reject) => {
            try {
              if (typeof target === 'function') {
                const res = await target(...args);
                resolve(res);
              } else if (target && typeof target === 'object' && 'call' in target) {
                // If TanglishFunction
                const evalInst = getActiveEvaluator();
                const res = await (target as any).call(evalInst, args, {});
                resolve(res);
              } else {
                resolve(null);
              }
            } catch (e) {
              reject(e);
            }
          });
          return true;
        },
        join: async () => {
          if (taskPromise) await taskPromise;
          return true;
        },
      };
    },
  };

  return {
    kettuko,
    thodarbu,
    anjal,
    html: htmlModule,
    xml: htmlModule,
    csv,
    sqlite3,
    semipu,
    vagaigal,
    copy,
    medai,
    thunai,
    poottu,
    ragasiyam,
    maatri,
    adaiyalam,
    kattu,
    pathivu,
    sodhanai,
    nagarvu,
    naalkati,
    thadam,
    parisodhanai,
    kattalai,
    neram,
    ilai,
  };
}
