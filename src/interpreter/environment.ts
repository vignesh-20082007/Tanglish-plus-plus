export class NameError extends Error {
  constructor(name: string) {
    super(`NameError: '${name}' kandupidikka mudiyala (name '${name}' is not defined)`);
    this.name = 'NameError';
  }
}

export class Environment {
  private values: Map<string, any> = new Map();
  private parent: Environment | null = null;
  private globalVars: Set<string> = new Set();

  constructor(parent: Environment | null = null) {
    this.parent = parent;
  }

  public getParent(): Environment | null {
    return this.parent;
  }

  public getRoot(): Environment {
    let curr: Environment = this;
    while (curr.parent !== null) {
      curr = curr.parent;
    }
    return curr;
  }

  public markGlobal(name: string): void {
    this.globalVars.add(name);
  }

  public isMarkedGlobal(name: string): boolean {
    if (this.globalVars.has(name)) return true;
    return false;
  }

  public define(name: string, value: any): void {
    if (this.isMarkedGlobal(name)) {
      this.getRoot().values.set(name, value);
    } else {
      this.values.set(name, value);
    }
  }

  public assign(name: string, value: any): void {
    if (this.isMarkedGlobal(name)) {
      this.getRoot().values.set(name, value);
      return;
    }

    if (this.values.has(name)) {
      this.values.set(name, value);
      return;
    }

    // Check parent scopes
    if (this.parent !== null && this.parent.has(name)) {
      this.parent.assign(name, value);
      return;
    }

    // Default to local definition if not declared in enclosing scope
    this.values.set(name, value);
  }

  public lookup(name: string): any {
    if (this.isMarkedGlobal(name)) {
      const root = this.getRoot();
      if (root.values.has(name)) {
        return root.values.get(name);
      }
      throw new NameError(name);
    }

    if (this.values.has(name)) {
      return this.values.get(name);
    }

    if (this.parent !== null) {
      return this.parent.lookup(name);
    }

    throw new NameError(name);
  }

  public has(name: string): boolean {
    if (this.values.has(name)) return true;
    if (this.parent !== null) return this.parent.has(name);
    return false;
  }

  public getDirectKeys(): string[] {
    return Array.from(this.values.keys());
  }

  public getAllBindings(): Record<string, any> {
    const result: Record<string, any> = {};
    if (this.parent) {
      Object.assign(result, this.parent.getAllBindings());
    }
    this.values.forEach((v, k) => {
      result[k] = v;
    });
    return result;
  }
}
