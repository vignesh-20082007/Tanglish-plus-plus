import {
  Statement,
  Expression,
  Program,
  AssignStatement,
  IfStatement,
  ForStatement,
  WhileStatement,
  FunctionDef,
  ReturnStatement,
  ClassDef,
  TryCatchStatement,
  GlobalStatement,
  ImportStatement,
  LiteralExpr,
  IdentifierExpr,
  BinaryExpr,
  UnaryExpr,
  LogicalExpr,
  CallExpr,
  IndexExpr,
  MemberExpr,
  ListLiteral,
  DictLiteral,
  LambdaExpr,
  DeleteStatement,
} from './ast';
import { Environment, NameError } from './environment';
import { createBuiltinModules, ExitException } from './modules';
import {
  pyLen,
  pyCapitalize,
  pyCenter,
  pyFind,
  pyIsAlnum,
  pyIsAlpha,
  pyIsDigit,
  pyLower,
  pyIsLower,
  pyIsUpper,
  pyUpper,
  pyTitle,
  pySwapCase,
  pyCount,
} from './string_builtins';
import {
  pyMax,
  pyMin,
  pySum,
  pyIndex,
  pySort,
} from './list_builtins';

// Control Flow Signals
export class ReturnSignal {
  value: any;
  constructor(value: any) {
    this.value = value;
  }
}

export class BreakSignal {}
export class ContinueSignal {}

// Tanglish Runtime Errors
export class RuntimeError extends Error {
  line?: number;
  col?: number;
  constructor(message: string, line?: number, col?: number) {
    super(line !== undefined ? `RuntimeError [Line ${line}, Col ${col}]: ${message}` : `RuntimeError: ${message}`);
    this.name = 'RuntimeError';
    this.line = line;
    this.col = col;
  }
}

export class TypeError extends RuntimeError {
  constructor(message: string, line?: number, col?: number) {
    super(`TypeError: ${message}`, line, col);
    this.name = 'TypeError';
  }
}

export class ValueError extends RuntimeError {
  constructor(message: string, line?: number, col?: number) {
    super(`ValueError: ${message}`, line, col);
    this.name = 'ValueError';
  }
}

export class IndexError extends RuntimeError {
  constructor(message: string, line?: number, col?: number) {
    super(`IndexError: ${message}`, line, col);
    this.name = 'IndexError';
  }
}

export class KeyError extends RuntimeError {
  constructor(key: string, line?: number, col?: number) {
    super(`KeyError: '${key}' dictionary-il illai (key not found)`, line, col);
    this.name = 'KeyError';
  }
}

export class ZeroDivisionError extends RuntimeError {
  constructor(line?: number, col?: number) {
    super(`ZeroDivisionError: Poojiyamal vakuka mudiyadhu (division by zero)`, line, col);
    this.name = 'ZeroDivisionError';
  }
}

export class ImportError extends RuntimeError {
  constructor(moduleName: string, line?: number, col?: number) {
    super(`ImportError: '${moduleName}' module kandupidikka mudiyala (module not found)`, line, col);
    this.name = 'ImportError';
  }
}

// Tanglish Class and Instance Types
export class TanglishClass {
  name: string;
  superClass?: TanglishClass;
  methods: Map<string, TanglishFunction> = new Map();

  constructor(name: string, superClass?: TanglishClass) {
    this.name = name;
    this.superClass = superClass;
  }

  findMethod(name: string): TanglishFunction | undefined {
    if (this.methods.has(name)) return this.methods.get(name);
    if (this.superClass) return this.superClass.findMethod(name);
    return undefined;
  }
}

export class TanglishInstance {
  klass: TanglishClass;
  fields: Map<string, any> = new Map();

  constructor(klass: TanglishClass) {
    this.klass = klass;
  }

  get(name: string, line?: number, col?: number): any {
    if (this.fields.has(name)) {
      return this.fields.get(name);
    }
    const method = this.klass.findMethod(name);
    if (method) {
      // Bind instance to 'ithu'
      return method.bind(this);
    }
    throw new RuntimeError(`AttributeError: '${this.klass.name}' instance-ku '${name}' attribute kidayadhu`, line, col);
  }

  set(name: string, value: any): void {
    this.fields.set(name, value);
  }
}

export interface Callable {
  call(evaluator: Evaluator, args: any[], kwargs: Record<string, any>, line?: number, col?: number): Promise<any>;
}

export class TanglishFunction implements Callable {
  name: string;
  params: string[];
  body: Statement[];
  closure: Environment;
  boundInstance?: TanglishInstance;

  constructor(name: string, params: string[], body: Statement[], closure: Environment, boundInstance?: TanglishInstance) {
    this.name = name;
    this.params = params;
    this.body = body;
    this.closure = closure;
    this.boundInstance = boundInstance;
  }

  bind(instance: TanglishInstance): TanglishFunction {
    return new TanglishFunction(this.name, this.params, this.body, this.closure, instance);
  }

  async call(evaluator: Evaluator, args: any[], kwargs: Record<string, any>, line?: number, col?: number): Promise<any> {
    const fnEnv = new Environment(this.closure);

    const actualArgs = [...args];
    if (this.boundInstance) {
      // If method, inject instance as 'ithu' (first parameter)
      actualArgs.unshift(this.boundInstance);
    }

    for (let i = 0; i < this.params.length; i++) {
      const paramName = this.params[i];
      let val = actualArgs[i];
      if (val === undefined && kwargs[paramName] !== undefined) {
        val = kwargs[paramName];
      }
      fnEnv.define(paramName, val !== undefined ? val : null);
    }

    try {
      await evaluator.executeBlock(this.body, fnEnv);
    } catch (err) {
      if (err instanceof ReturnSignal) {
        return err.value;
      }
      throw err;
    }

    return null;
  }
}

export class BuiltinFunction implements Callable {
  name: string;
  fn: (evaluator: Evaluator, args: any[], kwargs: Record<string, any>, line?: number, col?: number) => Promise<any> | any;

  constructor(name: string, fn: (evaluator: Evaluator, args: any[], kwargs: Record<string, any>, line?: number, col?: number) => Promise<any> | any) {
    this.name = name;
    this.fn = fn;
  }

  async call(evaluator: Evaluator, args: any[], kwargs: Record<string, any>, line?: number, col?: number): Promise<any> {
    return await this.fn(evaluator, args, kwargs, line, col);
  }
}

export interface EvaluatorOptions {
  onPrint?: (text: string) => void;
  onRequestInput?: (promptText: string) => Promise<string>;
  isCancelled?: () => boolean;
}

let activeEvaluatorInstance: Evaluator | null = null;
export function setActiveEvaluator(evaluator: Evaluator | null) {
  activeEvaluatorInstance = evaluator;
}
export function getActiveEvaluator(): Evaluator | null {
  return activeEvaluatorInstance;
}

export class Evaluator {
  private globalEnv: Environment;
  private currentEnv: Environment;
  private onPrint: (text: string) => void;
  private onRequestInput: (promptText: string) => Promise<string>;
  private isCancelled: () => boolean;
  private modules: Record<string, Record<string, any>>;

  constructor(options: EvaluatorOptions = {}) {
    this.onPrint = options.onPrint || (t => console.log(t));
    this.onRequestInput = options.onRequestInput || (async () => '');
    this.isCancelled = options.isCancelled || (() => false);

    this.globalEnv = new Environment();
    this.currentEnv = this.globalEnv;
    this.modules = createBuiltinModules();

    this.initBuiltins();
  }

  public getGlobalEnv(): Environment {
    return this.globalEnv;
  }

  private initBuiltins() {
    // 1. sollu (print with sep and end)
    this.globalEnv.define(
      'sollu',
      new BuiltinFunction('sollu', (_, args, kwargs) => {
        const sep = kwargs['sep'] !== undefined ? String(kwargs['sep']) : ' ';
        const end = kwargs['end'] !== undefined ? String(kwargs['end']) : '\n';
        const formatted = args.map(a => this.formatValue(a)).join(sep) + end;
        this.onPrint(formatted);
        return null;
      })
    );

    // 2. kelu (input modal)
    this.globalEnv.define(
      'kelu',
      new BuiltinFunction('kelu', async (_, args) => {
        const promptText = args.length > 0 ? this.formatValue(args[0]) : '';
        const inputResult = await this.onRequestInput(promptText);
        return inputResult;
      })
    );

    // 3. Type conversions
    this.globalEnv.define(
      'int',
      new BuiltinFunction('int', (_, args, __, line, col) => {
        if (args.length === 0) return 0;
        const val = parseInt(args[0], 10);
        if (isNaN(val)) throw new ValueError(`int()-ku '${args[0]}' convert panna mudiyala`, line, col);
        return val;
      })
    );

    this.globalEnv.define(
      'float',
      new BuiltinFunction('float', (_, args, __, line, col) => {
        if (args.length === 0) return 0.0;
        const val = parseFloat(args[0]);
        if (isNaN(val)) throw new ValueError(`float()-ku '${args[0]}' convert panna mudiyala`, line, col);
        return val;
      })
    );

    this.globalEnv.define(
      'string',
      new BuiltinFunction('string', (_, args) => {
        if (args.length === 0) return '';
        return this.formatValue(args[0]);
      })
    );

    const lenFn = new BuiltinFunction('len', (_, args, __, line, col) => {
      if (args.length === 0) throw new TypeError('len() requires an argument', line, col);
      try {
        return pyLen(args[0]);
      } catch (err: any) {
        throw new TypeError(err.message, line, col);
      }
    });
    this.globalEnv.define('len', lenFn);
    this.globalEnv.define('alavu', lenFn);

    // Python-style string built-in functions
    this.globalEnv.define(
      'capitalize',
      new BuiltinFunction('capitalize', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('capitalize() requires a string argument', line, col);
        return pyCapitalize(String(args[0]));
      })
    );

    const centerFn = new BuiltinFunction('center', (_, args, __, line, col) => {
      if (args.length === 0) throw new TypeError('center() requires at least a string and width', line, col);
      const s = String(args[0]);
      const width = Number(args[1] || 0);
      const fill = args[2] !== undefined ? String(args[2]) : ' ';
      return pyCenter(s, width, fill);
    });
    this.globalEnv.define('center', centerFn);
    this.globalEnv.define('centre', centerFn);

    this.globalEnv.define(
      'find',
      new BuiltinFunction('find', (_, args, __, line, col) => {
        if (args.length < 2) throw new TypeError('find() requires a string and substring', line, col);
        const s = String(args[0]);
        const sub = String(args[1]);
        const start = args[2] !== undefined ? Number(args[2]) : undefined;
        const end = args[3] !== undefined ? Number(args[3]) : undefined;
        return pyFind(s, sub, start, end);
      })
    );

    this.globalEnv.define(
      'isalnum',
      new BuiltinFunction('isalnum', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('isalnum() requires a string', line, col);
        return pyIsAlnum(String(args[0]));
      })
    );

    this.globalEnv.define(
      'isalpha',
      new BuiltinFunction('isalpha', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('isalpha() requires a string', line, col);
        return pyIsAlpha(String(args[0]));
      })
    );

    this.globalEnv.define(
      'isdigit',
      new BuiltinFunction('isdigit', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('isdigit() requires a string', line, col);
        return pyIsDigit(String(args[0]));
      })
    );

    this.globalEnv.define(
      'lower',
      new BuiltinFunction('lower', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('lower() requires a string', line, col);
        return pyLower(String(args[0]));
      })
    );

    this.globalEnv.define(
      'islower',
      new BuiltinFunction('islower', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('islower() requires a string', line, col);
        return pyIsLower(String(args[0]));
      })
    );

    this.globalEnv.define(
      'isupper',
      new BuiltinFunction('isupper', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('isupper() requires a string', line, col);
        return pyIsUpper(String(args[0]));
      })
    );

    this.globalEnv.define(
      'upper',
      new BuiltinFunction('upper', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('upper() requires a string', line, col);
        return pyUpper(String(args[0]));
      })
    );

    this.globalEnv.define(
      'title',
      new BuiltinFunction('title', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('title() requires a string', line, col);
        return pyTitle(String(args[0]));
      })
    );

    this.globalEnv.define(
      'swapcase',
      new BuiltinFunction('swapcase', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('swapcase() requires a string', line, col);
        return pySwapCase(String(args[0]));
      })
    );

    this.globalEnv.define(
      'count',
      new BuiltinFunction('count', (_, args, __, line, col) => {
        if (args.length < 2) throw new TypeError('count() requires target and element/substring', line, col);
        const target = args[0];
        const sub = args[1];
        if (typeof target === 'string') {
          const start = args[2] !== undefined ? Number(args[2]) : undefined;
          const end = args[3] !== undefined ? Number(args[3]) : undefined;
          return pyCount(target, String(sub), start, end);
        }
        if (Array.isArray(target)) {
          const start = args[2] !== undefined ? Number(args[2]) : undefined;
          const end = args[3] !== undefined ? Number(args[3]) : undefined;
          return pyCount(target, sub, start, end, (a, b) => this.isEqual(a, b));
        }
        throw new TypeError(`'${typeof target}' count() support pannaadhu`, line, col);
      })
    );

    // List & iterable math built-in functions
    this.globalEnv.define(
      'max',
      new BuiltinFunction('max', (_, args, __, line, col) => {
        try {
          return pyMax(...args);
        } catch (err: any) {
          if (err.message.startsWith('ValueError')) throw new ValueError(err.message, line, col);
          throw new TypeError(err.message, line, col);
        }
      })
    );

    this.globalEnv.define(
      'min',
      new BuiltinFunction('min', (_, args, __, line, col) => {
        try {
          return pyMin(...args);
        } catch (err: any) {
          if (err.message.startsWith('ValueError')) throw new ValueError(err.message, line, col);
          throw new TypeError(err.message, line, col);
        }
      })
    );

    this.globalEnv.define(
      'sum',
      new BuiltinFunction('sum', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('sum() expected at least 1 argument, got 0', line, col);
        try {
          return pySum(args[0], args[1] !== undefined ? Number(args[1]) : 0);
        } catch (err: any) {
          throw new TypeError(err.message, line, col);
        }
      })
    );

    this.globalEnv.define(
      'append',
      new BuiltinFunction('append', (_, args, __, line, col) => {
        if (args.length < 2 || !Array.isArray(args[0])) throw new TypeError('append() requires list and value', line, col);
        args[0].push(args[1]);
        return null;
      })
    );

    this.globalEnv.define(
      'extend',
      new BuiltinFunction('extend', (_, args, __, line, col) => {
        if (args.length < 2 || !Array.isArray(args[0])) throw new TypeError('extend() requires list and iterable', line, col);
        const target = args[0];
        const iter = args[1];
        if (Array.isArray(iter)) for (const x of iter) target.push(x);
        else if (typeof iter === 'string') for (const x of iter) target.push(x);
        else throw new TypeError('extend() argument must be iterable', line, col);
        return null;
      })
    );

    this.globalEnv.define(
      'reverse',
      new BuiltinFunction('reverse', (_, args, __, line, col) => {
        if (args.length < 1 || !Array.isArray(args[0])) throw new TypeError('reverse() requires list', line, col);
        args[0].reverse();
        return null;
      })
    );

    this.globalEnv.define(
      'sort',
      new BuiltinFunction('sort', async (evaluator, args, kwargs, line, col) => {
        if (args.length < 1 || !Array.isArray(args[0])) throw new TypeError('sort() requires list', line, col);
        const target = args[0];
        const rev = kwargs['reverse'] !== undefined ? Boolean(kwargs['reverse']) : (args[1] ? Boolean(args[1]) : false);
        let keyFn: any = undefined;
        if (kwargs['key'] !== undefined) {
          const k = kwargs['key'];
          keyFn = async (item: any) => {
            if (typeof k === 'object' && 'call' in k) return await k.call(evaluator, [item], {}, line, col);
            if (typeof k === 'function') return await k(item);
            return item;
          };
        }
        await pySort(target, keyFn, rev);
        return null;
      })
    );

    this.globalEnv.define(
      'vagai', // type()
      new BuiltinFunction('vagai', (_, args) => {
        if (args.length === 0) return 'none';
        const obj = args[0];
        if (obj === null || obj === undefined) return 'onnumilla';
        if (Array.isArray(obj)) return 'list';
        if (typeof obj === 'number') return 'number';
        if (typeof obj === 'string') return 'string';
        if (typeof obj === 'boolean') return 'boolean';
        if (obj instanceof TanglishClass) return 'class';
        if (obj instanceof TanglishInstance) return obj.klass.name;
        if (obj instanceof TanglishFunction || obj instanceof BuiltinFunction) return 'function';
        if (typeof obj === 'object') return 'dict';
        return typeof obj;
      })
    );

    this.globalEnv.define(
      'chr',
      new BuiltinFunction('chr', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('chr() requires integer', line, col);
        return String.fromCharCode(Number(args[0]));
      })
    );

    this.globalEnv.define(
      'ord',
      new BuiltinFunction('ord', (_, args, __, line, col) => {
        if (args.length === 0 || typeof args[0] !== 'string' || args[0].length === 0) {
          throw new TypeError('ord() requires 1-character string', line, col);
        }
        return args[0].charCodeAt(0);
      })
    );

    this.globalEnv.define(
      'range',
      new BuiltinFunction('range', (_, args, __, line, col) => {
        let start = 0;
        let stop = 0;
        let step = 1;

        if (args.length === 1) {
          stop = Number(args[0]);
        } else if (args.length === 2) {
          start = Number(args[0]);
          stop = Number(args[1]);
        } else if (args.length >= 3) {
          start = Number(args[0]);
          stop = Number(args[1]);
          step = Number(args[2]);
        }

        if (step === 0) throw new ValueError('range() step cannot be zero', line, col);

        const result: number[] = [];
        if (step > 0) {
          for (let i = start; i < stop; i += step) {
            result.push(i);
          }
        } else {
          for (let i = start; i > stop; i += step) {
            result.push(i);
          }
        }
        return result;
      })
    );

    // Auto-mount standard modules into global environment as well for convenience
    Object.keys(this.modules).forEach(modName => {
      this.globalEnv.define(modName, this.modules[modName]);
    });
  }

  public formatValue(val: any): string {
    if (val === null || val === undefined) return 'onnumilla';
    if (val === true) return 'unmai';
    if (val === false) return 'poi';
    if (Array.isArray(val)) {
      return '[' + val.map(v => this.formatValue(v)).join(', ') + ']';
    }
    if (val instanceof TanglishInstance) {
      return `<${val.klass.name} instance>`;
    }
    if (val instanceof TanglishClass) {
      return `<class '${val.name}'>`;
    }
    if (val instanceof TanglishFunction) {
      return `<fun ${val.name}>`;
    }
    if (val instanceof BuiltinFunction) {
      return `<builtin fun ${val.name}>`;
    }
    if (typeof val === 'object') {
      const pairs = Object.entries(val).map(([k, v]) => `'${k}': ${this.formatValue(v)}`);
      return '{' + pairs.join(', ') + '}';
    }
    return String(val);
  }

  public async evaluate(program: Program): Promise<any> {
    setActiveEvaluator(this);
    try {
      await this.executeBlock(program.body, this.globalEnv);
    } catch (err: any) {
      if (err instanceof ExitException) {
        this.onPrint(`\n[Program finished: ${err.message}]\n`);
        return;
      }
      throw err;
    }
  }

  public async executeBlock(statements: Statement[], env: Environment): Promise<void> {
    const previousEnv = this.currentEnv;
    try {
      this.currentEnv = env;
      for (const stmt of statements) {
        if (this.isCancelled()) {
          throw new RuntimeError('Execution cancelled by user');
        }
        await this.executeStatement(stmt);
      }
    } finally {
      this.currentEnv = previousEnv;
    }
  }

  private async executeStatement(stmt: Statement): Promise<void> {
    switch (stmt.type) {
      case 'ExprStatement':
        await this.evaluateExpression(stmt.expression);
        break;

      case 'AssignStatement':
        await this.executeAssign(stmt);
        break;

      case 'IfStatement':
        await this.executeIf(stmt);
        break;

      case 'ForStatement':
        await this.executeFor(stmt);
        break;

      case 'WhileStatement':
        await this.executeWhile(stmt);
        break;

      case 'FunctionDef':
        this.executeFunctionDef(stmt);
        break;

      case 'ClassDef':
        this.executeClassDef(stmt);
        break;

      case 'ReturnStatement': {
        const val = stmt.value ? await this.evaluateExpression(stmt.value) : null;
        throw new ReturnSignal(val);
      }

      case 'TryCatchStatement':
        await this.executeTryCatch(stmt);
        break;

      case 'GlobalStatement':
        for (const varName of stmt.variables) {
          this.currentEnv.markGlobal(varName);
        }
        break;

      case 'ImportStatement':
        this.executeImport(stmt);
        break;

      case 'BreakStatement':
        throw new BreakSignal();

      case 'ContinueStatement':
        throw new ContinueSignal();

      case 'PassStatement':
        break;

      case 'DeleteStatement':
        await this.executeDelete(stmt);
        break;

      default:
        break;
    }
  }

  private async executeDelete(stmt: DeleteStatement): Promise<void> {
    const target = stmt.target;
    if (target.type === 'IdentifierExpr') {
      try {
        this.currentEnv.remove(target.name);
      } catch (err: any) {
        if (err instanceof NameError) {
          throw new RuntimeError(err.message, stmt.line, stmt.col);
        }
        throw err;
      }
      return;
    }

    if (target.type === 'IndexExpr') {
      const obj = await this.evaluateExpression(target.object);
      const idx = await this.evaluateExpression(target.index);

      if (Array.isArray(obj)) {
        let indexNum = Number(idx);
        if (indexNum < 0) indexNum = obj.length + indexNum;
        if (indexNum < 0 || indexNum >= obj.length) {
          throw new IndexError(`list assignment index/del out of range: ${idx}`, stmt.line, stmt.col);
        }
        obj.splice(indexNum, 1);
        return;
      }

      if (obj && typeof obj === 'object') {
        const key = String(idx);
        if (!(key in obj)) {
          throw new KeyError(key, stmt.line, stmt.col);
        }
        delete obj[key];
        return;
      }

      throw new TypeError(`'${typeof obj}' deletion support pannaadhu`, stmt.line, stmt.col);
    }

    if (target.type === 'MemberExpr') {
      const obj = await this.evaluateExpression(target.object);
      const prop = target.property;

      if (obj instanceof TanglishInstance) {
        if (obj.fields.has(prop)) {
          obj.fields.delete(prop);
          return;
        }
        throw new RuntimeError(`AttributeError: '${obj.klass.name}' instance-ku '${prop}' attribute kidayadhu`, stmt.line, stmt.col);
      }

      if (obj && typeof obj === 'object') {
        if (!(prop in obj)) {
          throw new RuntimeError(`AttributeError: '${typeof obj}' has no attribute '${prop}'`, stmt.line, stmt.col);
        }
        delete obj[prop];
        return;
      }

      throw new TypeError(`'${typeof obj}' deletion support pannaadhu`, stmt.line, stmt.col);
    }

    throw new RuntimeError(`Ariyadha del target`, stmt.line, stmt.col);
  }

  private async executeAssign(stmt: AssignStatement): Promise<void> {
    const rightVal = await this.evaluateExpression(stmt.value);

    if (stmt.target.type === 'IdentifierExpr') {
      const name = stmt.target.name;
      if (stmt.operator === '=') {
        this.currentEnv.assign(name, rightVal);
      } else {
        const curr = this.currentEnv.lookup(name);
        const next = this.applyOp(stmt.operator[0], curr, rightVal, stmt.line, stmt.col);
        this.currentEnv.assign(name, next);
      }
    } else if (stmt.target.type === 'IndexExpr') {
      const obj = await this.evaluateExpression(stmt.target.object);
      const idx = await this.evaluateExpression(stmt.target.index);

      if (Array.isArray(obj)) {
        let indexNum = Number(idx);
        if (indexNum < 0) indexNum = obj.length + indexNum;
        if (indexNum < 0 || indexNum >= obj.length) {
          throw new IndexError(`List index out of range: ${idx}`, stmt.line, stmt.col);
        }
        if (stmt.operator === '=') {
          obj[indexNum] = rightVal;
        } else {
          obj[indexNum] = this.applyOp(stmt.operator[0], obj[indexNum], rightVal, stmt.line, stmt.col);
        }
      } else if (obj && typeof obj === 'object') {
        const key = String(idx);
        if (stmt.operator === '=') {
          obj[key] = rightVal;
        } else {
          obj[key] = this.applyOp(stmt.operator[0], obj[key], rightVal, stmt.line, stmt.col);
        }
      } else {
        throw new TypeError(`'${typeof obj}' indexing assignment support pannaadhu`, stmt.line, stmt.col);
      }
    } else if (stmt.target.type === 'MemberExpr') {
      const obj = await this.evaluateExpression(stmt.target.object);
      const prop = stmt.target.property;

      if (obj instanceof TanglishInstance) {
        if (stmt.operator === '=') {
          obj.set(prop, rightVal);
        } else {
          const curr = obj.get(prop, stmt.line, stmt.col);
          obj.set(prop, this.applyOp(stmt.operator[0], curr, rightVal, stmt.line, stmt.col));
        }
      } else if (obj && typeof obj === 'object') {
        if (stmt.operator === '=') {
          obj[prop] = rightVal;
        } else {
          obj[prop] = this.applyOp(stmt.operator[0], obj[prop], rightVal, stmt.line, stmt.col);
        }
      } else {
        throw new TypeError(`'${typeof obj}' property assignment support pannaadhu`, stmt.line, stmt.col);
      }
    }
  }

  private async executeIf(stmt: IfStatement): Promise<void> {
    const condition = await this.evaluateExpression(stmt.condition);
    if (this.isTruthy(condition)) {
      await this.executeBlock(stmt.consequent, this.currentEnv);
      return;
    }

    for (const elif of stmt.elifs) {
      const elifCond = await this.evaluateExpression(elif.condition);
      if (this.isTruthy(elifCond)) {
        await this.executeBlock(elif.consequent, this.currentEnv);
        return;
      }
    }

    if (stmt.alternate) {
      await this.executeBlock(stmt.alternate, this.currentEnv);
    }
  }

  private async executeFor(stmt: ForStatement): Promise<void> {
    const iterable = await this.evaluateExpression(stmt.iterable);
    let items: any[] = [];

    if (Array.isArray(iterable)) {
      items = iterable;
    } else if (typeof iterable === 'string') {
      items = iterable.split('');
    } else if (iterable && typeof iterable === 'object') {
      items = Object.keys(iterable);
    } else {
      throw new TypeError(`'${typeof iterable}' iterate panna mudiyala (not iterable)`, stmt.line, stmt.col);
    }

    for (const item of items) {
      if (this.isCancelled()) throw new RuntimeError('Execution cancelled by user');
      this.currentEnv.assign(stmt.variable, item);
      try {
        await this.executeBlock(stmt.body, this.currentEnv);
      } catch (signal) {
        if (signal instanceof BreakSignal) break;
        if (signal instanceof ContinueSignal) continue;
        throw signal;
      }
    }
  }

  private async executeWhile(stmt: WhileStatement): Promise<void> {
    while (this.isTruthy(await this.evaluateExpression(stmt.condition))) {
      if (this.isCancelled()) throw new RuntimeError('Execution cancelled by user');
      try {
        await this.executeBlock(stmt.body, this.currentEnv);
      } catch (signal) {
        if (signal instanceof BreakSignal) break;
        if (signal instanceof ContinueSignal) continue;
        throw signal;
      }
    }
  }

  private executeFunctionDef(stmt: FunctionDef): void {
    const fn = new TanglishFunction(
      stmt.name,
      stmt.params,
      stmt.body,
      this.currentEnv
    );
    this.currentEnv.define(stmt.name, fn);
  }

  private executeClassDef(stmt: ClassDef): void {
    let superKlass: TanglishClass | undefined = undefined;
    if (stmt.superClass) {
      const sup = this.currentEnv.lookup(stmt.superClass);
      if (!(sup instanceof TanglishClass)) {
        throw new TypeError(`Superclass '${stmt.superClass}' must be a class`, stmt.line, stmt.col);
      }
      superKlass = sup;
    }

    const klass = new TanglishClass(stmt.name, superKlass);
    for (const methodDef of stmt.methods) {
      const methodFn = new TanglishFunction(
        methodDef.name,
        methodDef.params,
        methodDef.body,
        this.currentEnv
      );
      klass.methods.set(methodDef.name, methodFn);
    }

    this.currentEnv.define(stmt.name, klass);
  }

  private async executeTryCatch(stmt: TryCatchStatement): Promise<void> {
    try {
      await this.executeBlock(stmt.tryBlock, this.currentEnv);
    } catch (err: any) {
      if (err instanceof ReturnSignal || err instanceof BreakSignal || err instanceof ContinueSignal || err instanceof ExitException) {
        throw err;
      }
      const catchEnv = new Environment(this.currentEnv);
      if (stmt.errorVar) {
        catchEnv.define(stmt.errorVar, err.message || String(err));
      }
      await this.executeBlock(stmt.catchBlock, catchEnv);
    } finally {
      if (stmt.finallyBlock) {
        await this.executeBlock(stmt.finallyBlock, this.currentEnv);
      }
    }
  }

  private executeImport(stmt: ImportStatement): void {
    const mod = this.modules[stmt.moduleName];
    if (!mod) {
      throw new ImportError(stmt.moduleName, stmt.line, stmt.col);
    }
    const targetName = stmt.alias || stmt.moduleName;
    this.currentEnv.define(targetName, mod);
  }

  // --- Evaluate Expressions ---

  public async evaluateExpression(expr: Expression): Promise<any> {
    if (this.isCancelled()) throw new RuntimeError('Execution cancelled by user');

    switch (expr.type) {
      case 'LiteralExpr':
        return expr.value;

      case 'IdentifierExpr': {
        try {
          return this.currentEnv.lookup(expr.name);
        } catch (err) {
          if (err instanceof NameError) {
            throw new RuntimeError(err.message, expr.line, expr.col);
          }
          throw err;
        }
      }

      case 'BinaryExpr':
        return await this.evaluateBinary(expr);

      case 'UnaryExpr':
        return await this.evaluateUnary(expr);

      case 'LogicalExpr':
        return await this.evaluateLogical(expr);

      case 'CallExpr':
        return await this.evaluateCall(expr);

      case 'IndexExpr':
        return await this.evaluateIndex(expr);

      case 'MemberExpr':
        return await this.evaluateMember(expr);

      case 'ListLiteral': {
        const elements: any[] = [];
        for (const el of expr.elements) {
          elements.push(await this.evaluateExpression(el));
        }
        return elements;
      }

      case 'DictLiteral': {
        const dict: Record<string, any> = {};
        for (const entry of expr.entries) {
          const key = await this.evaluateExpression(entry.key);
          const val = await this.evaluateExpression(entry.value);
          dict[String(key)] = val;
        }
        return dict;
      }

      case 'LambdaExpr': {
        return new TanglishFunction(
          '<kutti_fun>',
          expr.params,
          [{ type: 'ReturnStatement', value: expr.body, line: expr.line, col: expr.col }],
          this.currentEnv
        );
      }

      default:
        return null;
    }
  }

  private async evaluateBinary(expr: BinaryExpr): Promise<any> {
    const left = await this.evaluateExpression(expr.left);
    const right = await this.evaluateExpression(expr.right);
    return this.applyOp(expr.operator, left, right, expr.line, expr.col);
  }

  private applyOp(op: string, left: any, right: any, line: number, col: number): any {
    switch (op) {
      case '+':
        if (typeof left === 'string' || typeof right === 'string') {
          return String(left) + String(right);
        }
        if (Array.isArray(left) && Array.isArray(right)) {
          return [...left, ...right];
        }
        return Number(left) + Number(right);

      case '-':
        return Number(left) - Number(right);

      case '*':
        if (typeof left === 'string' && typeof right === 'number') {
          return left.repeat(Math.max(0, Math.floor(right)));
        }
        if (Array.isArray(left) && typeof right === 'number') {
          let res: any[] = [];
          for (let i = 0; i < right; i++) res = res.concat(left);
          return res;
        }
        return Number(left) * Number(right);

      case '/':
        if (Number(right) === 0) throw new ZeroDivisionError(line, col);
        return Number(left) / Number(right);

      case '//': // Floor Division
        if (Number(right) === 0) throw new ZeroDivisionError(line, col);
        return Math.floor(Number(left) / Number(right));

      case '%':
        if (Number(right) === 0) throw new ZeroDivisionError(line, col);
        return Number(left) % Number(right);

      case '**': // Exponentiation
        return Math.pow(Number(left), Number(right));

      case '==':
        return this.isEqual(left, right);

      case '!=':
        return !this.isEqual(left, right);

      case '<':
        return left < right;

      case '<=':
        return left <= right;

      case '>':
        return left > right;

      case '>=':
        return left >= right;

      case 'in':
        if (Array.isArray(right)) return right.includes(left);
        if (typeof right === 'string') return right.includes(String(left));
        if (right && typeof right === 'object') return left in right;
        throw new TypeError(`'${typeof right}' ulla/kulla check panna mudiyala`, line, col);

      default:
        throw new RuntimeError(`Ariyadha operator: '${op}'`, line, col);
    }
  }

  private async evaluateUnary(expr: UnaryExpr): Promise<any> {
    const val = await this.evaluateExpression(expr.argument);
    switch (expr.operator) {
      case '-':
        return -Number(val);
      case '+':
        return +Number(val);
      case 'illai': // not
        return !this.isTruthy(val);
      default:
        throw new RuntimeError(`Ariyadha unary operator: '${expr.operator}'`, expr.line, expr.col);
    }
  }

  private async evaluateLogical(expr: LogicalExpr): Promise<any> {
    const left = await this.evaluateExpression(expr.left);
    if (expr.operator === 'alladhu') { // OR
      if (this.isTruthy(left)) return left;
      return await this.evaluateExpression(expr.right);
    } else { // AND ('matrum')
      if (!this.isTruthy(left)) return left;
      return await this.evaluateExpression(expr.right);
    }
  }

  private async evaluateCall(expr: CallExpr): Promise<any> {
    const callee = await this.evaluateExpression(expr.callee);

    const evaluatedArgs: any[] = [];
    for (const arg of expr.args) {
      evaluatedArgs.push(await this.evaluateExpression(arg));
    }

    const evaluatedKwargs: Record<string, any> = {};
    for (const [k, v] of Object.entries(expr.kwargs)) {
      evaluatedKwargs[k] = await this.evaluateExpression(v);
    }

    // Calling a Class -> Instantiation
    if (callee instanceof TanglishClass) {
      const instance = new TanglishInstance(callee);
      const initMethod = callee.findMethod('__init__');
      if (initMethod) {
        const boundInit = initMethod.bind(instance);
        await boundInit.call(this, evaluatedArgs, evaluatedKwargs, expr.line, expr.col);
      }
      return instance;
    }

    // Calling a Function
    if (typeof callee === 'object' && callee !== null && 'call' in callee) {
      return await (callee as Callable).call(this, evaluatedArgs, evaluatedKwargs, expr.line, expr.col);
    }

    // Calling raw JS function (e.g. from standard modules like ganitham.sqrt)
    if (typeof callee === 'function') {
      return await callee(...evaluatedArgs);
    }

    throw new TypeError(`'${this.formatValue(callee)}' call panna mudiyadhu (not callable)`, expr.line, expr.col);
  }

  private async evaluateIndex(expr: IndexExpr): Promise<any> {
    const obj = await this.evaluateExpression(expr.object);
    const idx = await this.evaluateExpression(expr.index);

    if (Array.isArray(obj)) {
      let indexNum = Number(idx);
      if (indexNum < 0) indexNum = obj.length + indexNum;
      if (indexNum < 0 || indexNum >= obj.length) {
        throw new IndexError(`List index out of range: ${idx}`, expr.line, expr.col);
      }
      return obj[indexNum];
    }

    if (typeof obj === 'string') {
      let indexNum = Number(idx);
      if (indexNum < 0) indexNum = obj.length + indexNum;
      if (indexNum < 0 || indexNum >= obj.length) {
        throw new IndexError(`String index out of range: ${idx}`, expr.line, expr.col);
      }
      return obj[indexNum];
    }

    if (obj && typeof obj === 'object') {
      const key = String(idx);
      if (!(key in obj)) {
        throw new KeyError(key, expr.line, expr.col);
      }
      return obj[key];
    }

    throw new TypeError(`'${typeof obj}' indexing support pannaadhu`, expr.line, expr.col);
  }

  private async evaluateMember(expr: MemberExpr): Promise<any> {
    const obj = await this.evaluateExpression(expr.object);
    const prop = expr.property;

    if (obj instanceof TanglishInstance) {
      return obj.get(prop, expr.line, expr.col);
    }

    // Built-in list methods
    if (Array.isArray(obj)) {
      if (prop === 'append') {
        return (val: any) => { obj.push(val); return null; };
      }
      if (prop === 'extend') {
        return (iterable: any) => {
          if (Array.isArray(iterable)) {
            for (const item of iterable) obj.push(item);
          } else if (typeof iterable === 'string') {
            for (const ch of iterable) obj.push(ch);
          } else if (iterable && typeof iterable === 'object') {
            for (const k of Object.keys(iterable)) obj.push(k);
          } else {
            throw new TypeError(`'${typeof iterable}' object is not iterable`, expr.line, expr.col);
          }
          return null;
        };
      }
      if (prop === 'pop') {
        return (i?: number) => {
          if (obj.length === 0) {
            throw new IndexError('pop from empty list', expr.line, expr.col);
          }
          let idx = i !== undefined ? Number(i) : -1;
          if (idx < 0) idx = obj.length + idx;
          if (idx < 0 || idx >= obj.length) {
            throw new IndexError(`pop index out of range: ${i}`, expr.line, expr.col);
          }
          return obj.splice(idx, 1)[0];
        };
      }
      if (prop === 'insert') {
        return (i: number, val: any) => { obj.splice(i, 0, val); return null; };
      }
      if (prop === 'remove') {
        return (val: any) => {
          const idx = obj.findIndex(item => this.isEqual(item, val));
          if (idx === -1) {
            throw new ValueError(`list.remove(x): '${this.formatValue(val)}' list-la illai (x not in list)`, expr.line, expr.col);
          }
          obj.splice(idx, 1);
          return null;
        };
      }
      if (prop === 'clear') {
        return () => { obj.length = 0; return null; };
      }
      if (prop === 'index') {
        return (x: any, start?: number, end?: number) => {
          try {
            return pyIndex(obj, x, start, end, (a, b) => this.isEqual(a, b));
          } catch (err: any) {
            throw new ValueError(err.message, expr.line, expr.col);
          }
        };
      }
      if (prop === 'reverse') {
        return () => {
          obj.reverse();
          return null;
        };
      }
      if (prop === 'sort') {
        return async (kwargsOrKey?: any, maybeReverse?: any) => {
          let keyFn: any = undefined;
          let rev = false;

          if (typeof kwargsOrKey === 'boolean') {
            rev = kwargsOrKey;
          } else if (kwargsOrKey) {
            keyFn = async (item: any) => {
              if (typeof kwargsOrKey === 'object' && 'call' in kwargsOrKey) {
                return await kwargsOrKey.call(this, [item], {}, expr.line, expr.col);
              }
              if (typeof kwargsOrKey === 'function') {
                return await kwargsOrKey(item);
              }
              return item;
            };
          }
          if (typeof maybeReverse === 'boolean') {
            rev = maybeReverse;
          }

          await pySort(obj, keyFn, rev);
          return null;
        };
      }
      if (prop === 'max') {
        return () => {
          try {
            return pyMax(obj);
          } catch (e: any) {
            throw new ValueError(e.message, expr.line, expr.col);
          }
        };
      }
      if (prop === 'min') {
        return () => {
          try {
            return pyMin(obj);
          } catch (e: any) {
            throw new ValueError(e.message, expr.line, expr.col);
          }
        };
      }
      if (prop === 'sum') {
        return (start: number = 0) => {
          try {
            return pySum(obj, start);
          } catch (e: any) {
            throw new TypeError(e.message, expr.line, expr.col);
          }
        };
      }
      if (prop === 'count') {
        return (val: any, start?: number, end?: number) =>
          pyCount(
            obj,
            val,
            start !== undefined ? Number(start) : undefined,
            end !== undefined ? Number(end) : undefined,
            (a, b) => this.isEqual(a, b)
          );
      }
      if (prop === 'len') {
        return () => obj.length;
      }
    }

    // Built-in dict methods
    if (obj && typeof obj === 'object' && !(obj instanceof TanglishClass)) {
      if (prop === 'keys') return () => Object.keys(obj);
      if (prop === 'values') return () => Object.values(obj);
      if (prop === 'items') return () => Object.entries(obj);
      if (prop === 'get') return (k: string, def: any = null) => (k in obj ? obj[k] : def);
      if (prop === 'len') return () => Object.keys(obj).length;

      if (prop in obj) {
        const val = obj[prop];
        if (typeof val === 'function') {
          return val.bind(obj);
        }
        return val;
      }
    }

    // Built-in string methods
    if (typeof obj === 'string') {
      if (prop === 'len') return () => obj.length;
      if (prop === 'capitalize') return () => pyCapitalize(obj);
      if (prop === 'centre' || prop === 'center') {
        return (width: number, fill = ' ') => pyCenter(obj, Number(width), String(fill));
      }
      if (prop === 'find') {
        return (sub: string, start?: number, end?: number) =>
          pyFind(
            obj,
            String(sub),
            start !== undefined ? Number(start) : undefined,
            end !== undefined ? Number(end) : undefined
          );
      }
      if (prop === 'isalnum') return () => pyIsAlnum(obj);
      if (prop === 'isalpha') return () => pyIsAlpha(obj);
      if (prop === 'isdigit') return () => pyIsDigit(obj);
      if (prop === 'lower') return () => pyLower(obj);
      if (prop === 'islower') return () => pyIsLower(obj);
      if (prop === 'isupper') return () => pyIsUpper(obj);
      if (prop === 'upper') return () => pyUpper(obj);
      if (prop === 'title') return () => pyTitle(obj);
      if (prop === 'swapcase') return () => pySwapCase(obj);
      if (prop === 'count') {
        return (sub: string, start?: number, end?: number) =>
          pyCount(
            obj,
            String(sub),
            start !== undefined ? Number(start) : undefined,
            end !== undefined ? Number(end) : undefined
          );
      }
      if (prop === 'split') return (sep = ' ') => obj.split(sep);
      if (prop === 'strip') return () => obj.trim();
      if (prop === 'replace') return (a: string, b: string) => obj.replaceAll(a, b);
    }

    throw new RuntimeError(`AttributeError: '${typeof obj}' has no attribute '${prop}'`, expr.line, expr.col);
  }

  private isTruthy(val: any): boolean {
    if (val === null || val === undefined) return false;
    if (val === false) return false;
    if (val === 0 || val === 0.0) return false;
    if (val === '') return false;
    if (Array.isArray(val) && val.length === 0) return false;
    if (typeof val === 'object' && Object.keys(val).length === 0) return false;
    return true;
  }

  private isEqual(a: any, b: any): boolean {
    if (a === b) return true;
    if (Array.isArray(a) && Array.isArray(b)) {
      if (a.length !== b.length) return false;
      return a.every((val, idx) => this.isEqual(val, b[idx]));
    }
    return false;
  }
}
