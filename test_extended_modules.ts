import { runTanglishCode } from './src/interpreter';

async function testExtendedLibraries() {
  console.log('=== Testing 24 Extended Standard Libraries in Tanglish++ ===\n');

  let outputBuffer: string[] = [];
  const capturePrint = (text: string) => outputBuffer.push(text);

  // Test 1: kondu_va import & Networking / Web (kettuko, thodarbu, anjal, html/xml)
  console.log('Test 1: kondu_va & Web modules (kettuko, thodarbu, anjal, html)');
  outputBuffer = [];
  const code1 = `
kondu_va thodarbu
kondu_va anjal
kondu_va html

sock = thodarbu.connect("localhost", 8080)
sollu("Socket sent bytes:", sock.send("GET / HTTP/1.1"))
sollu("Socket recv:", sock.recv(32))

mail_res = anjal.send("test@tamil.com", "Vanakkam!")
sollu("Anjal result:", mail_res)

raw_html = "<script>alert('Tamil');</script>"
esc_html = html.escape(raw_html)
sollu("Escaped HTML:", esc_html)
sollu("Unescaped HTML:", html.unescape(esc_html))
`;
  const res1 = await runTanglishCode({ source: code1, onPrint: capturePrint });
  console.log('Result 1:', res1.success ? 'PASS' : 'FAIL\n' + res1.error, outputBuffer.join(''));

  // Test 2: Data & Storage (csv, sqlite3, semipu, vagaigal, copy)
  console.log('\nTest 2: Data & Storage (csv, sqlite3, semipu, vagaigal, copy)');
  outputBuffer = [];
  const code2 = `
kondu_va csv
kondu_va sqlite3
kondu_va semipu
kondu_va vagaigal
kondu_va copy

# vagaigal.Counter
items = ["apple", "mango", "apple", "banana", "mango", "apple"]
counts = vagaigal.Counter(items)
sollu("Counter:", counts)

# sqlite3
db = sqlite3.connect(":memory:")
db.execute("CREATE TABLE students (id INT, name TEXT)")
db.execute("INSERT INTO students VALUES (101, 'Karthik')")
rows = db.execute("SELECT * FROM users").fetchall()
sollu("SQLite users count:", alavu(rows))

# csv
csv_text = csv.stringify([["Name", "Score"], ["Priya", 98], ["Vijay", 85]])
sollu("CSV stringified:\\n" + csv_text)
parsed_csv = csv.parse(csv_text)
sollu("CSV parsed rows:", alavu(parsed_csv))

# semipu (pickle)
data = {"language": "Tanglish++", "fast": unmai}
dumped = semipu.dumps(data)
sollu("Pickled (semipu):", dumped)
loaded = semipu.loads(dumped)
sollu("Unpickled matches:", loaded["language"])

# copy
original = [1, 2, [3, 4]]
cloned = copy.deepcopy(original)
sollu("Deepcopy:", cloned)
`;
  const res2 = await runTanglishCode({ source: code2, onPrint: capturePrint });
  console.log('Result 2:', res2.success ? 'PASS' : 'FAIL\n' + res2.error, outputBuffer.join(''));

  // Test 3: System & Security (medai, thunai, poottu, ragasiyam, maatri, adaiyalam)
  console.log('\nTest 3: System & Security (medai, thunai, poottu, ragasiyam, maatri, adaiyalam)');
  outputBuffer = [];
  const code3 = `
kondu_va medai
kondu_va thunai
kondu_va poottu
kondu_va ragasiyam
kondu_va maatri
kondu_va adaiyalam

sollu("Platform system:", medai.system)
sollu("Subprocess run:", thunai.run("ls -la")["stdout"])

hash_sha = poottu.sha256("vanakkam")
hash_md5 = poottu.md5("vanakkam")
sollu("SHA256:", hash_sha)
sollu("MD5:", hash_md5)

sec_token = ragasiyam.token_hex(8)
sollu("Secrets token_hex:", sec_token)

b64_enc = maatri.encode("Tanglish Programming")
sollu("Base64 Encoded:", b64_enc)
sollu("Base64 Decoded:", maatri.decode(b64_enc))

uid = adaiyalam.uuid4()
sollu("UUID4 generated:", uid)
`;
  const res3 = await runTanglishCode({ source: code3, onPrint: capturePrint });
  console.log('Result 3:', res3.success ? 'PASS' : 'FAIL\n' + res3.error, outputBuffer.join(''));

  // Test 4: Utility & Dev Tools (kattu, pathivu, sodhanai, nagarvu, naalkati, thadam, parisodhanai, kattalai, neram, ilai)
  console.log('\nTest 4: Utility & Dev Tools (pathivu, sodhanai, naalkati, kattalai, neram, ilai)');
  outputBuffer = [];
  const code4 = `
kondu_va pathivu
kondu_va sodhanai
kondu_va naalkati
kondu_va kattalai
kondu_va neram
kondu_va ilai

sollu(pathivu.info("Application starting up"))
sollu(pathivu.warn("Sample warning test"))

sodhanai.assert_equal(5 * 5, 25, "Math assertion")
sollu("Unit test assertion passed!")

cal = naalkati.month(2026, 9)
sollu("September 2026 Calendar:\\n" + cal)

parser = kattalai.ArgumentParser()
parser.add_argument("--port", 5173)
sollu("Parsed CLI args:", parser.parse_args())

start_t = neram.time()
neram.sleep(20)
sollu("Neram time stamp valid:", start_t > 0)

# ilai (threading)
fun worker():
    sollu("Thread worker running in parallel!")

t = ilai.Thread(worker)
t.start()
t.join()
sollu("All tests finished.")
`;
  const res4 = await runTanglishCode({ source: code4, onPrint: capturePrint });
  console.log('Result 4:', res4.success ? 'PASS' : 'FAIL\n' + res4.error, outputBuffer.join(''));

  // Test 5: varisaiya i kulla range(start, stop, step)
  console.log('\nTest 5: varisaiya i kulla range(1, 11)');
  outputBuffer = [];
  const code5 = `
total = 0
varisaiya i kulla range(1, 11):
    total += i
sollu("Sum 1 to 10:", total)
`;
  const res5 = await runTanglishCode({ source: code5, onPrint: capturePrint });
  console.log('Result 5:', res5.success ? 'PASS' : 'FAIL\n' + res5.error, outputBuffer.join(''));
}

testExtendedLibraries().catch(err => console.error('Extended test failure:', err));

