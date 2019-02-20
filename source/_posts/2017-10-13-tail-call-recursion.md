---
title: 尾调用尾递归
category: javascript
tags: [algorithm]
---

本文来源于一道题目：以下递归函数存在栈溢出的风险，请问如何优化？

```js
function factorial (n) {
  return n * factorial(n - 1);
}
```

<!-- more -->

### 普通递归

一看，递归没写退出条件，太 easy 了

```js
function factorial (n) {
  if (n === 1) return n;
  return n * factorial(n - 1);
}
```

应该是题目故意埋的坑，当`n`很大的时候，仍会溢出，因为函数调用时会不断的压栈

<img src="/images/captures/20171013_factorial.png">

### 文艺递归

出题者的意图应该是使用尾递归~~（见参考链接）

```js
function factorial (n, total = 1) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
}
```

然而放在浏览器试下，`factorial(10000)`仍是溢出的。。

因为，**ES6 的尾调用优化只在严格模式下开启**，正常模式是无效的~

### 尾递归转化

```js
function tailCall (f) {
  let value;
  let active = false;
  const argsQueue = [];
  return function () {
    argsQueue.push(arguments);
    if (!active) {
      active = true;
      while (argsQueue.length) {
        value = f.apply(null, argsQueue.shift());
      }
      active = false;
      return value;
    }
  }
}

const factorial = tailCall(function (n, total = 1) {
  if (n === 1) return total;
  return factorial(n - 1, n * total);
});
```

当执行`factorial(3)`的时候，它会先在`argsQueue.push([3, 1])`，然后执行到`while`循环里，这时执行`f.apply(null, [3, 1])`其实才是真正要递归的函数。

然后又执行了`factorial(2, 3)`，因此又在`argsQueue.push([2, 3])`。而由于前一次已经将`active`置位了，所以`factorial(2, 3)`就算执行结束了，无返回值

回到第一次的`while`里，发现`argsQueue`多了条`[2, 3]`，于是继续调用`f.apply(null, [2, 3])`。同理，会执行`factorial(1, 6)`，又在`argsQueue.push([1, 6])`。

再次回到第一次的`while`里，发现`argsQueue`又多了条`[1, 6]`，于是继续调用`f.apply(null, [1, 6])`。而注意此时`f(1, 6)`直接返回`total`了，因此`argsQueue`里没有新增参数了，于是`factorial`就返回了`value = 6`

以上过程说白了仍是递归，区别在于普通递归时函数调用里继续函数调用，需要保存函数调用前的上下文（context）信息。而使用了尾递归转化后，递归调用时只会向共享的`argsQueue`里压入参数，在外层通过循环的方式（直到`argsQueue`为空）逐步调用函数主体。

### 总结

打个比方来说，普通递归的过程有点像深度优先遍历，函数调用一层层深入下去，需要不断保存 context 信息，最后再逐层回溯。因此函数调用栈是连续增长的，容易发生栈溢出。

而尾递归优化后的递归过程就像广度优先遍历，函数调用后只在队列里增加一条参数，并不是逐层深入，而是通过循环逐渐执行函数体。因此函数调用栈是压入1次再弹出1次，不会发生溢出~

这是尾递归优化后的执行结果，虽然结果值已经超出 MAX_VALUE，但函数调用不会溢出

<img src="/images/captures/20171013_factorial_tail.png">

### 参考链接

stackoverflow: [What is tail recursion?](https://stackoverflow.com/questions/33923/what-is-tail-recursion)

ruanyifeng: [尾调用优化](http://www.ruanyifeng.com/blog/2015/04/tail-call.html)

ruanyifeng: [es6尾递归优化](http://es6.ruanyifeng.com/#docs/function#尾递归优化的实现)

