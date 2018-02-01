---
layout: post
title: "跨域通信常用技术"
description: ""
category: 
tags: []
---

<!-- more -->

- 前端常用通信方法实验，侧重跨域以及单双向

|                       | 通信形式 | iframe 场景 | 不改写 document.domain | 跨子域主域 | 不使用 Flash |
| --------------------- | ---- | --------- | ------------------- | ----- | --------- |
| JSONP                 | 单向通信 | ✘         | ✔                   | ✔     | ✔         |
| window.name           | 单向通信 | ✔         | ✘  (IE6/7 例外)       | ✔     | ✔         |
| CORS                  | 单向通信 | ✘         | ✔                   | ✔     | ✔         |
| Flash URLLoader       | 单向通信 | ✘         | ✔                   | ✔     | ✘         |
| Server Proxy          | 单向通信 | ✘         | ✔                   | ✔     | ✔         |
| document.domain       | 双向通信 | ✔         | ✘                   | ✘     | ✔         |
| FIM                   | 双向通信 | ✔         | ✔                   | ✔     | ✔         |
| Flash LocalConnection | 双向通信 | ✘         | ✔                   | ✔     | ✘         |
| postMessage           | 双向通信 | ✔         | ✔                   | ✔     | ✔         |
| Cross Frame           | 双向通信 | ✔         | ✔                   | ✔     | ✔         |



### 参考资料

- [HTTP访问控制（CORS）](https://developer.mozilla.org/zh-CN/docs/Web/HTTP/Access_control_CORS)

