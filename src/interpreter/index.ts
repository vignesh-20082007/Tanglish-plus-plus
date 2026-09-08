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
    const errorMsg = err.message || String(err);
    if (options.onPrint) {
      options.onPrint(`\n\x1b[31m${errorMsg}\x1b[0m\n`);
    }
    return {
      success: false,
      error: errorMsg,
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
