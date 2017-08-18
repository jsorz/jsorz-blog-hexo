---
title: 学会reduce函数
category: javascript
tags: [es]
---

Array 中有几个很实用的函数，比如 `each`, `map`, `filter`, `find`, `some` 等，这些我们平时的业务实现中会经常用到，而有一个 `reduce` 函数可能经常被忽视。

<!-- more -->

简单介绍
-------
可直接参考[MDN: Array.prototype.reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)

简单来说就是这样的函数形式

```
[].reduce(function (accumulator, currentValue, currentIndex, array) {
    // do something
    return accumulator;
}, initialValueOfAccumulator);
```

在迭代函数中会接收一个`accumulator`，在 reduce 开始时可以为它设置初始值（即上面的`initialValueOfAccumulator`）。在迭代中做的事情就是把处理后的结果追加到`accumulator`上再将其返回，这样就使得`accumulator`在迭代中依次传递（第0次的结果会传给第1次，第1次的结果传递给第2次，...），所有的处理结果都汇聚在`accumulator`上。最后 reduce 函数的返回值就是最终的`accumulator`值。


map-reduce 关系
---------------
MapReduce 是在分布式中提出的计算方法，我看过两篇解释简单又清晰的文章，可供参考

- [用通俗易懂的大白话讲解Map/Reduce原理](http://blog.csdn.net/lifuxiangcaohui/article/details/22675437)

- [十张图解释MapReduce](https://jsoftbiz.wordpress.com/2012/11/21/confused-about-mapreduce/)

js 中也有`map`和`reduce`函数，用它俩也能实现 MapReduce，区别是 js 没有分布式计算的支持。这里简单示意下 word count 程序

```
// 一些列文章，数组中每个元素相当于一篇文章的完整字符串
var articles = [
    'This is an example of word count.',
    'This is an example of word count.',
    'todo...'
];

articles.map(function (content) {
    // 将每篇文章的字符串都切成单词数组，如果需要预处理（比如剔除某些助动词）也在这时处理
    var words = content.replace(/[^\w\s]/g, '').split(/\s+/);

    // 统计该篇文章的 word count
    var countMap = words.reduce(function (accumulator, word) {
        accumulator[word] = (accumulator[word] || 0) + 1;
        return accumulator;
    }, {});

    // 返回每篇文章的单词统计
    return countMap;

}).reduce(function (stats, countMap) {
    // 将每篇文章的统计结果合并起来
    for (var word in countMap) {
        stats[word] = (stats[word] || 0) + countMap[word];
    }
    return stats;
}, {});
```


运用场景举例
-----------

### 数组扁平化

题目：将形如 `[[0, 1], [2, 3, 4], [5]]` 的数组转成扁平结构的一维数组 `[0, 1, 2, 3, 4, 5]`。

用 reduce 实现的话代码就很简单

```
[[0, 1], [2, 3, 4], [5]].reduce(function (flatten, item) {
    return flatten.concat(item);
}, []);
```

现在考虑一下：如果输入的数组可能嵌套多层呢？形如 `[[0, [1]], [2, [3, 4]], [[[5]]]]` 且嵌套的深度我们无法预知

```
// 对多维数组的 flatten
var flatten = function (array) {
    // 如果当前 array 已经是基础类型了，就转成1维数组
    if (array instanceof Array === false) {
        return [array];
    }

    // 临时空间，它的每个成员都要保证是1维数组
    var tmps = [];
    for (var i in array) {
        tmps.push(flatten(array[i]));
    }

    // 利用 reduce 函数可以将形如 [[a], [b, c]] 的数组扁平化成1维数组
    return tmps.reduce(function (res, item) {
        return res.concat(item);
    }, []);
};

flatten([0, 1, 2, 3, 4, 5]);
flatten([0, [1], [2, 3], 4, 5]);
flatten([[0, [1]], [[2], [3]], [[4, 5]]]);
flatten([[[0, 1]], [2, [3, 4]], [[[5]]]]);
```

如果需要从右向左的顺序 flatten 处理，则可使用 [reduceRight](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/reduceRight) 代替 reduce

### 统计节点标签数

另一个实用例子是统计一个页面中所有的节点数，利用 `document.getElementsByTagName('*')` 可取出所有节点的 [HTMLCollection](https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCollection)，再配合 map 和 reduce 函数就可轻松统计出各 tagName 的数目。

```
Array.prototype.slice.call(document.getElementsByTagName('*'))
    .map(function (el) {
        return el.tagName;
    })
    .reduce(function (total, tag) {
        total[tag] = (total[tag] || 0) + 1;
        return total;
    }, {});
```


reduce 内部实现
---------------
reduce 函数是 es5 中的标准，暂时先从 MDN 上抄了一份 Polyfill，供学习用。

```
// Production steps of ECMA-262, Edition 5, 15.4.4.21
// Reference: http://es5.github.io/#x15.4.4.21
// https://tc39.github.io/ecma262/#sec-array.prototype.reduce
if (!Array.prototype.reduce) {
  Object.defineProperty(Array.prototype, 'reduce', {
    value: function(callback /*, initialValue*/) {
      if (this === null) {
        throw new TypeError( 'Array.prototype.reduce ' + 
          'called on null or undefined' );
      }
      if (typeof callback !== 'function') {
        throw new TypeError( callback +
          ' is not a function');
      }

      // 1. Let O be ? ToObject(this value).
      var o = Object(this);

      // 2. Let len be ? ToLength(? Get(O, "length")).
      var len = o.length >>> 0; 

      // Steps 3, 4, 5, 6, 7      
      var k = 0; 
      var value;

      if (arguments.length >= 2) {
        value = arguments[1];
      } else {
        while (k < len && !(k in o)) {
          k++; 
        }

        // 3. If len is 0 and initialValue is not present,
        //    throw a TypeError exception.
        if (k >= len) {
          throw new TypeError( 'Reduce of empty array ' +
            'with no initial value' );
        }
        value = o[k++];
      }

      // 8. Repeat, while k < len
      while (k < len) {
        // a. Let Pk be ! ToString(k).
        // b. Let kPresent be ? HasProperty(O, Pk).
        // c. If kPresent is true, then
        //    i.  Let kValue be ? Get(O, Pk).
        //    ii. Let accumulator be ? Call(
        //          callbackfn, undefined,
        //          « accumulator, kValue, k, O »).
        if (k in o) {
          value = callback(value, o[k], k, o);
        }

        // d. Increase k by 1.      
        k++;
      }

      // 9. Return accumulator.
      return value;
    }
  });
}
```

再用自己的理解写1份实现，对比下与官方版本的差距 TODO
