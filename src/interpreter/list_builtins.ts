import { adjustSlice } from './string_builtins';

export function compareItems(a: any, b: any): number {
  if (typeof a === 'number' && typeof b === 'number') {
    return a - b;
  }
  if (typeof a === 'string' && typeof b === 'string') {
    return a.localeCompare(b);
  }
  if (typeof a === 'boolean' && typeof b === 'boolean') {
    return (a ? 1 : 0) - (b ? 1 : 0);
  }
  return String(a).localeCompare(String(b));
}

export function pyMax(...args: any[]): any {
  if (args.length === 0) {
    throw new Error('TypeError: max() expected at least 1 argument, got 0');
  }

  let items: any[] = [];
  if (args.length === 1) {
    const iterable = args[0];
    if (Array.isArray(iterable)) {
      items = iterable;
    } else if (typeof iterable === 'string') {
      items = iterable.split('');
    } else {
      throw new Error(`TypeError: '${typeof iterable}' object is not iterable`);
    }
  } else {
    items = args;
  }

  if (items.length === 0) {
    throw new Error('ValueError: max() arg is an empty sequence');
  }

  let maxVal = items[0];
  for (let i = 1; i < items.length; i++) {
    if (compareItems(items[i], maxVal) > 0) {
      maxVal = items[i];
    }
  }
  return maxVal;
}

export function pyMin(...args: any[]): any {
  if (args.length === 0) {
    throw new Error('TypeError: min() expected at least 1 argument, got 0');
  }

  let items: any[] = [];
  if (args.length === 1) {
    const iterable = args[0];
    if (Array.isArray(iterable)) {
      items = iterable;
    } else if (typeof iterable === 'string') {
      items = iterable.split('');
    } else {
      throw new Error(`TypeError: '${typeof iterable}' object is not iterable`);
    }
  } else {
    items = args;
  }

  if (items.length === 0) {
    throw new Error('ValueError: min() arg is an empty sequence');
  }

  let minVal = items[0];
  for (let i = 1; i < items.length; i++) {
    if (compareItems(items[i], minVal) < 0) {
      minVal = items[i];
    }
  }
  return minVal;
}

export function pySum(iterable: any[], start: number = 0): number {
  if (!Array.isArray(iterable)) {
    throw new Error(`TypeError: sum() requires a list, got '${typeof iterable}'`);
  }
  let total = Number(start) || 0;
  for (const item of iterable) {
    total += Number(item);
  }
  return total;
}

export function pyIndex(
  list: any[],
  x: any,
  start?: number,
  end?: number,
  isEqual?: (a: any, b: any) => boolean
): number {
  if (!Array.isArray(list)) {
    throw new Error(`TypeError: '${typeof list}' object has no attribute 'index'`);
  }
  const eq = isEqual || ((a: any, b: any) => a === b);
  const [s, e] = adjustSlice(list.length, start, end);
  for (let i = s; i < e; i++) {
    if (eq(list[i], x)) {
      return i;
    }
  }
  throw new Error(`ValueError: '${String(x)}' is not in list`);
}

export async function pySort(
  list: any[],
  keyFn?: (item: any) => Promise<any> | any,
  reverse: boolean = false
): Promise<void> {
  const order = reverse ? -1 : 1;

  if (keyFn) {
    const keyed: { item: any; keyVal: any }[] = [];
    for (const item of list) {
      keyed.push({ item, keyVal: await keyFn(item) });
    }
    keyed.sort((a, b) => compareItems(a.keyVal, b.keyVal) * order);
    for (let i = 0; i < list.length; i++) {
      list[i] = keyed[i].item;
    }
  } else {
    list.sort((a, b) => compareItems(a, b) * order);
  }
}
