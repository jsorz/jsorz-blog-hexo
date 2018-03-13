---
title: JS中的“多继承”-(2)
category: javascript
tags: [javascript]
---

首先 javascript 中**不存在多继承**，并且也不推荐频繁使用继承。如果你也这么认为的话，那笔者的观点也就写完啦 233333…. 如果还想回顾下 javascript 中“继承”的前世今生，以及对“多继承”的讨论，不妨看下去。

（接上一篇）

<!-- more -->

## 试试多继承

贪心是人之常情，有了“继承”后，我们就会想要“多继承”。即使在后端语言中，也没有几个语言能真正实现多继承，笔者只知道 C++ 和 python 提供了多继承的语法，而像 Java 只允许继承一个父类，但可以同时 `implements` 多个接口类，也算一种变相的多继承吧。

### 多继承要考虑的问题

多继承并没有想象的那么美好，首先是对 `instanceof` 提出了更高的要求

```
class A {}
class B {}
// 假定有支持多继承的语法
class C extends A, B {}
// 那么 C 的实例对象，应该同时也是 A 和 B 的 instance
let c = new C()
c instanceof C  // true
c instanceof A  // true
c instanceof B  // true
```

如上示例，在多继承中必须将所有的父类标识记录在子类中，才能让 `instanceof` 实现上面的效果。而 javascript 中只有 `prototype` 链，该死的还约束了一个对象只能指定一个 `prototype`，所以还得另外想办法去模拟 `instanceof`

这还不算啥，请看下一张图

<img src="/images/captures/20180311_diamond_inheritanc.png">

这是多继承中典型的问题，称为 Diamond Problem，当 A, B, C 中都定义了一个相同名称的函数时，而在 D 的实例对象中调用这个函数时，究竟应该去执行谁。。。



### 间接多继承

先退而求其次，我们借鉴下 Java 中的思路，interface

extend 一个类，其余 mixin 方式





### MRO算法

Method Resolution Order (MRO) 指的是在继承结构中确定方法解析的顺序，即一个函数会按照此顺序

又被称为[C3算法](https://en.wikipedia.org/wiki/C3_linearization)，在 python 有对其的完整描述，这里简述下算法流程。



```

```



### 模拟多继承



Dojo多继承 http://driftcloudy.iteye.com/blog/909160

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

dojo.declare https://github.com/dojo/dojo/blob/master/_base/declare.js#L554



## 为什么不建议多继承

我们使用继承的时候，我们需要确信使用继承确实是有效可行的办法。那么到底要不要使用继承呢？《Think in Java》中提供了解决办法：问一问自己是否需要从子类向父类进行向上转型。如果必须向上转型，则继承是必要的，但是如果不需要，则应当好好考虑自己是否需要继承。

用组合的方式来解耦



### 为什么不推荐继承



## 总结



### 参考资料

https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch4.md

https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html

https://www.python.org/download/releases/2.3/mro/

https://en.wikipedia.org/wiki/C3_linearization



[dojo.declare](https://github.com/dojo/dojo/blob/master/_base/declare.js)

http://driftcloudy.iteye.com/blog/909160

http://blog.csdn.net/kittyjie/article/details/72828470

[The Python 2.3 Method Resolution Order](https://www.python.org/download/releases/2.3/mro/)

[ES6 Class Multiple inheritance](https://stackoverflow.com/questions/29879267/es6-class-multiple-inheritance)



[MDN for Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)

[ES6 中优雅的 mixin 式继承](https://www.h5jun.com/post/mixin-in-es6.html)



https://segmentfault.com/a/1190000003798438