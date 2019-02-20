---
layout: post
title: "常用git命令"
keywords: "git, reset, revert"
category: 开发
tags: [git]
---

主要记录些 git 工作流中最最常用的几个操作，如：提交合并，撤销修改，回滚等操作。

之前也整理过关于 [git submodule](/blog/2016/10/usage-of-git-submodule.html) 的文档，这里简单记录一些自己常用的命令。

<!-- more -->

提交
-----

用于保持commit树的整洁

```bash
git commit --amend 【修改最后一次提交】
git pull --rebase
```

手动合并

```bash
git fetch
git merge branch_name 【在一个分支下合并另一个分支上的改动】
```


撤销回退
--------

```bash
git rm --cache file_path 【撤消已暂存的文件】
git checkout -- file_path 【撤消对文件的修改】
git reset --hard commit_id 【撤消commit】
git reset --hard HEAD^ 【回退到最新的前一次commit】
```

[Git入门指南八:Git撤消操作](http://blog.csdn.net/wirelessqa/article/details/20152353)

[Git入门指南十一:Git branch 分支与合并分支](http://blog.csdn.net/wirelessqa/article/details/20153689)


回滚的两种情况
--------------

### A) 还没有 push

这种情况发生在你的本地代码仓库，可能你 add commit 以后发现代码有点问题，准备取消提交，用到下面命令

```bash
git reset [--soft | --mixed | --hard]
```

1、`--mixed`

会保留源码，只是将 git commit 和 index 信息回退到了某个版本。git reset 默认是 --mixed 模式。

2、`--soft`

保留源码，只回退到 commit 信息到某个版本，不涉及index的回退。如果还需要提交，直接commit即可。

3、`--hard`

源码也会回退到某个版本，commit 和 index 都回回退到某个版本。注意，这种方式是改变本地代码仓库源码。

当然有人在 push 代码以后，也使用 `git reset --hard <commit_id>` 回退代码到某个版本之前，但是这样会有一个问题，你线上的代码没有变，线上commit 和 index都没有变，当你把本地代码修改完提交的时候你会发现全是冲突。。。


### B) 已经 push

对于已经把代码push到线上仓库，你回退本地代码其实也想同时回退线上代码。回滚到某个指定的版本，并使线上/线下代码保持一致，要用到`revert`命令。

git revert: 用于反转提交，执行 revert 命令时要求工作树必须是干净的。

**【注意】git revert 用一个新提交来消除一个历史提交所做的任何修改**

revert 之后你的本地代码会回滚到指定的历史版本，这时你再 git push 既可以把线上的代码更新，也不会像 reset 造成冲突的问题。

```bash
git revert commit_id
```


### revert 与 reset 区别

reset 是在正常的 commit 历史，删除了指定的 commit，这时 HEAD 是向后移动了。而 revert 是在正常的 commit 历史中再 commit 一次，只不过是反向提交，它的 HEAD 是一直向前的。

如果在日后现有分支和历史分支需要合并的时候，reset 恢复部分的代码依然会出现在历史分支里，但是 revert 方式提交的 commit 并不会出现在历史分支里。


### 参考

图解Git：[https://marklodato.github.io/visual-git-guide/index-en.html](https://marklodato.github.io/visual-git-guide/index-en.html)

官方手册：[https://git-scm.com/book/zh/v2/](https://git-scm.com/book/zh/v2/)
