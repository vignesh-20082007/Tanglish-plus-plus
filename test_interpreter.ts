import { runTanglishCode } from './src/interpreter';

async function testAll() {
  console.log('=== Extended Tanglish++ Tests ===\n');

  let outputBuffer: string[] = [];
  const capturePrint = (text: string) => outputBuffer.push(text);

  // Test 11: Logical operators (matrum, alladhu, illai) & unmai/poi
  console.log('Test 11: matrum, alladhu, illai & unmai/poi');
  outputBuffer = [];
  const code11 = `
a = unmai
b = poi

iruntha a matrum (illai b):
    sollu("Logic 1 Passed")

iruntha b alladhu a:
    sollu("Logic 2 Passed")
`;
  const res11 = await runTanglishCode({ source: code11, onPrint: capturePrint });
  console.log('Result 11:', res11.success ? 'PASS' : 'FAIL', outputBuffer.join(''));

  // Test 12: Builtin alavu() and vagai()
  console.log('\nTest 12: alavu() & vagai()');
  outputBuffer = [];
  const code12 = `
list1 = [10, 20, 30]
str1 = "Tanglish"
sollu("List length:", alavu(list1))
sollu("String length:", alavu(str1))
sollu("List type:", vagai(list1))
sollu("Number type:", vagai(42))
`;
  const res12 = await runTanglishCode({ source: code12, onPrint: capturePrint });
  console.log('Result 12:', res12.success ? 'PASS' : 'FAIL', outputBuffer.join(''));

  // Test 13: String escaping (\n and \t)
  console.log('\nTest 13: String escaping');
  outputBuffer = [];
  const code13 = `
msg = "Vanakkam\\n\\tTamizha"
sollu(msg)
`;
  const res13 = await runTanglishCode({ source: code13, onPrint: capturePrint });
  console.log('Result 13:', res13.success ? 'PASS' : 'FAIL', outputBuffer.join(''));

  // Test 14: Neramkaalam async sleep
  console.log('\nTest 14: neramkaalam.thethi() & thoongu()');
  outputBuffer = [];
  const code14 = `
import neramkaalam
sollu("Today date:", neramkaalam.thethi())
neramkaalam.thoongu(0.05)
sollu("Awake!")
`;
  const res14 = await runTanglishCode({ source: code14, onPrint: capturePrint });
  console.log('Result 14:', res14.success ? 'PASS' : 'FAIL', outputBuffer.join(''));
}

testAll().catch(err => console.error('Extended Tests Failed:', err));
