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
} from './ast';
import { Environment, NameError } from './environment';
import { createBuiltinModules, ExitException } from './modules';

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

    this.globalEnv.define(
      'alavu', // len()
      new BuiltinFunction('alavu', (_, args, __, line, col) => {
        if (args.length === 0) throw new TypeError('alavu() requires an argument', line, col);
        const obj = args[0];
        if (typeof obj === 'string' || Array.isArray(obj)) return obj.length;
        if (obj && typeof obj === 'object') return Object.keys(obj).length;
        throw new TypeError(`'${typeof obj}' alavu() support pannaadhu`, line, col);
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

      default:
        break;
    }
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
      if (prop === 'pop') {
        return (i?: number) => {
          if (i !== undefined) return obj.splice(i, 1)[0];
          return obj.pop();
        };
      }
      if (prop === 'insert') {
        return (i: number, val: any) => { obj.splice(i, 0, val); return null; };
      }
      if (prop === 'remove') {
        return (val: any) => {
          const idx = obj.indexOf(val);
          if (idx !== -1) obj.splice(idx, 1);
          return null;
        };
      }
      if (prop === 'clear') {
        return () => { obj.length = 0; return null; };
      }
    }

    // Built-in dict methods
    if (obj && typeof obj === 'object' && !(obj instanceof TanglishClass)) {
      if (prop === 'keys') return () => Object.keys(obj);
      if (prop === 'values') return () => Object.values(obj);
      if (prop === 'items') return () => Object.entries(obj);
      if (prop === 'get') return (k: string, def: any = null) => (k in obj ? obj[k] : def);

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
      if (prop === 'upper') return () => obj.toUpperCase();
      if (prop === 'lower') return () => obj.toLowerCase();
      if (prop === 'split') return (sep = ' ') => obj.split(sep);
      if (prop === 'strip') return () => obj.trim();
      if (prop === 'replace') return (a: string, b: string) => obj.replace(new RegExp(a, 'g'), b);
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
