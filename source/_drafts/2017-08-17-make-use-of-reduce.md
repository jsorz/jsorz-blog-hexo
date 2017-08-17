---
title: make use of reduce
date: 2017-08-17 14:48:51
tags:
---


```
Array.prototype.slice.call(document.getElementsByTagName('*'))
    .map(function (el) {
        return el.tagName
    })
    .reduce(function (total, tag) {
        total[tag] = (total[tag] || 0) + 1;
        return total
    }, {});
```
