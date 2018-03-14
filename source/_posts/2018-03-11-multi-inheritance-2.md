---
title: JS中的“多继承”-(2)
category: javascript
tags: [javascript]
---

首先 javascript 中**不存在多继承**，并且也不推荐使用继承。如果你也这么认为的话，那笔者的观点也就写完啦 233333…. 如果还想回顾下 javascript 中“继承”的前世今生，以及对“多继承”的讨论，不妨看下去。

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

<img src="/images/captures/20180311_diamond_inherit.png">

这是多继承中典型的问题，称为 Diamond Problem，当 A, B, C 中都定义了一个相同名称的函数时，而在 D 的实例对象中调用这个函数时，究竟应该去执行谁。。。



### 间接多继承

先退而求其次，我们借鉴了 Java 中的思路，实际只继承一个类，通过其他方式将其他类的功能融入。Java 中可以用 `Interface` 约束一个类应该拥有的行为，当然 javascript 也可以这么做，实现 interface 的语法糖，检查“类”中有没有重写 interface 中的所有函数。但这样的话，interface 除了做校验之用，没有实际意义，不如直接 mixin 的方式更实在。

```

```



### MRO算法

Method Resolution Order (MRO) 指的是在继承结构中确定类的线性顺序，例如 `C => B => A` 表示 C 继承 B，B 继承 A，那么 C 的 MRO 就是 `C B A`，也就意味着当调用 C 实例中的一个函数时，会按照 `C B A` 的优先级顺序去“寻找”该函数。在单继承的结构中自然没有问题，MRO 是为了解决前面所说的多继承中 Diamond Problem

常用的[C3算法](https://en.wikipedia.org/wiki/C3_linearization)就是用来计算 MRO，在 python 文档中有对其的完整描述，这里用一个例子简述下算法流程。

假设现在有这样的多继承结构

<img src="/images/captures/20180311_mro_example.png">

首先引入类的线性顺序的表示方法，在上图中可以看到 `B => Y => O` 这一部分是单继承的结构，显然 B 的 MRO 为 `B Y O`，记为 L(B) = BYO

然后还要引入几个符号，在 MRO 的线性顺序中，用 head 表示第一个元素，用 tail 表示余下部分。例如，`B Y O` 中的 head 就是 `B`，tail 则是 `Y O`。MRO 中只有一个元素，如图中的 O 元素，head 为`O`，tail 则是空。

接下来是最关键的，图中 A 的 MRO 记为 L(A(X, Y))，A(X, Y) 表示 A 同时继承了 X 和 Y，那么

L(A(X, Y)) = A + merge(L(X), L(Y), XY)

其中 merge 的规则如下

```
取出第一个序列的 head
如果，该 head 不在其它序列的 tail 中
	则把这个 head 添加到结果中并从所有的序列中移除它
否则，用下一个序列的 head 重复上一步
直到所有序列中的所有元素都被移除（或者无法找到一个符合的head）
```

最后我们来计算下上图中各个类的线性顺序

``` 
L(O) = O
L(X) = X + L(O) = XO
L(Y) = Y + L(O) = YO
L(A) = A + merge(L(X), L(Y), XY)
	 = A + merge(XO, YO, XY)
	 = AX + merge(O, YO, Y)
	 = AXY + merge(O, O)
	 = AXYO
L(B) = B + L(Y) = BYO
L(C) = C + merge(L(A), L(B), AB)
	 = C + merge(AXYO, BYO, AB)
	 = CA + merge(XYO, BYO, B)
	 = CAX + merge(YO, BYO, B)
	 = CAXB + merge(YO, YO)
	 = CAXBYO
```

上述多继承结构的 python 示例可参见 https://glot.io/snippets/ez5bqslav2  输出了 C 这个类的 MRO 即 `C A X B Y O`

当然C3算法也有 bad case，会导致上述的 merge 在中途失败，更多细节可参考 https://www.python.org/download/releases/2.3/mro/  总之不推荐设计出过于复杂的多继承结构 =_=



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



### 不推荐继承



## 总结



### 参考资料

https://github.com/getify/You-Dont-Know-JS/blob/master/this%20%26%20object%20prototypes/ch4.md

https://docs.oracle.com/javase/tutorial/java/IandI/polymorphism.html

https://www.python.org/download/releases/2.3/mro/

https://en.wikipedia.org/wiki/C3_linearization



http://blog.csdn.net/kittyjie/article/details/72828470

[ES6 Class Multiple inheritance](https://stackoverflow.com/questions/29879267/es6-class-multiple-inheritance)

[ES6 中优雅的 mixin 式继承](https://www.h5jun.com/post/mixin-in-es6.html)

https://segmentfault.com/a/1190000003798438