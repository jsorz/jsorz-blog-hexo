---
title: 没有完美的架构
category: 吹水
tags: []
---

赞同一个观点：**没有完美的架构，只有平衡的架构，没有单点的完美，只有多点的平衡。**

在做物料平台的过程中，开始感受到上面的观点了。

<!-- more -->

物料的最最最下游，就是组件。怎么开发一个组件，在 nodejs 兴起之前，早就有人在做了。nodejs 促进了前端工程化的兴起，到现在，开发一个组件的过程，都快赶上 Hello World 一样简单了。

从组件出发，往上游追溯，前端玩的花样很多了。这并不是一个严格的分层结构，铺开的话更像一个星状结构，内部紧密联系着，所以肯定有槽点吧。

<img src="/images/captures/20200530_material_layer.png">

再看到内部，每个模块都或多或少存在些问题和槽点，你不管是用 cli 还是用 def 这样的一体化平台，你总是会发现不爽之处的。所以就是，能用就行，我们追求的不是单点的完美，而是多点的平衡，让各块能够一起运作以完成一个更大的目标。