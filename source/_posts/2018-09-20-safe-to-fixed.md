---
title: toFixed 之坑
category: javascript
tags: [javascript]
---

保留几位小数，这在前端来 format 是很常见的。但直接之用 JavaScript 里数值的 `toFixed` 函数是有坑的。甩两个 bad case 看看：

`(1.005).toFixed(2`) 为 "1.00"，应该是 "1.01"

`(4.05).toFixed(1)` 为 "4.0"，应该是 "4.1"

结论就是：前端对敏感型数字的四舍五入展示，如价格、收入、跟金额有关的，千万不要直接 toFixed，以免被客户追究。

<!-- more -->

## 原理

JS 语言诟病，浮点数本身存在精度问题，举个例子：`0.1 + 0.2 !== 0.3`

那问题来了，保留2位小数，能否先乘 100，然后四舍五入取整后再除 100 呢？

不妨试下 `Math.round(1.005 * 100) / 100` 结果也不对，因为 `1.005 * 100` 的结果是 `100.49999999999999`。而 `0.1 + 0.2` 的结果是 `0.30000000000000004` ，这就很迷了，什么时候会比正确值略大，什么时候又会略小，看不到规律。

其实这要跟浮点数的二进制存储有关了，计算机是无法精确地表示任意浮点数的。有的数能用 (1/2)^n 的相加表示的话，那这个浮点数就是精确的，比如 0.5, 0.75, 0.875。否则由于浮点数存储有位数限制，肯定是不精确的。

JS 里的 number 类型只有 16 位精度，所以浮点数运算捉襟见肘。

另一方面，JS 对超长的整数也表示不了，比如很多系统里的订单号，在后端会用 Long 来表示，数字超过 16 位时在 JS 里就没法精确表示了。`30001519369635544130` 这个大数字末几位就会被抹成零，就会导致前端看到的订单号与后端实际单号不一致。所以超过 16 位的大数字，一定要求后端以 String 来给到前端。

## 实现

思路是，如果保留2位小数，那先乘 100 后四舍五入取整，然后把小数点加在倒数第 2 位之前。

```typescript
import * as MAX_SAFE_INTEGER from 'core-js/library/fn/number/max-safe-integer';
import * as MIN_SAFE_INTEGER from 'core-js/library/fn/number/min-safe-integer';

const NUM_REG = /^-?\d+(\.\d+)?$/;

export function isSafeNumber (
  val: string | number
): boolean => {
  const num = Number(val);
  return NUM_REG.test(String(val))
    && num <= MAX_SAFE_INTEGER
    && num >= MIN_SAFE_INTEGER;
};

/**
 * 安全的 toFixed 函数，解决浮点数 toFixed 的潜在问题
 *
 * 例如 (1.005).toFixed(2) 为 "1.00" (应该是 "1.01")
 *
 * Inspired by https://github.com/camsong/blog/issues/9
 */
export function toFixed (num: number | string, digits?: number): string => {
  if (!isSafeNumber(num)) {
    return 'NaN';
  }
  digits = digits || 0;

  // 转为整数后再处理 只需取整后再补个小数点位置
  let scale: number = Number(num) * Math.pow(10, digits);

  // 为什么是16位? Number.MAX_SAFE_INTEGER 只有16位
  // (整数部分 + 小数部分) <= 16 位时，可解决小数尾部 00001 和 99999 精度问题
  scale = Math.round(parseFloat(scale.toPrecision(16)));

  // 从右向左的 bit 数组
  const bits: string[] = String(scale).split('').reverse();

  // 小数点的位置，并用 0 补齐
  if (bits.length <= digits) {
    // 构造 (digits - bits.length) 个 0 的数组
    const patches: string[] = new Array(digits - bits.length + 1).join('0').split('');
    bits.splice(bits.length, 0, ...patches, '.', '0');

  } else if (digits > 0) {
    bits.splice(digits, 0, '.');
  }

  return bits.reverse().join('');
};

```

## 测试用例

```js
import test from 'ava';

test('should toFixed non-number', t => {
  t.is(toFixed(null), 'NaN');
  t.is(toFixed(''), 'NaN');
  t.is(toFixed('1'), '1');
  t.is(toFixed('1', 1), '1.0');
  t.is(toFixed('-1.1', 2), '-1.10');
});

test('should toFixed normal number', t => {
  t.is(toFixed(1), '1');
  t.is(toFixed(1, 1), '1.0');
  t.is(toFixed(1.1, 1), '1.1');
  t.is(toFixed(1.1, 2), '1.10');
  t.is(toFixed(1.12, 1), '1.1');
  t.is(toFixed(1.15, 1), '1.2');
  t.is(toFixed(0.101, 2), '0.10');
  t.is(toFixed(0.109, 2), '0.11');
  t.is(toFixed(0.0041, 3), '0.004');
  t.is(toFixed(0.0049, 3), '0.005');
});

test('should toFixed big number', t => {
  // MAX_SAFE_INTEGER 16位数字
  t.is(toFixed(9007199254740991), '9007199254740991');

  // 整数 + 小数 不能超过16位
  t.is(toFixed(100719925474099, 1), '100719925474099.0');
  t.is(toFixed(100719925474099.1, 0), '100719925474099');
  t.is(toFixed(100719925474099.5, 0), '100719925474100');

  // 整数 + 小数 不能超过16位
  t.is(toFixed(1719925474099.005, 2), '1719925474099.01');
  t.is(toFixed(1719925474099.101, 2), '1719925474099.10');
});

test('should toFixed abnormal float number', t => {
  // 0.1 + 0.2 = 0.30000000000000004
  t.is(toFixed(0.1 + 0.2, 1), '0.3');
  t.is(toFixed(0.1 + 0.2, 2), '0.30');

  // 0.1 + 0.7 = 0.7999999999999999
  t.is(toFixed(0.1 + 0.7, 1), '0.8');
  t.is(toFixed(0.1 + 0.7, 3), '0.800');

  // 0.69 / 10 = 0.06899999999999999
  t.is(toFixed(0.69 / 10, 3), '0.069');
  t.is(toFixed(0.69 / 10, 4), '0.0690');

  // (4.05).toFixed(1) = '4.0'
  t.is(toFixed(4.05, 1), '4.1');

  // (1.005).toFixed(2) = '1.00'
  t.is(toFixed(1.005, 2), '1.01');
});

```

最后，在前端 JS 里最好别做数值计算，如果一定要计算，可以使用 [number-precision](https://github.com/nefe/number-precision) 库。

还有，价格这种字段，无论如何都不要在前端计算！做一个有底线的前端。

