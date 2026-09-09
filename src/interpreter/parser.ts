import { Token, TokenType } from './tokens';
import {
  Statement,
  Expression,
  Program,
  ExprStatement,
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
  BreakStatement,
  ContinueStatement,
  PassStatement,
  DeleteStatement,
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

export class ParserError extends Error {
  line: number;
  col: number;
  constructor(message: string, line: number, col: number) {
    super(`SyntaxError [Line ${line}, Col ${col}]: ${message}`);
    this.name = 'ParserError';
    this.line = line;
    this.col = col;
  }
}

export class Parser {
  private tokens: Token[];
  private current = 0;

  constructor(tokens: Token[]) {
    this.tokens = tokens;
  }

  public parse(): Program {
    const startToken = this.peek();
    const body: Statement[] = [];

    this.skipNewlines();

    while (!this.isAtEnd()) {
      const stmt = this.parseStatement();
      if (stmt) {
        body.push(stmt);
      }
      this.skipNewlines();
    }

    return {
      type: 'Program',
      body,
      line: startToken.line,
      col: startToken.col,
    };
  }

  private parseStatement(): Statement {
    this.skipNewlines();
    const token = this.peek();

    switch (token.type) {
      case TokenType.IRUNTHA:
        return this.parseIfStatement();
      case TokenType.VARISAIYA:
      case TokenType.KAAGA:
        return this.parseForStatement();
      case TokenType.IRUKKURA_VARAI:
        return this.parseWhileStatement();
      case TokenType.FUN:
      case TokenType.SEYAL:
        return this.parseFunctionDef();
      case TokenType.CLASS:
        return this.parseClassDef();
      case TokenType.THIRUPIKUDU:
        return this.parseReturnStatement();
      case TokenType.MUYARCHI:
        return this.parseTryCatchStatement();
      case TokenType.ULAGAM:
        return this.parseGlobalStatement();
      case TokenType.IMPORT:
      case TokenType.EDUTHU_VAA:
      case TokenType.KONDU_VA:
        return this.parseImportStatement();
      case TokenType.NIRUVA:
        this.advance();
        this.expectStatementTerminator();
        return { type: 'BreakStatement', line: token.line, col: token.col };
      case TokenType.THODARU:
        this.advance();
        this.expectStatementTerminator();
        return { type: 'ContinueStatement', line: token.line, col: token.col };
      case TokenType.PASS:
        this.advance();
        this.expectStatementTerminator();
        return { type: 'PassStatement', line: token.line, col: token.col };
      case TokenType.DEL:
        return this.parseDeleteStatement();
      default:
        return this.parseAssignOrExpressionStatement();
    }
  }

  private parseIfStatement(): IfStatement {
    const token = this.advance(); // consume 'iruntha'
    const condition = this.parseExpression();
    this.consume(TokenType.COLON, "':' thevai (expected ':' after if condition)");
    const consequent = this.parseBlock();

    const elifs: { condition: Expression; consequent: Statement[]; line: number; col: number }[] = [];
    this.skipNewlines();

    while (this.match(TokenType.ILLATTI)) {
      const elifToken = this.previous();
      const elifCond = this.parseExpression();
      this.consume(TokenType.COLON, "':' thevai (expected ':' after elif condition)");
      const elifBlock = this.parseBlock();
      elifs.push({
        condition: elifCond,
        consequent: elifBlock,
        line: elifToken.line,
        col: elifToken.col,
      });
      this.skipNewlines();
    }

    let alternate: Statement[] | undefined = undefined;
    if (this.match(TokenType.ILLANA)) {
      this.consume(TokenType.COLON, "':' thevai (expected ':' after else/illana)");
      alternate = this.parseBlock();
    }

    return {
      type: 'IfStatement',
      condition,
      consequent,
      elifs,
      alternate,
      line: token.line,
      col: token.col,
    };
  }

  private parseForStatement(): ForStatement {
    const token = this.advance(); // consume 'varisaiya' or 'kaaga'
    const idToken = this.consume(
      TokenType.IDENTIFIER,
      "Loop variable peyar thevai (expected variable name after for/kaaga)"
    );

    if (!this.match(TokenType.ULLA) && !this.match(TokenType.KULLA)) {
      throw new ParserError(
        "'ulla' alladhu 'kulla' keyword thevai (expected 'ulla' or 'kulla' in for loop)",
        this.peek().line,
        this.peek().col
      );
    }

    const iterable = this.parseExpression();
    this.consume(TokenType.COLON, "':' thevai (expected ':' after for statement)");
    const body = this.parseBlock();

    return {
      type: 'ForStatement',
      variable: idToken.value,
      iterable,
      body,
      line: token.line,
      col: token.col,
    };
  }

  private parseWhileStatement(): WhileStatement {
    const token = this.advance(); // consume 'irukkura_varai'
    const condition = this.parseExpression();
    this.consume(TokenType.COLON, "':' thevai (expected ':' after while condition)");
    const body = this.parseBlock();

    return {
      type: 'WhileStatement',
      condition,
      body,
      line: token.line,
      col: token.col,
    };
  }

  private parseFunctionDef(): FunctionDef {
    const token = this.advance(); // consume 'fun' or 'seyal'
    const nameToken = this.consume(
      TokenType.IDENTIFIER,
      "Function peyar thevai (expected function name)"
    );

    this.consume(TokenType.LPAREN, "'(' thevai (expected '(' after function name)");
    const params: string[] = [];

    if (!this.check(TokenType.RPAREN)) {
      do {
        // Can be 'ithu' if method self parameter or identifier
        if (this.check(TokenType.ITHU)) {
          this.advance();
          params.push('ithu');
        } else {
          const paramToken = this.consume(
            TokenType.IDENTIFIER,
            "Parameter peyar thevai (expected parameter name)"
          );
          params.push(paramToken.value);
        }
      } while (this.match(TokenType.COMMA));
    }

    this.consume(TokenType.RPAREN, "')' thevai (expected ')' after parameters)");
    this.consume(TokenType.COLON, "':' thevai (expected ':' after function header)");
    const body = this.parseBlock();

    return {
      type: 'FunctionDef',
      name: nameToken.value,
      params,
      body,
      line: token.line,
      col: token.col,
    };
  }

  private parseClassDef(): ClassDef {
    const token = this.advance(); // consume 'class'
    const nameToken = this.consume(
      TokenType.IDENTIFIER,
      "Class peyar thevai (expected class name)"
    );

    let superClass: string | undefined = undefined;
    if (this.match(TokenType.LPAREN)) {
      const superToken = this.consume(
        TokenType.IDENTIFIER,
        "Superclass peyar thevai (expected superclass name)"
      );
      superClass = superToken.value;
      this.consume(TokenType.RPAREN, "')' thevai");
    }

    this.consume(TokenType.COLON, "':' thevai (expected ':' after class header)");

    // Parse class body (methods)
    const methods: FunctionDef[] = [];
    this.skipNewlines();

    if (this.match(TokenType.INDENT)) {
      while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
        this.skipNewlines();
        if (this.check(TokenType.DEDENT)) break;
        if (this.check(TokenType.FUN) || this.check(TokenType.SEYAL)) {
          methods.push(this.parseFunctionDef());
        } else if (this.match(TokenType.PASS)) {
          this.expectStatementTerminator();
        } else {
          throw new ParserError(
            `Class ulla functions mattum thaan varanum (only functions allowed inside class body), got ${this.peek().value || this.peek().type}`,
            this.peek().line,
            this.peek().col
          );
        }
        this.skipNewlines();
      }
      this.consume(TokenType.DEDENT, "Dedent thevai (expected dedent closing class)");
    } else {
      // Single line pass or method
      if (this.match(TokenType.PASS)) {
        this.expectStatementTerminator();
      } else if (this.check(TokenType.FUN) || this.check(TokenType.SEYAL)) {
        methods.push(this.parseFunctionDef());
      }
    }

    return {
      type: 'ClassDef',
      name: nameToken.value,
      superClass,
      methods,
      line: token.line,
      col: token.col,
    };
  }

  private parseReturnStatement(): ReturnStatement {
    const token = this.advance(); // consume 'thirupikudu'
    let value: Expression | undefined = undefined;

    if (!this.check(TokenType.NEWLINE) && !this.check(TokenType.EOF) && !this.check(TokenType.SEMICOLON)) {
      value = this.parseExpression();
    }

    this.expectStatementTerminator();
    return {
      type: 'ReturnStatement',
      value,
      line: token.line,
      col: token.col,
    };
  }

  private parseTryCatchStatement(): TryCatchStatement {
    const token = this.advance(); // consume 'muyarchi'
    this.consume(TokenType.COLON, "':' thevai after muyarchi");
    const tryBlock = this.parseBlock();

    this.skipNewlines();
    let errorVar: string | undefined = undefined;
    let catchBlock: Statement[] = [];

    if (this.match(TokenType.THAVARU)) {
      if (this.check(TokenType.IDENTIFIER)) {
        errorVar = this.advance().value;
      }
      this.consume(TokenType.COLON, "':' thevai after thavaru");
      catchBlock = this.parseBlock();
    } else {
      throw new ParserError(
        "'thavaru' block thevai (expected 'thavaru' after 'muyarchi')",
        this.peek().line,
        this.peek().col
      );
    }

    let finallyBlock: Statement[] | undefined = undefined;
    this.skipNewlines();
    if (this.match(TokenType.KANDIPPA)) {
      this.consume(TokenType.COLON, "':' thevai after kandippa");
      finallyBlock = this.parseBlock();
    }

    return {
      type: 'TryCatchStatement',
      tryBlock,
      errorVar,
      catchBlock,
      finallyBlock,
      line: token.line,
      col: token.col,
    };
  }

  private parseGlobalStatement(): GlobalStatement {
    const token = this.advance(); // consume 'ulagam'
    const variables: string[] = [];

    do {
      const varToken = this.consume(
        TokenType.IDENTIFIER,
        "Variable peyar thevai (expected variable name for ulagam)"
      );
      variables.push(varToken.value);
    } while (this.match(TokenType.COMMA));

    this.expectStatementTerminator();
    return {
      type: 'GlobalStatement',
      variables,
      line: token.line,
      col: token.col,
    };
  }

  private parseImportStatement(): ImportStatement {
    const token = this.advance(); // consume 'import' or 'eduthu_vaa'
    const modToken = this.consume(
      TokenType.IDENTIFIER,
      "Module peyar thevai (expected module name)"
    );

    let alias: string | undefined = undefined;
    if (this.check(TokenType.IDENTIFIER) && this.peek().value === 'as') {
      this.advance();
      alias = this.consume(TokenType.IDENTIFIER, "Alias peyar thevai").value;
    }

    this.expectStatementTerminator();
    return {
      type: 'ImportStatement',
      moduleName: modToken.value,
      alias,
      line: token.line,
      col: token.col,
    };
  }

  private parseDeleteStatement(): DeleteStatement {
    const token = this.advance(); // consume 'del' or 'azhi'
    const target = this.parseCallOrAccess();
    if (
      target.type !== 'IdentifierExpr' &&
      target.type !== 'IndexExpr' &&
      target.type !== 'MemberExpr'
    ) {
      throw new ParserError("del target variable, index alladhu attribute-aga irukkanum", token.line, token.col);
    }
    this.expectStatementTerminator();
    return {
      type: 'DeleteStatement',
      target,
      line: token.line,
      col: token.col,
    };
  }

  private parseAssignOrExpressionStatement(): Statement {
    const startToken = this.peek();
    const expr = this.parseExpression();

    // Check for assignment operators: '=', '+=', '-=', '*=', '/='
    if (
      this.match(TokenType.ASSIGN) ||
      this.match(TokenType.PLUS_ASSIGN) ||
      this.match(TokenType.MINUS_ASSIGN) ||
      this.match(TokenType.STAR_ASSIGN) ||
      this.match(TokenType.SLASH_ASSIGN)
    ) {
      const opToken = this.previous();
      const value = this.parseExpression();
      this.expectStatementTerminator();

      if (
        expr.type !== 'IdentifierExpr' &&
        expr.type !== 'IndexExpr' &&
        expr.type !== 'MemberExpr'
      ) {
        throw new ParserError(
          "Invalid assignment target",
          startToken.line,
          startToken.col
        );
      }

      return {
        type: 'AssignStatement',
        target: expr,
        operator: opToken.value,
        value,
        line: startToken.line,
        col: startToken.col,
      };
    }

    this.expectStatementTerminator();
    return {
      type: 'ExprStatement',
      expression: expr,
      line: startToken.line,
      col: startToken.col,
    };
  }

  private parseBlock(): Statement[] {
    const statements: Statement[] = [];
    this.skipNewlines();

    if (this.match(TokenType.INDENT)) {
      while (!this.check(TokenType.DEDENT) && !this.isAtEnd()) {
        this.skipNewlines();
        if (this.check(TokenType.DEDENT)) break;
        const stmt = this.parseStatement();
        if (stmt) {
          statements.push(stmt);
        }
        this.skipNewlines();
      }
      this.consume(TokenType.DEDENT, "Block mudiyum pothu dedent thevai (expected dedent closing block)");
    } else {
      // Single-line block (e.g. `iruntha x > 0: sollu(x)`)
      const stmt = this.parseStatement();
      if (stmt) {
        statements.push(stmt);
      }
    }

    return statements;
  }

  // --- Expressions ---

  private parseExpression(): Expression {
    // Lambda expression
    if (this.match(TokenType.KUTTI_FUN)) {
      const token = this.previous();
      const params: string[] = [];
      if (!this.check(TokenType.COLON)) {
        do {
          const p = this.consume(TokenType.IDENTIFIER, "Parameter name expected in kutti_fun");
          params.push(p.value);
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.COLON, "':' thevai after kutti_fun parameters");
      const body = this.parseExpression();
      return {
        type: 'LambdaExpr',
        params,
        body,
        line: token.line,
        col: token.col,
      };
    }

    return this.parseLogicalOr();
  }

  private parseLogicalOr(): Expression {
    let expr = this.parseLogicalAnd();

    while (this.match(TokenType.ALLADHU)) {
      const op = this.previous();
      const right = this.parseLogicalAnd();
      expr = {
        type: 'LogicalExpr',
        left: expr,
        operator: 'alladhu',
        right,
        line: op.line,
        col: op.col,
      };
    }

    return expr;
  }

  private parseLogicalAnd(): Expression {
    let expr = this.parseLogicalNot();

    while (this.match(TokenType.MATRUM)) {
      const op = this.previous();
      const right = this.parseLogicalNot();
      expr = {
        type: 'LogicalExpr',
        left: expr,
        operator: 'matrum',
        right,
        line: op.line,
        col: op.col,
      };
    }

    return expr;
  }

  private parseLogicalNot(): Expression {
    if (this.match(TokenType.ILLAI)) {
      const op = this.previous();
      const argument = this.parseLogicalNot();
      return {
        type: 'UnaryExpr',
        operator: 'illai',
        argument,
        line: op.line,
        col: op.col,
      };
    }

    return this.parseComparison();
  }

  private parseComparison(): Expression {
    let expr = this.parseAddition();

    while (
      this.match(TokenType.EQUALS) ||
      this.match(TokenType.NOT_EQUALS) ||
      this.match(TokenType.LESS_THAN) ||
      this.match(TokenType.LESS_THAN_EQUALS) ||
      this.match(TokenType.GREATER_THAN) ||
      this.match(TokenType.GREATER_THAN_EQUALS) ||
      this.match(TokenType.ULLA) ||
      this.match(TokenType.KULLA)
    ) {
      const op = this.previous();
      const right = this.parseAddition();
      expr = {
        type: 'BinaryExpr',
        left: expr,
        operator: op.type === TokenType.ULLA || op.type === TokenType.KULLA ? 'in' : op.value,
        right,
        line: op.line,
        col: op.col,
      };
    }

    return expr;
  }

  private parseAddition(): Expression {
    let expr = this.parseMultiplication();

    while (this.match(TokenType.PLUS) || this.match(TokenType.MINUS)) {
      const op = this.previous();
      const right = this.parseMultiplication();
      expr = {
        type: 'BinaryExpr',
        left: expr,
        operator: op.value,
        right,
        line: op.line,
        col: op.col,
      };
    }

    return expr;
  }

  private parseMultiplication(): Expression {
    let expr = this.parseExponent();

    while (
      this.match(TokenType.MULTIPLY) ||
      this.match(TokenType.DIVIDE) ||
      this.match(TokenType.FLOOR_DIV) ||
      this.match(TokenType.MODULO)
    ) {
      const op = this.previous();
      const right = this.parseExponent();
      expr = {
        type: 'BinaryExpr',
        left: expr,
        operator: op.value,
        right,
        line: op.line,
        col: op.col,
      };
    }

    return expr;
  }

  private parseExponent(): Expression {
    let expr = this.parseUnary();

    if (this.match(TokenType.EXPONENT)) {
      const op = this.previous();
      // Exponentiation is right-associative
      const right = this.parseExponent();
      return {
        type: 'BinaryExpr',
        left: expr,
        operator: '**',
        right,
        line: op.line,
        col: op.col,
      };
    }

    return expr;
  }

  private parseUnary(): Expression {
    if (this.match(TokenType.MINUS) || this.match(TokenType.PLUS)) {
      const op = this.previous();
      const argument = this.parseUnary();
      return {
        type: 'UnaryExpr',
        operator: op.value,
        argument,
        line: op.line,
        col: op.col,
      };
    }

    return this.parseCallOrAccess();
  }

  private parseCallOrAccess(): Expression {
    let expr = this.parsePrimary();

    while (true) {
      if (this.match(TokenType.LPAREN)) {
        expr = this.finishCall(expr);
      } else if (this.match(TokenType.LBRACKET)) {
        const indexExpr = this.parseExpression();
        this.consume(TokenType.RBRACKET, "']' thevai after index");
        expr = {
          type: 'IndexExpr',
          object: expr,
          index: indexExpr,
          line: expr.line,
          col: expr.col,
        };
      } else if (this.match(TokenType.DOT)) {
        const propToken = this.consume(
          TokenType.IDENTIFIER,
          "Property peyar thevai after '.'"
        );
        expr = {
          type: 'MemberExpr',
          object: expr,
          property: propToken.value,
          line: propToken.line,
          col: propToken.col,
        };
      } else {
        break;
      }
    }

    return expr;
  }

  private finishCall(callee: Expression): CallExpr {
    const args: Expression[] = [];
    const kwargs: Record<string, Expression> = {};

    if (!this.check(TokenType.RPAREN)) {
      do {
        // Check for keyword argument e.g. sep=", " or end=""
        if (
          this.check(TokenType.IDENTIFIER) &&
          this.peekNextToken()?.type === TokenType.ASSIGN
        ) {
          const kwName = this.advance().value;
          this.advance(); // consume '='
          const kwVal = this.parseExpression();
          kwargs[kwName] = kwVal;
        } else {
          args.push(this.parseExpression());
        }
      } while (this.match(TokenType.COMMA));
    }

    const paren = this.consume(TokenType.RPAREN, "')' thevai after function arguments");
    return {
      type: 'CallExpr',
      callee,
      args,
      kwargs,
      line: paren.line,
      col: paren.col,
    };
  }

  private parsePrimary(): Expression {
    const token = this.peek();

    if (this.match(TokenType.NUMBER)) {
      return {
        type: 'LiteralExpr',
        value: token.value,
        rawType: 'number',
        line: token.line,
        col: token.col,
      };
    }

    if (this.match(TokenType.STRING)) {
      return {
        type: 'LiteralExpr',
        value: token.value,
        rawType: 'string',
        line: token.line,
        col: token.col,
      };
    }

    if (this.match(TokenType.UNMAI)) {
      return {
        type: 'LiteralExpr',
        value: true,
        rawType: 'boolean',
        line: token.line,
        col: token.col,
      };
    }

    if (this.match(TokenType.POI)) {
      return {
        type: 'LiteralExpr',
        value: false,
        rawType: 'boolean',
        line: token.line,
        col: token.col,
      };
    }

    if (this.match(TokenType.ONNUMILLA)) {
      return {
        type: 'LiteralExpr',
        value: null,
        rawType: 'null',
        line: token.line,
        col: token.col,
      };
    }

    // Tanglish 'sollu' as identifier or direct call
    if (this.match(TokenType.SOLLU)) {
      return {
        type: 'IdentifierExpr',
        name: 'sollu',
        line: token.line,
        col: token.col,
      };
    }

    // Tanglish 'kelu' as identifier or direct call
    if (this.match(TokenType.KELU)) {
      return {
        type: 'IdentifierExpr',
        name: 'kelu',
        line: token.line,
        col: token.col,
      };
    }

    // 'ithu' (self reference)
    if (this.match(TokenType.ITHU)) {
      return {
        type: 'IdentifierExpr',
        name: 'ithu',
        line: token.line,
        col: token.col,
      };
    }

    if (this.match(TokenType.IDENTIFIER)) {
      return {
        type: 'IdentifierExpr',
        name: token.value,
        line: token.line,
        col: token.col,
      };
    }

    // Grouping `(expr)`
    if (this.match(TokenType.LPAREN)) {
      const expr = this.parseExpression();
      this.consume(TokenType.RPAREN, "')' thevai after expression");
      return expr;
    }

    // List Literal `[a, b, c]`
    if (this.match(TokenType.LBRACKET)) {
      const elements: Expression[] = [];
      if (!this.check(TokenType.RBRACKET)) {
        do {
          this.skipNewlines();
          if (this.check(TokenType.RBRACKET)) break;
          elements.push(this.parseExpression());
          this.skipNewlines();
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RBRACKET, "']' thevai after list elements");
      return {
        type: 'ListLiteral',
        elements,
        line: token.line,
        col: token.col,
      };
    }

    // Dictionary Literal `{k: v, ...}`
    if (this.match(TokenType.LBRACE)) {
      const entries: { key: Expression; value: Expression }[] = [];
      if (!this.check(TokenType.RBRACE)) {
        do {
          this.skipNewlines();
          if (this.check(TokenType.RBRACE)) break;
          const key = this.parseExpression();
          this.consume(TokenType.COLON, "':' thevai between dictionary key and value");
          const value = this.parseExpression();
          entries.push({ key, value });
          this.skipNewlines();
        } while (this.match(TokenType.COMMA));
      }
      this.consume(TokenType.RBRACE, "'}' thevai after dictionary entries");
      return {
        type: 'DictLiteral',
        entries,
        line: token.line,
        col: token.col,
      };
    }

    throw new ParserError(
      `Unexpected token '${token.value || token.type}'`,
      token.line,
      token.col
    );
  }

  // --- Helpers ---

  private match(...types: TokenType[]): boolean {
    for (const type of types) {
      if (this.check(type)) {
        this.advance();
        return true;
      }
    }
    return false;
  }

  private check(type: TokenType): boolean {
    if (this.isAtEnd()) return false;
    return this.peek().type === type;
  }

  private advance(): Token {
    if (!this.isAtEnd()) this.current++;
    return this.previous();
  }

  private isAtEnd(): boolean {
    return this.peek().type === TokenType.EOF;
  }

  private peek(): Token {
    return this.tokens[this.current];
  }

  private peekNextToken(): Token | null {
    if (this.current + 1 >= this.tokens.length) return null;
    return this.tokens[this.current + 1];
  }

  private previous(): Token {
    return this.tokens[this.current - 1];
  }

  private consume(type: TokenType, message: string): Token {
    if (this.check(type)) return this.advance();
    throw new ParserError(message, this.peek().line, this.peek().col);
  }

  private skipNewlines() {
    while (this.match(TokenType.NEWLINE)) {
      // skip
    }
  }

  private expectStatementTerminator() {
    if (this.isAtEnd()) return;
    if (this.match(TokenType.SEMICOLON) || this.match(TokenType.NEWLINE)) {
      return;
    }
    if (this.check(TokenType.DEDENT) || this.check(TokenType.EOF)) {
      return;
    }
    // Allow ending at EOF
  }
}
