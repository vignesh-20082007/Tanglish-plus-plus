/**
 * Formats Tanglish++ code with proper 4-space block indentation.
 * Maintains block stacks for classes, functions, loops, conditionals, and try/catch.
 * Accurately handles dedents when original indentation decreases, or dedent keywords are encountered.
 */
export function formatTanglishCode(code: string): string {
  const lines = code.split('\n');
  const result: string[] = [];
  const indentStack: number[] = [0];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      result.push('');
      continue;
    }

    const originalIndent = (raw.match(/^[ \t]*/) || [''])[0].length;
    const isDedentKeyword = /^(illatti|illana|thavaru|kandippa|athuvuillina|oruvelaillina)\b/.test(trimmed);

    const prevNonEmpty = result.filter(l => l.trim().length > 0);
    const prevNonEmptyLine = prevNonEmpty.length > 0 ? prevNonEmpty[prevNonEmpty.length - 1] : '';
    const prevEndedWithColon = prevNonEmptyLine.trim().endsWith(':');

    let currentIndent = indentStack[indentStack.length - 1];

    if (isDedentKeyword) {
      // Dedent keywords match the indentation level of their corresponding opener
      if (indentStack.length > 1) {
        currentIndent = Math.max(0, indentStack[indentStack.length - 1] - 4);
      }
    } else if (originalIndent < currentIndent && !prevEndedWithColon) {
      // User explicitly dedented to close one or more blocks
      const targetIndent = Math.round(originalIndent / 4) * 4;
      while (indentStack.length > 1 && indentStack[indentStack.length - 1] > targetIndent) {
        indentStack.pop();
      }
      currentIndent = indentStack[indentStack.length - 1];
    }

    result.push(' '.repeat(currentIndent) + trimmed);

    // If current statement ends with ':', next line starts a block (+4 spaces)
    if (trimmed.endsWith(':')) {
      if (isDedentKeyword) {
        indentStack[indentStack.length - 1] = currentIndent + 4;
      } else {
        indentStack.push(currentIndent + 4);
      }
    }
  }

  return result.join('\n');
}
