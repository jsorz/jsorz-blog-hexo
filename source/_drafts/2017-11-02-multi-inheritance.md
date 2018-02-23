---
title: JS中的多继承
category: javascript
tags: [javascript]
---

首先【 JS 中不存在多继承】，因为 JS 中一切用来表现“继承”的语法糖都是使用 `prototype` 实现的。

JS 中的原型继承方式**并不能支持多继承**，因为每个构造器仅仅能指定一个原型对象，这是一种单继承形式，实际上是mixin与单继承结合的方式。只有一个类充当真正的父类，其余的类会被用于mixin，而并非真正的多继承。

咱们先来复习一下原型链。

<!-- more -->

<img src="/images/captures/20170122_proto.jpg">

## 常用的面向对象方式



## 模拟类继承的方式



## ES6中的继承



## 间接多继承



## 多继承要解决的问题

1、instanceof 多态

2、override

**3、Method Resolution Order**

4、循环依赖



Dojo http://driftcloudy.iteye.com/blog/909160

```
var A = declare(null, {
// constructor, properties, and methods go here
// ...
});
var B = declare(null, {
// constructor, properties, and methods go here
// ...
});
var C = declare([A, B], {
// constructor, properties, and methods go here
// ...
});
var D = declare(A, {
// constructor, properties, and methods go here
// ...
});
 
var a = new A(), b = new B(), c = new C(), d = new D();
 
console.log(a.isInstanceOf(A)); // true
console.log(b.isInstanceOf(A)); // false
console.log(c.isInstanceOf(A)); // true
console.log(d.isInstanceOf(A)); // true
```



## 优雅的继承



### 参考资料

[dojo.declare](https://github.com/dojo/dojo/blob/master/_base/declare.js)

http://driftcloudy.iteye.com/blog/909160

http://blog.csdn.net/kittyjie/article/details/72828470

[The Python 2.3 Method Resolution Order](https://www.python.org/download/releases/2.3/mro/)

[ES6 Class Multiple inheritance](https://stackoverflow.com/questions/29879267/es6-class-multiple-inheritance)



[MDN for Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)

[ES6 中优雅的 mixin 式继承](https://www.h5jun.com/post/mixin-in-es6.html)

