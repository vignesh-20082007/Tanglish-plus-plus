import { TEMPLATES } from './src/templates';
import { runTanglishCode } from './src/interpreter';

async function testAllTemplates() {
  console.log('Testing all ' + TEMPLATES.length + ' templates...\n');
  let failures = 0;

  for (const tmpl of TEMPLATES) {
    console.log(`Testing: [${tmpl.id}] ${tmpl.name}`);
    let outputLines: string[] = [];
    const res = await runTanglishCode({
      source: tmpl.code,
      onPrint: (t) => outputLines.push(t),
      onRequestInput: async (prompt) => {
        console.log(`  (Input requested: "${prompt}") -> Auto-providing "Vignesh" or "95"`);
        if (prompt.toLowerCase().includes('mark')) return '95';
        return 'Vignesh';
      },
    });

    if (res.success) {
      console.log(`  -> SUCCESS in ${res.executionTimeMs}ms`);
    } else {
      failures++;
      console.error(`  -> FAILED: ${res.error}`);
      console.log('  -> Output before failure:');
      console.log(outputLines.join(''));
    }
  }

  console.log(`\nResults: ${TEMPLATES.length - failures}/${TEMPLATES.length} templates passed.`);
  if (failures > 0) process.exit(1);
}

testAllTemplates().catch((e) => {
  console.error(e);
  process.exit(1);
});
