import { runTanglishCode } from './src/interpreter';

async function runListTests() {
  console.log('=== Running List Functions & del Keyword Tests ===\n');

  const outputs: string[] = [];
  const capturePrint = (t: string) => outputs.push(t);

  const testCode = `
# 1. append() and extend()
items = [1, 2]
items.append(3)
items.extend([4, 5])
items.extend("ab")
sollu("items after append & extend:", items)

# 2. del keyword on variables, list index, and dict key
del_test = [10, 20, 30, 40]
del del_test[1]
sollu("del_test after del [1]:", del_test)

d = {"a": 1, "b": 2, "c": 3}
del d["b"]
sollu("dict after del d['b']:", d)

temp_var = "to be deleted"
del temp_var
muyarchi:
    sollu(temp_var)
thavaru err:
    sollu("temp_var successfully deleted!")

# Also test Tanglish 'azhi' keyword alias
azhi_list = [100, 200, 300]
azhi azhi_list[0]
sollu("azhi_list after azhi [0]:", azhi_list)

# 3. pop()
popped_last = items.pop()
sollu("popped_last:", popped_last)
popped_first = items.pop(0)
sollu("popped_first:", popped_first)
sollu("items after pops:", items)

# 4. remove()
items.remove(2)
sollu("items after remove(2):", items)

# 5. index()
idx = items.index(3)
sollu("index of 3:", idx)

# 6. reverse()
nums = [1, 5, 2, 8, 3]
nums.reverse()
sollu("reversed nums:", nums)

# 7. sort() - Ascending and reverse=unmai
nums.sort()
sollu("sorted ascending:", nums)
nums.sort(unmai)
sollu("sorted descending:", nums)

# 8. max(), min(), sum()
sollu("max(nums):", max(nums))
sollu("nums.max():", nums.max())
sollu("min(nums):", min(nums))
sollu("nums.min():", nums.min())
sollu("sum(nums):", sum(nums))
sollu("nums.sum(10):", nums.sum(10))
sollu("max(10, 20, 5, 40):", max(10, 20, 5, 40))
sollu("min(10, 20, 5, 40):", min(10, 20, 5, 40))

# 9. clear()
nums.clear()
sollu("nums after clear():", nums)
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

runListTests().catch(err => {
  console.error('List tests failed:', err);
  process.exit(1);
});
