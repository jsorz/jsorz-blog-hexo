---
layout: post
title: "前端知识体系以及面试点"
category: 吹水
tags: [面试, 前端]
---

之前一直在忙，也没来得及管这个博客。实习从5月干到了8月底，办离职那天，交了工牌归还电脑后，还被运营拖着解答问题，又被通知线上价格问题，借着同事的电脑把bug修了，也是因为升级代码时自己的疏忽导致的。虽然在团队里自己只是一个打杂的小前端，但是与好多同事合作过，对接过好多运营同学。走的时候和团队里一一道别，听到最多的一句话就是“早点回来”。但是很遗憾，我回不来了。没有来得及完成师兄对我的期望，没有来得及和他好好道别，没有来得及和主管挑盘台球，没有来得及吃遍食堂的所有菜点。那天晚上Jarven同学送我出去，说你走了我以后吃饭又不认识路了。只好相望于江湖，等到自己成长为大前端时，可以鼓足勇气说“I'm back.”

<!-- more -->

矫情完了。。。回校后好好回顾了下前端知识点，结合实习经验体会更深，于是想整理下。


基础篇
--------

### CSS布局 ###

首先是模型的理解

- [盒模型](/blog/2015/03/css-box-model.html)
- [定位模型](/blog/2015/03/css-position-model.html)
- [Flexbox模型](http://www.w3cplus.com/css3/a-guide-to-flexbox.html)
- 理解类似Boostrap里的栅格系统

然后来几个实际的布局练手

- 相对整个屏幕的水平垂直居中
- 中间定宽，两边铺满容器，这样的三列布局
- 左边定宽，右边自适应宽度，两列的等高布局
- 三列固定宽度的等高布局

这些都能想出1种或两三种实现的话，CSS布局不会再难了，于是可以再看下移动端web的适配。

- 响应式的图片，并且是延迟加载的，要预先为图片占据空间，避免文档高度乱跳
- 屏幕不断变大时，同一行的元素容器里应该可以看到更多的内容，而不是将文字放大
- 利用Flexbox做移动端的弹性布局

大体的路线图就是这样，如果再深入的话，可能就是对一些特别的属性或兼容性的理解了，比如

- IE6的盒模型是类似于`box-sizing: border-box`
- `zoom: 1`与hasLayout
- BFC（Block Formatting Context）

CSS到此打住了，不是太刁难的设计稿都能hold住了！



### Javascript语言机制 ###

JS里最重要的3点

- 作用域
- 闭包
- 原型

理解了这个后，就是运用这些特性做的一些具体方案，去解决实际问题

- 函数作用域的绑定，`Function.prototype.bind`的实现
- 模拟“类/模块”的实现
- 类式继承的实现
- 常用设计模式的实现，比如单例模式、观察者模式

其中还涉及到一些js变量环境和单线程的知识点，详见我以前整理的文章

- [《JavaScript模式》读书笔记系列](/tags.html#读书笔记-ref)
- [一道腾讯笔试题想到的JS中的一些特性](/blog/2015/03/a-question-of-intern-recruit-test-by-tencent.html)

当然光看理论不行，得拿东西练手

- 实现一个Slider轮播组件
- 实现一个带自动提示功能的输入框组件

要注意代码的封装以及API的设计，提供一些事件及扩展性的接口，尽量优雅的去实现，并且尽量使用原生javascript。这里提供一个参考：[阿当大话西游之WEB组件](http://www.imooc.com/view/99)



### HTML5新特性 ###

HTML5推动了很久了，标准定稿意味着Web 2.0时代已跨入Web 3.0时代。HTML5是否就直接简称H5，这个一直存在争议，我们先来看下HTML5到底有哪些新特性。

- 语义化DOM结构
- 多媒体支持
- 本地存储，突破cookie大小限制
- 地理定位支持
- web workers
- 服务端事件主动推送

个人感觉HTML5并不只是一些新标签、新属性、新API，它代表着一种新的理念和趋势，即web页面的丰富交互性已经可以做到和APP类似的体验了。HTML5并不是一种编程语言，而是跨终端、重视用户体验的理念，这也是Web 3.0时代所要求的。



进阶篇
--------
虽然上面写的叫“基础篇”，要做好的话已经很进阶了，已经可以做出跨终端、交互丰富、代码优雅的web页面或者是web app了。这里写进阶篇主要是指规模较大的项目里会涉及到的一些东西，以及前端工程化的思想。


### 前端资源模块化 ###

CSS里衍生出来SASS和LESS，相当于加强版的CSS。而js模块化衍生出来了CMD和AMD规范。我最初觉得做模块化主要是为了复用，css和js都可以一定程度地复用。后来看了[@前端农民工](http://weibo.com/fouber)的文章，说**模块化更多的是为了“分治”**，即分而治之，觉得很有道理，尤其是在规模较大的项目中。

如果要说面试点的话，这里可能会涉及到

- AMD和CMD的区别
- 模块Loader的大体实现思路

既然有了模块化，进行了“分治”，那接下来自然就会遇到依赖管理的问题，比如

- 依赖去重。a依赖[b, c]，b依赖[c, d]，如何求出a的所有依赖（算法实现）
- 循环依赖。a依赖[b]，b依赖[c, d]，c依赖[a]，如何求出a的依赖（避免算法死循环）

这只是依赖管理里的小打小闹，再进一步的话，整个静态资源如何管理

- 缓存VS更新
- 按需加载VS资源合并（静态资源的combo机制）

这里涉及到的知识相当多，要深入的话每一点都能挖的很深，但我们需要从整体上有个大体的了解。可参考以下资料：

- [前端工程——基础篇](https://github.com/fouber/blog/issues/10)
- [前端工程精粹：静态资源管理与模板框架](http://www.infoq.com/cn/articles/front-end-engineering-and-performance-optimization-part2)
- [KISSY中开启combo](http://docs.kissyui.com/1.4/docs/html/guideline/seed.html#seed-)



### 了解服务端 ###

在做页面级的开发时，我们肯定会接触一点web原理方面的知识

- http与https
- session与cookie
- 请求与跨域

那么再上升一层，就是整个web server，我们可以了解一些

- nodejs server与ngnix
- DNS与CDN
- 如何做负载均衡

如今用nodejs来做web controller是趋势，使前端人员拥有全栈的可能性，不一定要样样精通，但是了解一些基本的网络知识是必要的。



### web安全 ###

企业级项目里web安全也不可忽视，最常见的就是XSS漏洞和CSRF攻击，了解一点它们被攻击的原因，以及常用的一些攻防手段。我也不是很懂，只知道一些概念。这个方向深入下去的话，可以考虑做运维和安全人员。



高级篇
-------
只是随便取个标题用于划分，上面每个point深入下去的话都可以是高级篇，这里更多想扯些抽象原则的东西。


### 知其所以然才能做好性能优化 ###

性能优化涵盖的做法数不尽数，但是不管什么手段，其目的我归结成三大方面：

- 减少请求。很多做法最后都是为了减少请求，或是合并请求。
- 服务端优化。优化响应速度，或者减少传输量。
- 浏览器渲染原理

最难的也是渲染原理，必须知道其原理，才能去优化事件，优化动画。



### 前后端分离是前端工程的核心 ###

上面写的前端工程化都是在说资源管理，以及和服务端的配合，然而前后端分离才是工程化中最重要的。这方面可以看下@不四的分享[换个角度看前后端分离](http://www.infoq.com/cn/presentations/change-an-angle-to-see-front-end-and-back-end-dev-separation)。

最后要达到的工程化效果是：

- 前端不是切图仔
- 后端也不是套页面
- 前后端约定好后，前端可以基于mock数据开发



### 什么是前端 ###

最后要回归一个本质问题，到底什么是前端？这个问题是实习前@三七终面时问的，我一下子被唬住了。

> 前端 = 用户端 = 手机 + 平板 + PC 三端一致且良好的体验

这是我后来参加了2015的QCon见了世面后的第一印象，当时前端专栏的主题就是跨终端。

> 前端是还原设计的同时，以工程师的角度去优雅地实现。

这是我实习阶段的感受，这里“优雅地”实现并非指代码要写的多么多么牛，得看具体业务场景以及需求排期，需要工程师在设计和排期以及需求优先级之间找到平衡点，以最权衡的方式去还原设计。如果是可复用的场景，最终可沉淀出一套优雅的可扩展的实现方案。

> 前端要牢牢把控View层，以最适合用户的方式去展现。

这是实习时团队的主管所提倡的，由于现在native和hybrid技术的普及，不应该把web前端和native前端界限划分得太清楚，web和native本都是View层把控者。前端人员应该根据具体业务场景，去选择最合适的实现方式，而不是根据自己的技能去选择展现方式。

到底什么是前端？这类抽象问题本就不该有明确答案，就像一百个人眼中有一百个哈姆雷特。每个人的背景不同，随着经验和视野的增长，自然会沉淀出最适合自己的答案。
