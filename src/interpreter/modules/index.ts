// Tanglish++ Built-in Standard Library Modules
import { createExtendedModules } from './extended';

export interface VirtualFileNode {
  type: 'file' | 'dir';
  name: string;
  content?: string;
  children?: Map<string, VirtualFileNode>;
}

// In-Memory Virtual File System for 'os' module
export class VirtualFS {
  private root: VirtualFileNode = {
    type: 'dir',
    name: '',
    children: new Map(),
  };

  constructor() {
    this.initDefaultFS();
  }

  private initDefaultFS() {
    this.mkdir('/home');
    this.mkdir('/home/user');
    this.writeFile('/home/user/notes.txt', 'Vanakkam! Welcome to Tanglish++');
    this.writeFile('/home/user/program.tpp', 'sollu("Hello from T++!")');
  }

  private normalize(path: string): string[] {
    const parts = path.split('/').filter(p => p.length > 0 && p !== '.');
    const result: string[] = [];
    for (const part of parts) {
      if (part === '..') {
        result.pop();
      } else {
        result.push(part);
      }
    }
    return result;
  }

  public getNode(path: string): VirtualFileNode | null {
    const parts = this.normalize(path);
    let curr = this.root;
    for (const part of parts) {
      if (curr.type !== 'dir' || !curr.children) return null;
      const next = curr.children.get(part);
      if (!next) return null;
      curr = next;
    }
    return curr;
  }

  public exists(path: string): boolean {
    return this.getNode(path) !== null;
  }

  public mkdir(path: string): boolean {
    const parts = this.normalize(path);
    let curr = this.root;
    for (const part of parts) {
      if (!curr.children) curr.children = new Map();
      let next = curr.children.get(part);
      if (!next) {
        next = { type: 'dir', name: part, children: new Map() };
        curr.children.set(part, next);
      }
      curr = next;
    }
    return true;
  }

  public writeFile(path: string, content: string): boolean {
    const parts = this.normalize(path);
    if (parts.length === 0) return false;
    const fileName = parts.pop()!;
    const dirPath = '/' + parts.join('/');
    this.mkdir(dirPath);
    const dirNode = this.getNode(dirPath);
    if (dirNode && dirNode.type === 'dir' && dirNode.children) {
      dirNode.children.set(fileName, {
        type: 'file',
        name: fileName,
        content,
      });
      return true;
    }
    return false;
  }

  public listdir(path = '/'): string[] {
    const node = this.getNode(path);
    if (!node || node.type !== 'dir' || !node.children) {
      throw new Error(`FileNotFoundError: Paathai '${path}' illai (Directory not found)`);
    }
    return Array.from(node.children.keys());
  }

  public remove(path: string): boolean {
    const parts = this.normalize(path);
    if (parts.length === 0) return false;
    const name = parts.pop()!;
    const parentPath = '/' + parts.join('/');
    const parentNode = this.getNode(parentPath);
    if (parentNode && parentNode.children && parentNode.children.has(name)) {
      parentNode.children.delete(name);
      return true;
    }
    throw new Error(`FileNotFoundError: Paathai '${path}' illai (Path not found)`);
  }
}

export const globalVFS = new VirtualFS();

export class ExitException extends Error {
  code: number;
  constructor(code = 0) {
    super(`Program exited with status code ${code}`);
    this.name = 'ExitException';
    this.code = code;
  }
}

// Builtin Module Definitions
export function createBuiltinModules(): Record<string, Record<string, any>> {
  // 1. ganitham (Math)
  const ganitham = {
    PI: Math.PI,
    E: Math.E,
    sqrt: (x: number) => {
      if (x < 0) throw new Error("ValueError: Negative number-ku sqrt kidayadhu");
      return Math.sqrt(x);
    },
    pow: (x: number, y: number) => Math.pow(x, y),
    abs: (x: number) => Math.abs(x),
    floor: (x: number) => Math.floor(x),
    ceil: (x: number) => Math.ceil(x),
    round: (x: number, d = 0) => {
      const factor = Math.pow(10, d);
      return Math.round(x * factor) / factor;
    },
    sin: (x: number) => Math.sin(x),
    cos: (x: number) => Math.cos(x),
    tan: (x: number) => Math.tan(x),
    log: (x: number) => Math.log(x),
  };

  // 2. random
  const random = {
    randint: (a: number, b: number) => {
      const min = Math.ceil(a);
      const max = Math.floor(b);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    },
    random: () => Math.random(),
    choice: (arr: any[]) => {
      if (!Array.isArray(arr) || arr.length === 0) return null;
      return arr[Math.floor(Math.random() * arr.length)];
    },
  };

  // 3. neramkaalam (DateTime & Sleep)
  const neramkaalam = {
    ippozhuthu: () => new Date().toLocaleString(),
    thethi: () => {
      const d = new Date();
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    },
    neram: () => {
      const d = new Date();
      return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    },
    thoongu: async (seconds: number) => {
      const ms = Math.max(0, (seconds || 0) * 1000);
      await new Promise(resolve => setTimeout(resolve, ms));
      return null;
    },
  };

  // 4. os (Operating System & Virtual Files)
  const os = {
    name: 'tanglish-os',
    listdir: (path = '/home/user') => globalVFS.listdir(path),
    exists: (path: string) => globalVFS.exists(path),
    mkdir: (path: string) => globalVFS.mkdir(path),
    remove: (path: string) => globalVFS.remove(path),
    writeFile: (path: string, content: string) => globalVFS.writeFile(path, content),
  };

  // 5. json
  const json = {
    dumps: (obj: any, indent = 2) => JSON.stringify(obj, null, indent),
    loads: (str: string) => {
      try {
        return JSON.parse(str);
      } catch (err: any) {
        throw new Error(`JSONDecodeError: Sariyaana JSON illai - ${err.message}`);
      }
    },
  };

  // 6. kanakkeduppu (Statistics)
  const kanakkeduppu = {
    mean: (list: number[]) => {
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error("ValueError: mean() thevai empty illadha list");
      }
      const sum = list.reduce((acc, val) => acc + Number(val), 0);
      return sum / list.length;
    },
    median: (list: number[]) => {
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error("ValueError: median() thevai empty illadha list");
      }
      const sorted = [...list].map(Number).sort((a, b) => a - b);
      const mid = Math.floor(sorted.length / 2);
      if (sorted.length % 2 !== 0) {
        return sorted[mid];
      }
      return (sorted[mid - 1] + sorted[mid]) / 2;
    },
    mode: (list: any[]) => {
      if (!Array.isArray(list) || list.length === 0) {
        throw new Error("ValueError: mode() thevai empty illadha list");
      }
      const frequency: Record<string, number> = {};
      let maxCount = 0;
      let modeVal = list[0];
      for (const item of list) {
        const key = String(item);
        frequency[key] = (frequency[key] || 0) + 1;
        if (frequency[key] > maxCount) {
          maxCount = frequency[key];
          modeVal = item;
        }
      }
      return modeVal;
    },
  };

  // 7. sys
  const sys = {
    version: 'Tanglish++ 1.0.0 (V8/WebEngine)',
    platform: 'tanglish-web-browser',
    exit: (code = 0) => {
      throw new ExitException(code);
    },
  };

  // Extended 24 Modules
  const extended = createExtendedModules();

  return {
    ganitham,
    random,
    neramkaalam,
    os,
    json,
    kanakkeduppu,
    sys,
    ...extended,
  };
}

export * from './extended';
