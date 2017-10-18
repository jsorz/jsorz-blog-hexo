---
layout: post
title: "js打包工具体积对比"
description: ""
category: 
tags: []
---

<!-- more -->

### webpack VS rollup

pack + uglify 后的体积比较（字符数）

| file entry | webpack | rollup | compare |
|------------|---------|--------|---------|
| vizParser.js | 5823 | 4285 | -26% |
| autoTracker.js | 5271 | 3492 | -33% |

实验中 rollup 打包使用了`iife`格式（还提供了`cjs` `umd`格式）

参考：[https://rollupjs.org/](https://rollupjs.org/)

