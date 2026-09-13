import { runTanglishCode } from './src/interpreter';

async function testNewFeatures() {
  console.log('=== Testing Include, From-Import, Official Keywords, and Tracebacks ===\n');

  let output: string[] = [];
  const capture = (t: string) => output.push(t);

  // Test 1: include statement & function
  console.log('Test 1: include ganitham & include("os")');
  output = [];
  const code1 = `
include ganitham
include("os")
sollu("Square root of 81:", ganitham.sqrt(81))
sollu("OS name:", os.name)
`;
  const res1 = await runTanglishCode({ source: code1, onPrint: capture });
  console.log('Result 1:', res1.success ? 'PASS' : 'FAIL\n' + res1.error, output.join(''));

  // Test 2: from ... import ... and wildcard
  console.log('Test 2: from ... import ... and wildcard');
  output = [];
  const code2 = `
from ganitham import sqrt, PI as pi_val
sollu("sqrt(100):", sqrt(100))
sollu("pi_val:", pi_val)

from kanakkeduppu import *
scores = [10, 20, 30]
sollu("Mean:", mean(scores))
`;
  const res2 = await runTanglishCode({ source: code2, onPrint: capture });
  console.log('Result 2:', res2.success ? 'PASS' : 'FAIL\n' + res2.error, output.join(''));

  // Test 3: Official Keywords from Creator's PDF (eduthuko, engaerunthu, oruvelaerunth, etc.)
  console.log('Test 3: Official Spec Keywords (oruvelaerunth, athuvuillina, etc.)');
  output = [];
  const code3 = `
engaerunthu ganitham eduthuko sqrt
sollu("Imported via engaerunthu/eduthuko:", sqrt(64))

val = 15
oruvelaerunth val > 20:
    sollu("Greater than 20")
oruvelaillina val == 15:
    sollu("Matched 15 via oruvelaillina!")
athuvuillina:
    sollu("Else block")

# Test lineda (lambda) and ethumeilla (None)
sq = lineda x: x * x
sollu("lineda 9:", sq(9))
empty_val = ethumeilla
sollu("Is None:", empty_val == onnumilla)

# Test neruthu (break), neecontinue (continue), apro (and), illa (not)
varisaiya i kulla range(1, 10):
    iruntha (i == 2) apro (illa (i == 3)):
        neecontinue
    iruntha i == 4:
        sollu("Breaking at:", i)
        neruthu
`;
  const res3 = await runTanglishCode({ source: code3, onPrint: capture });
  console.log('Result 3:', res3.success ? 'PASS' : 'FAIL\n' + res3.error, output.join(''));

  // Test 4: Custom exception raising and try/catch/finally
  console.log('Test 4: raise & muyarchi/thavaru/kandippa');
  output = [];
  const code4 = `
fun check_age(age):
    iruntha age < 18:
        raise "Vayasu 18-ku kuraiva irukku (Age below 18)"
    thirupikudu "Eligible"

muyarchi:
    check_age(15)
thavaru err:
    sollu("Caught custom error:", err)
kandippa:
    sollu("Kandippa executed cleanly!")
`;
  const res4 = await runTanglishCode({ source: code4, onPrint: capture });
  console.log('Result 4:', res4.success ? 'PASS' : 'FAIL\n' + res4.error, output.join(''));

  // Test 5: Visual Traceback on unhandled runtime error
  console.log('Test 5: Visual Traceback formatting');
  output = [];
  const code5 = `
a = 100
b = 0
vidai = a / b
sollu("Result:", vidai)
`;
  const res5 = await runTanglishCode({ source: code5, onPrint: capture });
  console.log('Result 5 expected failure:', !res5.success ? 'PASS (Traceback shown below)' : 'UNEXPECTED PASS');
  console.log(output.join(''));

  // Test 6: Virtual file system include
  console.log('Test 6: include "program.tpp" from VirtualFS');
  output = [];
  const code6 = `
import os
os.writeFile("/home/user/helper.tpp", "sollu('Hello from included helper file!')")
include "helper.tpp"
`;
  const res6 = await runTanglishCode({ source: code6, onPrint: capture });
  console.log('Result 6:', res6.success ? 'PASS' : 'FAIL\n' + res6.error, output.join(''));
}

testNewFeatures().catch(console.error);
