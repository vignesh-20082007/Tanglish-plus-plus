import { runTanglishCode } from './src/interpreter';
import * as fs from 'fs';

async function testDocsSnippets() {
  const content = fs.readFileSync('./src/components/DocsSidebar.tsx', 'utf-8');
  // Match id: '...' followed by example: '...' (escaped quotes inside single quotes)
  const regex = /id:\s*['"]([^'"]+)['"][\s\S]*?example:\s*'((?:\\'|[^'])*)'/g;
  let match;
  let count = 0;
  let failures: { id: string; error: string; code: string }[] = [];

  while ((match = regex.exec(content)) !== null) {
    const id = match[1];
    let exampleCode = match[2];
    // Unescape escaped quotes or newlines if any
    exampleCode = exampleCode.replace(/\\n/g, '\n').replace(/\\"/g, '"');
    count++;

    // Some snippets may need wrapping if they are single statements, otherwise run directly
    let testCode = exampleCode;
    if (id === 'thirupikudu' && exampleCode.startsWith('thirupikudu')) {
      testCode = 'fun test(x):\n    ' + exampleCode + '\nsollu(test(5))';
    } else if ((id === 'illatti' || id === 'illana') && !exampleCode.includes('iruntha')) {
      testCode = 'mark = 45\niruntha mark > 90:\n    sollu("A")\n' + exampleCode;
    }

    const res = await runTanglishCode({
      source: testCode,
      onRequestInput: async () => 'TestInput',
      onPrint: () => {},
    });

    if (!res.success) {
      failures.push({ id, error: res.error || 'Unknown error', code: testCode });
    }
  }

  console.log(`Tested ${count} doc snippets.`);
  if (failures.length > 0) {
    console.log(`FAILED ${failures.length} snippets:`);
    for (const f of failures) {
      console.log(`\nSnippet [${f.id}]:`);
      console.log(`Code:\n${f.code}`);
      console.log(`Error: ${f.error}`);
    }
  } else {
    console.log('All doc snippets passed successfully!');
  }
}

testDocsSnippets().catch(console.error);
