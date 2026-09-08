/**
 * Formats Tanglish++ code with proper 4-space block indentation.
 * Ensures loop bodies (varisaiya ...:), conditional blocks (iruntha/illatti/illana),
 * function definitions (fun/seyal), and classes automatically receive 4 spaces.
 */
export function formatTanglishCode(code: string): string {
  const lines = code.split('\n');
  let currentIndent = 0;
  const result: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const trimmed = raw.trim();

    if (!trimmed) {
      result.push('');
      continue;
    }

    // Dedent keywords (illatti, illana, thavaru, kandippa)
    const isDedent = /^(illatti|illana|thavaru|kandippa)\b/.test(trimmed);
    if (isDedent) {
      currentIndent = Math.max(0, currentIndent - 4);
    }

    const originalIndent = (raw.match(/^[ \t]*/) || [''])[0].length;
    const prevNonEmpty = result.filter(l => l.trim().length > 0);
    const prevNonEmptyLine = prevNonEmpty.length > 0 ? prevNonEmpty[prevNonEmpty.length - 1] : '';
    const prevEndedWithColon = prevNonEmptyLine.trim().endsWith(':');

    if (prevEndedWithColon) {
      // Must be indented at least 4 spaces inside block
      if (currentIndent === 0) currentIndent = 4;
    } else if (originalIndent === 0 && !prevEndedWithColon) {
      // Line is explicitly at column 0 to end the block
      currentIndent = 0;
    }

    result.push(' '.repeat(currentIndent) + trimmed);

    // If current statement ends with ':', next line starts a block (+4 spaces)
    if (trimmed.endsWith(':')) {
      currentIndent += 4;
    }
  }

  return result.join('\n');
}
