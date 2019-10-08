---
title: 
category: 其他
tags: []
---

今年

<!-- more -->

一般显示器的刷新频率默认为60Hz，也就是每秒刷新60次，每刷新一次就会重绘一次界面，让我们可以看到动画的进行。而浏览器也会维护这样一个刷新的时钟周期来重新绘制页面，浏览器为我们提供了两个函数来感知这样的时钟周期 [requestAnimationFrame](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame) 和 [requestIdleCallback](https://link.zhihu.com/?target=https%3A//developer.mozilla.org/zh-CN/docs/Web/API/Window/requestAnimationFrame)。两个函数都要传入一个 callback 函数，对于 requestAnimationFrame(callback)，浏览器会在刷新周期末尾调用其注册的callback；而对于requestIdleCallback(callback)，浏览器会在刷新周期的空闲时段调用其callback。



![](https://pic2.zhimg.com/80/v2-4c8f8ac520d82469f333e26212827fb9_hd.jpg)

如上图，requestAnimationFrame 注册的 callback 在每次刷新周期（Frame）的末尾都会执行，**需要注意的是 requestAnimationFrame 和 requestIdleCallback 的 callback 都是注册次数等于执行次数的**，也就是调用了两次 requestAnimationFrame，才会出现上图中 rAF callback 被执行两次的情况。这也是他俩和 setTimeout、setInterval 不同的地方，setTimeout(callback, time) 和 setInterval(callback, time)，只要未被注销都能够按规定的时间间隔（time）重复执行。但是 setTimeout 和 setInterval 的时间间隔设置不当会导致丢帧，造成动画卡顿。例如设置 setTimeout(render, time = 10ms)来显示一段动画，那么动画每一次改变的动态将如下图：

![](https://pic2.zhimg.com/80/v2-a09e83e8f748e538c4d3575c5f03bfe7_hd.jpg)

浏览器每 16.66ms 刷新一次界面，那么第一次刷新之后界面显示的是 render 1 的结果，而第二次刷新之后就是 render 3的结果了，render 2的结果丢失显示，对于用户来说就是类似丢帧的卡顿。这也就是为什么 Web 提出并实现 requestAnimationFrame 的原因，通过 requestAnimationFrame 来顺应浏览器的刷新周期，使得动画的显示可以更流畅。

而 requestIdleCallback 的存在使得前端开发人员可以将优先级较低耗时又很多的任务注册为 requestIdleCallback 的 callback，等待浏览器空闲的时候再执行，类似一个后台程序，以免阻塞浏览器主线程造成卡顿。但是如果浏览器长期被其他高优先级的任务占据主线程，会导致 requestIdleCallback 注册的 callback 无法执行，所以 requestIdleCallback 还提供了一个 timeout 参数。

```js
requestIdleCallback(callback, timeout)
```

从 requestIdleCallback 注册了其 callback 之后开始计时，如果时长超过了timeout，即使浏览器没有到达空闲时段也会优先执行其 callback。例如 requestIdleCallback(rIC callback, timeout = 20ms)

![](https://pic1.zhimg.com/80/v2-485455524eab8bf52812a4b06bee6010_hd.jpg)

结合 requestIdleCallback 和 requestAnimationFrame 还有 workloop 我们就可以实现一个根据优先级来执行任务和渲染界面的程序，将优先级低的任务注册到 requestIdleCallback 执行，使得用户体验更优化了。



<http://www.zhangyunling.com/702.html>

