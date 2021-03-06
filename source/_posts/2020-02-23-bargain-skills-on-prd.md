---
title: 需求撕X技巧
category: 吹水
tags: []
---

这周撕了3个需求，分享下我的套路，总的来说「把大需求聊小，把小需求聊没」。

<!-- more -->

**1、先做主要功能，次要功能拆到二期。**

上线一周后，主动跟进 PV/UV 和接口请求量，没达到业务预期效果的话，让他们复盘，拒绝二期、三期。

- 案例：1月提了H5版的运单详情需求，先砍掉页面里“骑手轨迹”功能（开发复杂，但又不影响运单的主要信息）。
- 反击：上线一周，发现接口请求量只有 100 来次/天，顺理成章就砍掉了“骑手轨迹”。



**2、需求上线后不久，又提出新概念。**

新概念可能会增加理解负担或降低现有功能的使用率，要主动拒绝这类“拍脑袋”的需求。建议产品不要一直做加法，应该利用好现有的功能。

- 案例：在去年底做了运营规则台的大重构，年前才上线。一个月后，运营同学觉得不好用，产品又提出了“规则组”的概念。
- 反击：为什么重构的时候不想想清楚？识别需求方真正诉求的场景，原来他只是想创建规则时少填一些相同的字段。于是换一种简单实现，通过“复制规则”以及“批量创建”的功能去满足他。



**3、提出的需求反复在解决相同的问题**

先让需求方拿出数据，他说的“不好用”到底是技术原因还是没运营好？先让他们用非技术手段去尝试解决，拒绝“口说无凭”的需求。

- 案例：在去年11月做了天气审核权限的下放，并规划在了一个大项目里。现在提需求说要移动化办公，做到APP里。
- 反击：为什么一开始不做成移动版，为什么现有PC版使用率不高就能说明移动版使用率就高了？如果需求方觉得是因为“没电脑不方便”，那让他们先强推下“用手机访问网页”的方式去验证。利用现有能力让业务先行，把运营手段和流程完善后，再来提需求。



**4、需求方案不佳，存在一定临时性。**

同样让业务方同学先给数据，目前是什么情况，做这个方案后预计会怎样？竞品是怎么做的？是否可以什么都不做，通过现有/第三方工具同样实现业务诉求。

把大需求聊小，把小需求聊没，关键我们要给出建议，才能让他们妥协。在需求预评审时，把业务方同学叫上，挺有必要的。

