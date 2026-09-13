import { Lexer } from './lexer';
import { Parser } from './parser';
import { Evaluator, EvaluatorOptions } from './evaluator';

export interface RunOptions extends EvaluatorOptions {
  source: string;
}

export interface RunResult {
  success: boolean;
  error?: string;
  executionTimeMs: number;
}

export function formatTanglishTraceback(err: any, source: string): { formatted: string; clean: string } {
  let line = err.line;
  let col = err.col;
  const rawMsg = err.rawMessage || err.message || String(err);

  // Fallback regex parsing if line/col wasn't directly on error object
  if (line === undefined) {
    const match = rawMsg.match(/(?:Line|line)\s*(\d+)(?:,\s*(?:Col|col)\s*(\d+))?/i);
    if (match) {
      line = parseInt(match[1], 10);
      if (match[2]) col = parseInt(match[2], 10);
    }
  }

  // Clean error message removing redundant prefix
  let cleanMsg = rawMsg.replace(/^(?:RuntimeError|ParserError|LexerError)\s*\[Line\s*\d+,\s*Col\s*\d+\]:\s*/i, '');
  const errorType = err.errorType || err.name || 'SeyalMuraiThavaru (RuntimeError)';

  if (line !== undefined) {
    const lines = source.split('\n');
    const lineIdx = line - 1;
    const sourceLine = lines[lineIdx] !== undefined ? lines[lineIdx] : '';
    const safeCol = col !== undefined && col > 0 ? col : 1;
    const caret = ' '.repeat(Math.max(0, safeCol - 1)) + '^';

    const formatted = [
      `\x1b[33mTraceback (kadasithu kootu / Most recent call last):\x1b[0m`,
      `\x1b[36m  File "main.tpp", line ${line}, col ${safeCol}:\x1b[0m`,
      `\x1b[37m    ${sourceLine}\x1b[0m`,
      `\x1b[31m    ${caret}\x1b[0m`,
      `\x1b[1;31m${cleanMsg.includes(':') ? cleanMsg : errorType + ': ' + cleanMsg}\x1b[0m`,
    ].join('\n');

    const clean = [
      `Traceback (Most recent call last):`,
      `  File "main.tpp", line ${line}, col ${safeCol}:`,
      `    ${sourceLine}`,
      `    ${caret}`,
      `${cleanMsg.includes(':') ? cleanMsg : errorType + ': ' + cleanMsg}`,
    ].join('\n');

    return { formatted, clean };
  }

  const formatted = [
    `\x1b[33mTraceback (kadasithu kootu / Error encountered):\x1b[0m`,
    `\x1b[1;31m${cleanMsg.includes(':') ? cleanMsg : errorType + ': ' + cleanMsg}\x1b[0m`,
  ].join('\n');

  return { formatted, clean: cleanMsg };
}

export async function runTanglishCode(options: RunOptions): Promise<RunResult> {
  const startTime = performance.now();

  try {
    // 1. Tokenize
    const lexer = new Lexer(options.source);
    const tokens = lexer.tokenize();

    // 2. Parse
    const parser = new Parser(tokens);
    const ast = parser.parse();

    // 3. Evaluate
    const evaluator = new Evaluator(options);
    await evaluator.evaluate(ast);

    const endTime = performance.now();
    return {
      success: true,
      executionTimeMs: Math.round(endTime - startTime),
    };
  } catch (err: any) {
    const endTime = performance.now();
    const { formatted, clean } = formatTanglishTraceback(err, options.source);

    if (options.onPrint) {
      options.onPrint(`\n${formatted}\n`);
    }

    return {
      success: false,
      error: clean,
      executionTimeMs: Math.round(endTime - startTime),
    };
  }
}

export * from './tokens';
export * from './lexer';
export * from './ast';
export * from './parser';
export * from './environment';
export * from './evaluator';
export * from './modules';
