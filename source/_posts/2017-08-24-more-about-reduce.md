---
title: 再看reduce
category: javascript
tags: [algorithm]
---

前一篇中提到了可利用`reduce`函数做[数组扁平化](/blog/2017/08/make-use-of-reduce.html#数组扁平化)以及数据统计之类的操作，这篇中将会介绍利用 reduce 实现的更高级操作。

<!-- more -->

reduce 的用法为 `arr.reduce(callback[, initialValue])`，在[MDN](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)中对 `initialValue` 有这么一段解释。

> Value to use as the first argument to the first call of the `callback`. If no initial value is supplied, the first element in the array will be used. Calling `reduce()` on an empty array without an initial value is an error.



`callback` 函数接受4个参数：之前值、当前值、索引值以及数组本身。若指定 `initialValue`，则当作最初使用的 `previous` 值；如果不指定 `initialValue`，则使用数组的第一个元素作为 `previous` 初始值，同时 `current` 往后顺延。因此不指定 initialValue 时会比指定时少一次迭代。

```js
[1, 2, 3].reduce((previous, current) => previous * current)

[1, 2, 3].reduce((previous, current) => previous * current, 0)
```

用这个简单的例子可以体会出有无 initialValue 的差别了吧。



### 给力一点

我们再来看一个黑科技，利用 reduce 结合函数 bind 可以实现函数的链式调用

```js
// 给定2个字符串处理函数
const reverse = str => str.split('').reverse().join('');
const upper = str => str.toUpperCase();

// 写法1
[reverse, upper].reduce((prev, action) => action(prev), 'abcdefg');

// 写法2
const compose = (...fns) => {
  return (str) => {
    return fns.reduce((prev, action) => action(prev), str);
  }
};
compose(reverse, upper)('abcdefg');
```



### 再给力一点

注：以下代码出自十年踪迹(月影)的[函数式编程入门](https://ppt.baomitu.com/d/0bda92b8#/)

```js
class Task{
  constructor(){
    this.plugins = {
      '*': []
    };
    this.pluginId = 0;
  }
  use(router, functor){
    if(typeof router === 'function'){
      [router, functor] = ['*', router];
    }
    this.plugins[router] = this.plugins[router] || [];
    this.plugins[router].push({
      functor,
      id: ++this.pluginId
    });
  }
  dispatch(router, ...args){
    let plugins = this.plugins['*'];
    if(router !== '*'){
      plugins = plugins.concat(this.plugins[router] || []);
    }
    plugins.sort((a, b) => a.id - b.id);

	// 关键在这里
    let entrace = plugins
      .map(plugin => plugin.functor.bind(this, ...args))
      // 注意无 initialValue 时, a指向前一个函数，作为参数传入b
      .reduceRight((a, b) => b.bind(this, a));

    entrace();
  }
}

// for test
let task = new Task();

task.use(function(req, res, next){
  console.log(req, res);
  next();
});

task.use('/', function(req, res, next){
  req.a++;
  res.x++;
  next();
});

task.use('/', function(req, res){
  console.log(req, res);
});

task.dispatch('/', {a: 1}, {x: 2});
```

