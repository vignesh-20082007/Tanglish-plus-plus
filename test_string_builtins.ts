import { runTanglishCode } from './src/interpreter';

async function runTests() {
  console.log('=== Running String Built-ins Tests ===\n');

  const outputs: string[] = [];
  const capturePrint = (t: string) => outputs.push(t);

  const testCode = `
# 1. len()
s = "hello"
sollu("len(s):", len(s))
sollu("s.len():", s.len())
sollu("len([1, 2, 3, 4]):", len([1, 2, 3, 4]))

# 2. capitalize()
sollu("capitalize('hello world'):", "hello world".capitalize())
sollu("capitalize func:", capitalize("hello world"))

# 3. centre() / center()
sollu("centre(11, '-'):", "cat".centre(11, "-"))
sollu("center(10, '*'):", "dog".center(10, "*"))
sollu("centre func:", centre("hey", 7, "="))

# 4. find()
text = "vanakkam tamil nadu"
sollu("find 'tamil':", text.find("tamil"))
sollu("find 'python':", text.find("python"))
sollu("find func:", find(text, "nadu"))

# 5. isalnum()
sollu("isalnum 'Abc123':", "Abc123".isalnum())
sollu("isalnum 'Abc 123':", "Abc 123".isalnum())
sollu("isalnum func:", isalnum("Python3"))

# 6. isalpha()
sollu("isalpha 'Hello':", "Hello".isalpha())
sollu("isalpha 'Hello2':", "Hello2".isalpha())
sollu("isalpha func:", isalpha("Tamil"))

# 7. isdigit()
sollu("isdigit '12345':", "12345".isdigit())
sollu("isdigit '123a':", "123a".isdigit())
sollu("isdigit func:", isdigit("987"))

# 8. lower() & islower()
sollu("lower 'HELLO':", "HELLO".lower())
sollu("islower 'hello':", "hello".islower())
sollu("islower 'Hello':", "Hello".islower())
sollu("islower '123':", "123".islower())
sollu("lower func:", lower("MIXED"))
sollu("islower func:", islower("alllower"))

# 9. upper() & isupper()
sollu("upper 'hello':", "hello".upper())
sollu("isupper 'HELLO':", "HELLO".isupper())
sollu("isupper 'Hello':", "Hello".isupper())
sollu("upper func:", upper("tamil"))
sollu("isupper func:", isupper("TAMIL"))

# 10. title()
sollu("title 'hello world':", "hello world".title())
sollu("title func:", title("python and tanglish"))

# 11. swapcase()
sollu("swapcase 'Hello World 123':", "Hello World 123".swapcase())
sollu("swapcase func:", swapcase("AbCdEf"))

# 12. count()
banana = "banana"
sollu("count 'an':", banana.count("an"))
sollu("count 'a':", banana.count("a"))
sollu("count func:", count(banana, "na"))

# 13. List count & len
nums = [1, 2, 1, 1, 3, 2]
sollu("nums.count(1):", nums.count(1))
sollu("nums.len():", nums.len())
sollu("count(nums, 2):", count(nums, 2))
`;

  const result = await runTanglishCode({
    source: testCode,
    onPrint: capturePrint,
  });

  console.log('Result Success:', result.success);
  console.log('Execution Time:', result.executionTimeMs, 'ms');
  console.log('Output:\n' + outputs.join(''));

  if (!result.success) {
    throw new Error('Test run failed!');
  }
}

runTests().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
