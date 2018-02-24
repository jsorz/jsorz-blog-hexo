---
title: H5无埋点数据采集
category: mobile
tags: [mobile]
---

前一阵团队里做了个项目，称为“无埋点圈选”，目的是在 app 中无需为特殊的按钮或事件编写埋点，可在 app 发布后通过可视化的方式来圈选需要“埋”的点，然后在 app 端通过配置下拉的方式来获取埋点信息，实现埋点数据的自动发送。

<!-- more -->

## 工作流程

圈选的主要步骤为

- 在 web 管理端打开【圈选】功能的入口，开启长连接
- 在 app 中通过特殊手势开启【圈选】状态，连接 socket
- app 端**实时**将手机截屏以及控件结构传送给 web 端
- 在 web 端圈出需要【埋点】的控件，并保存为配置

而数据采集时的步骤为

- app 启动时自动更新一份埋点配置信息
- Native 与 webview 部分的页面，分别捕获用户的点击事件，并根据埋点配置信息发送指定的埋点事件日志

需注意的是，Native 部分的控件均由 app SDK 负责处理，而 webview 里面的页面，由 app SDK 将特定 js 注入 webview 中，再由 js 负责处理。

## 整体架构

### Hybrid 关系

H5 与 SDK 部分的关系如下：

```
       发起请求
SDK ------------> 注入js (根据功能场景注入下面不同的js文件)

        getViewportTree
圈选js -------------------> 得到页面可视结构 (由SDK主动调用js bridge)

         监听点击事件，事件过滤，调用SDK
采集js --------------------------------> 由SDK处理日志发送
```

其中“圈选js”只负责分析当前页面的可视结构，并将结果传递给 SDK 端。而“采集js”只负责监听当前页面事件，并根据埋点配置过滤出有效埋点事件，并发送给 SDK 端（由SDK负责处理日志的发送）



## 圈选部分

### 获取可视结构

树遍历算法

```
TO be continue
```

效果示意图

<img src="/images/captures/20170612_visual_parser.jpg">

### 结构化数据表示

可视结构取自DOM document，本质上仍使用 XPath 来表示一个DOM节点在 document 中所处的路径，形如`BODY[0]/DIV[0]#main/DIV[1]/A[0]#query` …… 

为了方便与其他端的数据交互，这里使用统一的 JSON 结构来表示任一控件元素的路径，包括在 Native 中的部分以及在 webview 中的部分。

```
{
  // 注：由于 Native 部分的控件不是均可点击，所以path保留从上一个父节点到当前节点的相对路径
  path: [
    {
      p: 'UIWebView',  // 路径上的path节点类型
      i: '0',  // 节点index，相对于"同类型"控件
      t: 'UIWebView'  // 控件继承的系统控件类型
    }
  ],
  type: 'UIWebView',  // 系统控件类型
  url: 'http://m.ctrip.com/html5/',  // 只有webview时才有url字段
  value: '',  // SDK端从控件属性取出来
  frame: {  // 相对于当前屏幕左上角，四舍五入
    x: 0,
    y: 100,
    w: 320,
    h: 480
  },
  child: [
    {
      // H5中的路径表示法与 Native 保持一致，由于H5中不会存在父元素不可圈选而子元素可圈选的情况
      // 因此 H5 的文档数据中，每个节点的 path 数组里都只有1项
      path: [
        {
          p: 'BODY',  // H5中即 tagName （**从BODY开始**）
          i: '0',  // 同类 tagName 在父节点中的 index
          t: 'BODY'  // H5中只有使用自定义标签（如 <my-app>）时，t 和 p 才不同
        }
      ],
      type: 'BODY'  // 同 path 数组中最后一项的 t
      value: '',  // H5中约定：详见“获取节点content”
      frame: {  // 相对于当前webview左上角（webview有可能不撑满手机屏幕）
        x: 10,  // 注：<body> 可能设有 margin
        y: 10,
        w: 300,
        h: 460
      },
      child: [
        {
          path: [
            {
              p: 'DIV',
              i: '0',
              t: 'DIV',
              d: 'mainContainer'  // 元素有id时存在此字段
            }
          ],
          type: 'DIV',
          value: '',
          frame: {...}
          child: [...]
        }
      ]
    }
  ]
}
```

### 获取节点content

节点 content 即一个DOM节点的内容文案，不能都用`innerText`来概括，而应根据节点类型取不同的属性

- 如果是`/(input|textarea|select|option|form)/`等表单元素，不取 content
  - 特例`<input type="button">` 和 `<input type="submit">` 实为按钮，取`value属性`作为 content
- 如果有`title` `alt`属性，就以其值作为 content value
- 如果元素设有`contenteditable`属性（*视为可编辑的元素*），不取 content
- 如果元素无children（末端叶子节点），直接取`innerText`
- 如果元素仍有子元素，取所有的文本节点（也是它的子节点，且`nodeType==3`）
- 以上过程都不满足，返回空字符串



## 采集部分

### 事件捕获

下面主要记录在实现H5页面的数据采集时，关于 touch 事件所遇到的坑。

|                          | Android                                  | IOS                                     |
| ------------------------ | ---------------------------------------- | --------------------------------------- |
| 客户网页中使用 **touchend 跳转**  |                                          |                                         |
| 监听 click 事件              | OK（只要用户不在 touchend 中故意阻止事件preventDefault） | 无法捕获                                    |
| 监听 touch 事件              | OK                                       | 无法捕获                                    |
| 客户网页中使用 **普通 click 跳转**  |                                          |                                         |
| 监听 click 事件              | OK                                       | OK                                      |
| 监听 touch 事件              | OK                                       | 无法排除 safari 双击放大，双击中的第1次 touch 仍会触发匹配流程 |
| 客户网页中使用 **fastclick 跳转** |                                          |                                         |
| 监听 click 事件              | OK                                       | OK                                      |
| 监听 touch 事件              | OK                                       | 同样无法很好的处理 double-tap 问题                 |

几个现象

- android 上不存在 double-tap 放大，会触发两次 click
- ios 上即使页面设了`user-scalable=no`，double-tap 时仍会被判未没有生效的“放大”操作
- android 上的长按链接，时长限制在 590~600ms，与 ios 上长按的时长不同
- ios safari 在链接上快速flip手指时，容易不触发 touchstart

折衷方案

- ios 上只监听 click 事件
- android 上监听 touchstart -> touchmove -> touchend，同时监听 click 事件用于补偿不能判定的case
  - touch 事件用于排除【多指触摸、移动偏差过大、长按】等不应该触发埋点的情况
  - 同时 double-tap 会触发两次 touchend，将忽略其中的第二次
  - 在 touchend 阶段判定有效的点击，并触发埋点
  - 其余不能判定的case，将在 click 阶段再判定是否触发埋点

### 路径匹配算法

H5页面上已被圈选的【埋点】元素路径可能会很多，采用遍历每条圈选路径并打分的算法（最多1轮循环）找出最佳匹配的规则，保证最多触发1个圈选的事件。

```
TO be continue
```



## Bad Case

下面主要记录了开发过程中发现的一些特殊 case 以及相应的处理措施。

| case                                     | 阶段   | 状态        | 备注                                       |
| ---------------------------------------- | ---- | --------- | ---------------------------------------- |
| float 父元素塌陷 直接过滤了                        | 圈选   | **FIXED** | **暂时不直接过滤高为`0`的节点**，区域裁剪时也加入了`overflow`的判断 |
| 轮播 banner 不能圈（很依赖轮播的具体实现）                | 圈选   | PENDING   | 能圈，但只能圈当前那一帧的图片。如果图片撑满了整个轮播容器，那就没法圈到轮播整体。。<br><br>如果是通过`<ul>`定位实现的，`left` 或 `translate` 负值实现的轮播动画，**则无法圈选**（因为`<ul>`已经被判为不在 viewport 中） |
| 位于页面顶部的 fixed header 内容不方便圈（如果后面的元素设了padding） | 圈选   | PENDING   | 案例：ctrip h5 顶部搜索 父容器被下方元素遮住<br><br>**后续考虑在前端做层叠的提示，让用户选择那一层的元素** |
| 父容器设有`margin`，子元素定位时的参考元素在元素在父容器之外，会在区域裁剪时裁掉 | 圈选   | 部分缓解      | 案例：`<body>`设了 margin, `<div>`子元素定位相对`<html>`，被认为超出父容器`<body>`边界。<br><br>**目前引入了子元素最大区域的概念，当父元素非`overflow`时，子元素可接受的范围可向右向下延生，延生到父元素的可接受最大区域**<br><br>**（只要路径上没有节节点设过`overflow`，原理上子元素可接受范围可延生到视窗的最右和最下）**<br><br>**注意：目前只接受向右向下延生到父元素之外，其他方向超出父元素时，仍然会被裁剪到父元素边界** |
| 两个子元素区域之和正好等于父元素区域，就无法圈到父元素              | 圈选   | PENDING   | 现象就是：前端点不到父元素的区域                         |
| 开发者对 html body 设了 height: 100% 导致页面滚动后根节点区域缩小 | 圈选   | FIXED     | 在计算前先对`body`设`height: auto`，完了后再还原       |
|                                          |      |           |                                          |
| 使用 touch 事件，直接在 js 中跳转页面                 | 采集   | 解决部分case  | **监听 touchstart / touchend 事件**来判定，同时监听 click 事件来辅助<br><br>当前规则：touch 位移容忍范围为`<=10px`，touch 时长容忍为`<=750ms`，两次touch间隔时间`>250ms`（参考了 zepto.js 中的阈值）<br><br>FUCK: **仍无法排除 ios safari 下“双击放大”**，会误判为 touchend 触发2次事件 |
| 动态添加出来的元素，碰巧与圈选的元素 path 相同，会被视为1次触发      | 采集   | 低成本缓解     | 已使用路径中的`id`减少了此类干扰（只匹配最里层`id`之后的 tag 和 index）<br>但无法保证用户所有圈选的控件元素都存在`id` |

**暂不支持**：

- 不支持列表内同级元素的*忽略下标*
- 不支持全部 iframe / flash 实现的页面 (视为1个整体元素)，例如 http://music.163.com/
- 不支持手动放大缩小页面时的圈选


