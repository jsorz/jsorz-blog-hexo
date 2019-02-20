---
title: bash基础编程 (听课笔记)
category: 开发
tags: [linux]
---

也是去年公司培训里听课的一些笔记，较为粗略，主要供自己查阅用。bash 命令自己平时用的少，得督促了，在写 build 过程中很管用的。

<!-- more -->

热身
-------

seq

```bash
seq 0 5
seq -s
```

bc

```bash
echo 1+2 | bc
echo '1+2' | bc
```

求和

```bash
seq -s '+' 100 | bc
```


基础概念
-------

命令

- 关键字
- 内建命令
- 外建命令，如 wget

shell 特点

- quick and dirty
- 符合 unix 哲学
- 一切都是字符
- 一切都是进程
- 面向过程的编程


运行模式

- 交互式、登录shell
    - `echo 'aaa'`
- 非交互式、非登录shell
    - `./xxx.sh`
- 非交互式、登录shenll
    - `bash -l xxx.sh`
- 交互式、非登录shell
    - `bash -i xxx.sh`

几种模式

- 加载的文件不同
- 查看当前模式：`echo $-`



基础编程
-------

变量

- 赋值时`=`不能加空格
- `$a => ${a}`
- 变量字符匹配：被匹配的，即是被删除的
    - `echo ${a##.*}`

```bash
${a}

${#a}   变量得长度
${a%}   尾匹配
${a%%}  最大尾匹配
${a#}   头匹配
${a##}  最大头匹配
```

数组

```bash
array=(a b c)
${a[0]}
${#a[0]}    第一个元素的长度
${a[@]}
${#a[@]}    数组的长度
```

成功与非成功

- 0 为成功，非0 为不成功
- 所有返回值，介于 0~255 之间
- true, false 命令
    - 与、或，“&&”、“||”
    - && 可连续多个，|| 建议只用于二选一，避免逻辑混乱
    - 注：有点类似 js 里
- `echo $?` 前一次脚本的返回值

条件判断

- 返回值“0”为“真（成功）”
- `if`、`test`、`[[ ]]`
- bash兼容了很多种写法，建议只记住`if [[ ]]`

循环遍历

```bash
#!/bin/bash
ary=(a b c)
for (( i=0; i<${#ary[@]}; i++ )) ; do
    echo ${ary[$i]}
done
```



字符处理
-------

- 正则与通配符
    - 正则，一般通过外部命令实现，如 awk, grep 等
    - 通配符即 “glob”，优先于正则
- glob 优先
    - `echo 2*3 | bc`
    - `echo 2* 3 | bc`
    - `echo 2 * 3 | bc`  此时`*`会被认为是通配符
    - 标准写法：`echo '2 * 3' | bc`  使用单引号

set 命令：更健壮的脚本

- `set -u` 阻止变量空值，抛出错误
- `set -e` 异常 false 值是否放行
    
    ```
    false || echo 'something false here'
    ```

- `set -o pipefail` 管道中的 false 值



高阶话题
-------

锁：保证幂等性

- 标准模板 TODO

调试

```bash
trap DEBUG
bash -x
```

here-document

- 文本输入：`<<`

进程替换

```bash
diff <(echo x) <(echo y)
```

here-string

```bash
sed 's/a/A/' <<< abc
```

多进程并发控制

- 标准模板 TODO
- 用 read 来阻塞（等输入）
- 用 fd



误操作
-------

rm 重灾区

```bash
rm -rf $dir/
rm -rf  / dir （路径前多了一个空格，也相当于把根目录也删了）
rm -rf /path/a/b

cd dir/ （如果dir目录不存在，不知道会删掉啥。。）
rm -rf *
```

double check

- `set -ue`
- 执行前加#，防止没敲完时直接执行
