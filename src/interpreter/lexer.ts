import { Token, TokenType, KEYWORDS } from './tokens';

export class LexerError extends Error {
  line: number;
  col: number;
  constructor(message: string, line: number, col: number) {
    super(`LexerError [Line ${line}, Col ${col}]: ${message}`);
    this.name = 'LexerError';
    this.line = line;
    this.col = col;
  }
}

export class Lexer {
  private source: string;
  private tokens: Token[] = [];
  private current = 0;
  private line = 1;
  private col = 1;
  private indentStack: number[] = [0];
  private bracketDepth = 0;

  constructor(source: string) {
    // Normalize newlines to \n
    this.source = source.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  }

  public tokenize(): Token[] {
    this.tokens = [];
    this.current = 0;
    this.line = 1;
    this.col = 1;
    this.indentStack = [0];
    this.bracketDepth = 0;

    let isAtStartOfLine = true;

    while (!this.isAtEnd()) {
      if (isAtStartOfLine) {
        isAtStartOfLine = false;

        // Skip blank lines or comments-only lines
        const remainingFromLine = this.source.slice(this.current);
        const lineMatch = remainingFromLine.match(/^[ \t]*(?:#.*)?(?:\n|$)/);
        if (lineMatch && lineMatch[0].length > 0) {
          // This line is entirely blank or comment
          this.advanceBy(lineMatch[0].length);
          if (lineMatch[0].endsWith('\n')) {
            this.line++;
            this.col = 1;
            isAtStartOfLine = true;
          }
          continue;
        }

        // Measure indentation
        let indent = 0;
        let indentChars = 0;
        while (!this.isAtEnd()) {
          const ch = this.peek();
          if (ch === ' ') {
            indent += 1;
            indentChars++;
            this.advance();
          } else if (ch === '\t') {
            indent += 4;
            indentChars++;
            this.advance();
          } else {
            break;
          }
        }

        // If not inside parentheses/brackets/braces, process indent
        if (this.bracketDepth === 0) {
          const currentIndent = this.indentStack[this.indentStack.length - 1];
          if (indent > currentIndent) {
            this.indentStack.push(indent);
            this.tokens.push({
              type: TokenType.INDENT,
              value: indent,
              line: this.line,
              col: this.col,
            });
          } else if (indent < currentIndent) {
            while (
              this.indentStack.length > 1 &&
              this.indentStack[this.indentStack.length - 1] > indent
            ) {
              this.indentStack.pop();
              this.tokens.push({
                type: TokenType.DEDENT,
                value: this.indentStack[this.indentStack.length - 1],
                line: this.line,
                col: this.col,
              });
            }
            if (this.indentStack[this.indentStack.length - 1] !== indent) {
              throw new LexerError(
                `IndentationError: unindent does not match any outer indentation level (expected ${this.indentStack[this.indentStack.length - 1]}, got ${indent})`,
                this.line,
                this.col
              );
            }
          }
        }
      }

      if (this.isAtEnd()) break;

      const char = this.peek();

      // Whitespace
      if (char === ' ' || char === '\t') {
        this.advance();
        continue;
      }

      // Comments
      if (char === '#') {
        while (!this.isAtEnd() && this.peek() !== '\n') {
          this.advance();
        }
        continue;
      }

      // Newline
      if (char === '\n') {
        this.advance();
        this.line++;
        this.col = 1;
        isAtStartOfLine = true;
        if (this.bracketDepth === 0) {
          // Avoid duplicate NEWLINE tokens
          if (
            this.tokens.length > 0 &&
            this.tokens[this.tokens.length - 1].type !== TokenType.NEWLINE &&
            this.tokens[this.tokens.length - 1].type !== TokenType.INDENT
          ) {
            this.tokens.push({
              type: TokenType.NEWLINE,
              value: '\n',
              line: this.line - 1,
              col: this.col,
            });
          }
        }
        continue;
      }

      // Multi-line or Single-line Strings
      if (char === '"' || char === "'") {
        this.readString(char);
        continue;
      }

      // Numbers
      if (this.isDigit(char)) {
        this.readNumber();
        continue;
      }

      // Identifiers or Keywords
      if (this.isAlpha(char) || char === '_') {
        this.readIdentifier();
        continue;
      }

      // Two-character operators
      const twoChar = this.source.slice(this.current, this.current + 2);
      if (twoChar === '**') {
        this.tokens.push(this.makeToken(TokenType.EXPONENT, '**', 2));
        continue;
      }
      if (twoChar === '//') {
        this.tokens.push(this.makeToken(TokenType.FLOOR_DIV, '//', 2));
        continue;
      }
      if (twoChar === '==') {
        this.tokens.push(this.makeToken(TokenType.EQUALS, '==', 2));
        continue;
      }
      if (twoChar === '!=') {
        this.tokens.push(this.makeToken(TokenType.NOT_EQUALS, '!=', 2));
        continue;
      }
      if (twoChar === '<=') {
        this.tokens.push(this.makeToken(TokenType.LESS_THAN_EQUALS, '<=', 2));
        continue;
      }
      if (twoChar === '>=') {
        this.tokens.push(this.makeToken(TokenType.GREATER_THAN_EQUALS, '>=', 2));
        continue;
      }
      if (twoChar === '+=') {
        this.tokens.push(this.makeToken(TokenType.PLUS_ASSIGN, '+=', 2));
        continue;
      }
      if (twoChar === '-=') {
        this.tokens.push(this.makeToken(TokenType.MINUS_ASSIGN, '-=', 2));
        continue;
      }
      if (twoChar === '*=') {
        this.tokens.push(this.makeToken(TokenType.STAR_ASSIGN, '*=', 2));
        continue;
      }
      if (twoChar === '/=') {
        this.tokens.push(this.makeToken(TokenType.SLASH_ASSIGN, '/=', 2));
        continue;
      }

      // Single-character tokens
      switch (char) {
        case '+':
          this.tokens.push(this.makeToken(TokenType.PLUS, '+'));
          break;
        case '-':
          this.tokens.push(this.makeToken(TokenType.MINUS, '-'));
          break;
        case '*':
          this.tokens.push(this.makeToken(TokenType.MULTIPLY, '*'));
          break;
        case '/':
          this.tokens.push(this.makeToken(TokenType.DIVIDE, '/'));
          break;
        case '%':
          this.tokens.push(this.makeToken(TokenType.MODULO, '%'));
          break;
        case '<':
          this.tokens.push(this.makeToken(TokenType.LESS_THAN, '<'));
          break;
        case '>':
          this.tokens.push(this.makeToken(TokenType.GREATER_THAN, '>'));
          break;
        case '=':
          this.tokens.push(this.makeToken(TokenType.ASSIGN, '='));
          break;
        case '(':
          this.bracketDepth++;
          this.tokens.push(this.makeToken(TokenType.LPAREN, '('));
          break;
        case ')':
          if (this.bracketDepth > 0) this.bracketDepth--;
          this.tokens.push(this.makeToken(TokenType.RPAREN, ')'));
          break;
        case '[':
          this.bracketDepth++;
          this.tokens.push(this.makeToken(TokenType.LBRACKET, '['));
          break;
        case ']':
          if (this.bracketDepth > 0) this.bracketDepth--;
          this.tokens.push(this.makeToken(TokenType.RBRACKET, ']'));
          break;
        case '{':
          this.bracketDepth++;
          this.tokens.push(this.makeToken(TokenType.LBRACE, '{'));
          break;
        case '}':
          if (this.bracketDepth > 0) this.bracketDepth--;
          this.tokens.push(this.makeToken(TokenType.RBRACE, '}'));
          break;
        case ':':
          this.tokens.push(this.makeToken(TokenType.COLON, ':'));
          break;
        case ',':
          this.tokens.push(this.makeToken(TokenType.COMMA, ','));
          break;
        case '.':
          this.tokens.push(this.makeToken(TokenType.DOT, '.'));
          break;
        case ';':
          this.tokens.push(this.makeToken(TokenType.SEMICOLON, ';'));
          break;
        default:
          throw new LexerError(`Unexpected character '${char}'`, this.line, this.col);
      }
    }

    // Final dedents if indented at EOF
    if (
      this.tokens.length > 0 &&
      this.tokens[this.tokens.length - 1].type !== TokenType.NEWLINE
    ) {
      this.tokens.push({
        type: TokenType.NEWLINE,
        value: '\n',
        line: this.line,
        col: this.col,
      });
    }

    while (this.indentStack.length > 1) {
      this.indentStack.pop();
      this.tokens.push({
        type: TokenType.DEDENT,
        value: this.indentStack[this.indentStack.length - 1],
        line: this.line,
        col: this.col,
      });
    }

    this.tokens.push({
      type: TokenType.EOF,
      value: null,
      line: this.line,
      col: this.col,
    });

    return this.tokens;
  }

  private readString(quote: string) {
    const startLine = this.line;
    const startCol = this.col;

    // Check for triple quote
    const isTriple =
      this.source.slice(this.current, this.current + 3) === quote.repeat(3);

    if (isTriple) {
      this.advanceBy(3);
      let content = '';
      while (!this.isAtEnd()) {
        if (this.source.slice(this.current, this.current + 3) === quote.repeat(3)) {
          this.advanceBy(3);
          this.tokens.push({
            type: TokenType.STRING,
            value: content,
            line: startLine,
            col: startCol,
          });
          return;
        }

        const ch = this.peek();
        if (ch === '\n') {
          this.line++;
          this.col = 1;
        }
        content += ch;
        this.advance();
      }
      throw new LexerError('Unterminated triple-quoted string', startLine, startCol);
    }

    // Single quote string
    this.advance(); // consume opening quote
    let content = '';

    while (!this.isAtEnd()) {
      const ch = this.peek();
      if (ch === quote) {
        this.advance(); // consume closing quote
        this.tokens.push({
          type: TokenType.STRING,
          value: content,
          line: startLine,
          col: startCol,
        });
        return;
      }
      if (ch === '\n') {
        throw new LexerError('Unterminated string literal (newline in string)', startLine, startCol);
      }
      if (ch === '\\') {
        this.advance(); // consume '\'
        if (this.isAtEnd()) {
          throw new LexerError('Unfinished escape sequence in string', startLine, startCol);
        }
        const esc = this.peek();
        switch (esc) {
          case 'n':
            content += '\n';
            break;
          case 't':
            content += '\t';
            break;
          case 'r':
            content += '\r';
            break;
          case '\\':
            content += '\\';
            break;
          case '"':
            content += '"';
            break;
          case "'":
            content += "'";
            break;
          default:
            content += '\\' + esc;
            break;
        }
        this.advance();
      } else {
        content += ch;
        this.advance();
      }
    }

    throw new LexerError('Unterminated string literal', startLine, startCol);
  }

  private readNumber() {
    const startCol = this.col;
    let numStr = '';
    let hasDot = false;

    while (!this.isAtEnd()) {
      const ch = this.peek();
      if (this.isDigit(ch)) {
        numStr += ch;
        this.advance();
      } else if (ch === '.' && !hasDot && this.isDigit(this.peekNext())) {
        hasDot = true;
        numStr += ch;
        this.advance();
      } else {
        break;
      }
    }

    const value = hasDot ? parseFloat(numStr) : parseInt(numStr, 10);
    this.tokens.push({
      type: TokenType.NUMBER,
      value,
      line: this.line,
      col: startCol,
    });
  }

  private readIdentifier() {
    const startCol = this.col;
    let id = '';

    while (!this.isAtEnd()) {
      const ch = this.peek();
      if (this.isAlpha(ch) || this.isDigit(ch) || ch === '_') {
        id += ch;
        this.advance();
      } else {
        break;
      }
    }

    const keywordType = KEYWORDS[id];
    if (keywordType !== undefined) {
      this.tokens.push({
        type: keywordType,
        value: id,
        line: this.line,
        col: startCol,
      });
    } else {
      this.tokens.push({
        type: TokenType.IDENTIFIER,
        value: id,
        line: this.line,
        col: startCol,
      });
    }
  }

  private makeToken(type: TokenType, value: any, length = 1): Token {
    const token: Token = {
      type,
      value,
      line: this.line,
      col: this.col,
    };
    this.advanceBy(length);
    return token;
  }

  private advance(): string {
    const ch = this.source[this.current++];
    this.col++;
    return ch;
  }

  private advanceBy(count: number) {
    for (let i = 0; i < count; i++) {
      this.advance();
    }
  }

  private peek(): string {
    if (this.isAtEnd()) return '\0';
    return this.source[this.current];
  }

  private peekNext(): string {
    if (this.current + 1 >= this.source.length) return '\0';
    return this.source[this.current + 1];
  }

  private isAtEnd(): boolean {
    return this.current >= this.source.length;
  }

  private isDigit(ch: string): boolean {
    return ch >= '0' && ch <= '9';
  }

  private isAlpha(ch: string): boolean {
    return (
      (ch >= 'a' && ch <= 'z') ||
      (ch >= 'A' && ch <= 'Z') ||
      // Support unicode tamil characters if in identifier
      ch.charCodeAt(0) > 127
    );
  }
}
