---
title: 组合计数问题
category: 其他
tags: [Math]
---

假设有 A、B、C 三种药丸，现在要从 A、B、C 三种药丸中取100粒进行调剂，规则如下：

- A、B、C 这三种药丸每种至少有1粒
- 不考虑药丸的顺序
- 同种药丸每粒都相同

问：药品调剂的组合共有多少种？

<!-- more -->

### 排列组合

首先回顾下排列 (Permutation) 与组合 (Combination) 的基本公式

$ P_n^k = C_n^k \times P_k^k = \frac{n!}{(n-k)!} $

上面的药品调剂问题，需要转化下模型，先将“100粒”改为“5粒”，看下有没有规律

<img src="/images/captures/20180302_combination_question.jpg">

如图，准备好5个放药丸的盘子，再在盘子之间放入2块“隔板”，并规定在左起第1块隔板的左边都放 A，第2、3块隔板中间都放B，第3块隔板右边都放C。5个盘子共有4个间隙，因此组合数就是 $ C_4^2 $

同理，换成“100粒”后，药品调剂的组合共有 $ C_{100-1}^{3-1} $ 种



### 三角形问题

此问题来自 [一个平庸的码农](https://myst729.github.io/#/blog/articles/2016/counting-triangles/)

下图中有多少个三角形？有没有什么好的计数策略

<img src="/images/captures/20180302_triangle_question.png">

先尝试用组合计数来求解，如果每个点与其他所有点 都存在连线的话，那么三角形个数就容易算了，就是

> 任意3个点的组合数 - 3点在一条直线上的组合数

其中“任意3个点的组合数”就是 $ C_n^3 $

而“3点在一条直线上的组合数”只要找出所有的直线，再对直线上的节点数求 $ C_k^3 $

**但是很遗憾，上图中不满足**“每个点与其他所有点 都存在连线”。。。。

https://myst729.github.io/#/blog/articles/2016/counting-triangles/ 提供了一种巧妙的方法

<img src="/images/captures/20180302_triangle_topology.png">

将三角形做拓扑变换（[Topology](https://en.wikipedia.org/wiki/Topology)），即可用如下数据结构简单的表示图形中的点关系

```js
[
  ['A', 'A', 'A', 'A'],
  ['B', 'C', 'D', 'E'],
  ['H', 'G', 'F', 'E'],
  ['H', 'I', 'J', 'K']
]
```

再遍历变换后的矩形，只要满足矩形的4个节点有且只有3个不相同的节点，即代表一个三角形

最后。。。答案是 **24**

