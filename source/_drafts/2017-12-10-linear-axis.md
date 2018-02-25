---
title: 如何画一个坐标轴
category: 绘图
tags: [chart]
---

driven by Charts

<!-- more -->

## 图表绘制框架



## 折线图绘制原理



## y轴坐标绘制

1、等长

2、上下限自适应

3、步长计算



<img src="/images/captures/20171210_axis_step.png">



```
// Graphic Gems
function niceValue(data, isFloor) {
  var exp = Math.floor(Math.log(data) / Math.LN10);
  var exp10 = Math.pow(10, exp);
  var f = data / exp10;
  var nf;

  if (isFloor) {
    if (f < 1.5) {
      nf = 1;
    }
    else if (f < 2.5) {
      nf = 2;
    }
    else if (f < 4) {
      nf = 3;
    }
    else if (f < 7) {
      nf = 5;
    }
    else {
      nf = 10;
    }
  }
  else {
    if (f < 1) {
      nf = 1;
    }
    else if (f < 2) {
      nf = 2;
    }
    else if (f < 3) {
      nf = 3;
    }
    else if (f < 5) {
      nf = 5;
    }
    else {
      nf = 10;
    }
  }

  return nf * exp10;
}
```



## 反向坐标轴



