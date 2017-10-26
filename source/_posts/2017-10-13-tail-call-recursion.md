---
title: 尾调用尾递归
category: javascript
tags: [algorithm]
---

本文来源于一道题目：以下递归函数存在栈溢出的风险，请问如何优化？

```
function factorial (n) {
  return n * factorial(n - 1)
}
```

<!-- more -->

一看，递归没写退出条件，太 easy 了

```
function factorial (n) {
  if (n === 1) return n;
  return n * factorial(n - 1);
}
```

应该是题目故意埋的坑，当`n`很大的时候，仍会溢出，因为函数调用时会不断的压栈

<img src="/images/captures/20171013_factorial.png">

出题者的意图应该是使用尾递归~~（见参考链接）

```
function factorial (n, total) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}
```

然而放在浏览器试下，`factorial(10000, 1)`仍是溢出的。。

因为，**ES6 的尾调用优化只在严格模式下开启**，正常模式是无效的~



参考链接

stackoverflow: [What is tail recursion?](https://stackoverflow.com/questions/33923/what-is-tail-recursion)

ruanyifeng: [尾调用优化](http://www.ruanyifeng.com/blog/2015/04/tail-call.html)

ruanyifeng: [es6尾递归优化](http://es6.ruanyifeng.com/#docs/function#尾递归优化的实现)

