// AST Node Types for Tanglish++

export type Statement =
  | Program
  | ExprStatement
  | AssignStatement
  | IfStatement
  | ForStatement
  | WhileStatement
  | FunctionDef
  | ReturnStatement
  | ClassDef
  | TryCatchStatement
  | GlobalStatement
  | ImportStatement
  | BreakStatement
  | ContinueStatement
  | PassStatement;

export type Expression =
  | LiteralExpr
  | IdentifierExpr
  | BinaryExpr
  | UnaryExpr
  | LogicalExpr
  | CallExpr
  | IndexExpr
  | MemberExpr
  | ListLiteral
  | DictLiteral
  | LambdaExpr;

export interface BaseNode {
  line: number;
  col: number;
}

export interface Program extends BaseNode {
  type: 'Program';
  body: Statement[];
}

export interface ExprStatement extends BaseNode {
  type: 'ExprStatement';
  expression: Expression;
}

export interface AssignStatement extends BaseNode {
  type: 'AssignStatement';
  target: Expression; // IdentifierExpr | IndexExpr | MemberExpr
  operator: string;   // '=', '+=', '-=', '*=', '/='
  value: Expression;
}

export interface IfStatement extends BaseNode {
  type: 'IfStatement';
  condition: Expression;
  consequent: Statement[];
  elifs: { condition: Expression; consequent: Statement[]; line: number; col: number }[];
  alternate?: Statement[];
}

export interface ForStatement extends BaseNode {
  type: 'ForStatement';
  variable: string;
  iterable: Expression;
  body: Statement[];
}

export interface WhileStatement extends BaseNode {
  type: 'WhileStatement';
  condition: Expression;
  body: Statement[];
}

export interface FunctionDef extends BaseNode {
  type: 'FunctionDef';
  name: string;
  params: string[];
  body: Statement[];
}

export interface ReturnStatement extends BaseNode {
  type: 'ReturnStatement';
  value?: Expression;
}

export interface ClassDef extends BaseNode {
  type: 'ClassDef';
  name: string;
  superClass?: string;
  methods: FunctionDef[];
}

export interface TryCatchStatement extends BaseNode {
  type: 'TryCatchStatement';
  tryBlock: Statement[];
  errorVar?: string;
  catchBlock: Statement[];
  finallyBlock?: Statement[];
}

export interface GlobalStatement extends BaseNode {
  type: 'GlobalStatement';
  variables: string[];
}

export interface ImportStatement extends BaseNode {
  type: 'ImportStatement';
  moduleName: string;
  alias?: string;
}

export interface BreakStatement extends BaseNode {
  type: 'BreakStatement';
}

export interface ContinueStatement extends BaseNode {
  type: 'ContinueStatement';
}

export interface PassStatement extends BaseNode {
  type: 'PassStatement';
}

// Expressions
export interface LiteralExpr extends BaseNode {
  type: 'LiteralExpr';
  value: any;
  rawType: 'number' | 'string' | 'boolean' | 'null';
}

export interface IdentifierExpr extends BaseNode {
  type: 'IdentifierExpr';
  name: string;
}

export interface BinaryExpr extends BaseNode {
  type: 'BinaryExpr';
  left: Expression;
  operator: string;
  right: Expression;
}

export interface UnaryExpr extends BaseNode {
  type: 'UnaryExpr';
  operator: string;
  argument: Expression;
}

export interface LogicalExpr extends BaseNode {
  type: 'LogicalExpr';
  left: Expression;
  operator: 'matrum' | 'alladhu';
  right: Expression;
}

export interface CallExpr extends BaseNode {
  type: 'CallExpr';
  callee: Expression;
  args: Expression[];
  kwargs: Record<string, Expression>;
}

export interface IndexExpr extends BaseNode {
  type: 'IndexExpr';
  object: Expression;
  index: Expression;
}

export interface MemberExpr extends BaseNode {
  type: 'MemberExpr';
  object: Expression;
  property: string;
}

export interface ListLiteral extends BaseNode {
  type: 'ListLiteral';
  elements: Expression[];
}

export interface DictLiteral extends BaseNode {
  type: 'DictLiteral';
  entries: { key: Expression; value: Expression }[];
}

export interface LambdaExpr extends BaseNode {
  type: 'LambdaExpr';
  params: string[];
  body: Expression;
}
