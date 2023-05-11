---
title: 'std::vector'
date: 2020-03-03 18:50:03
category: 学了就忘
tags: 
    - C++
    - libstd
description: 今天做题的时候用到了`std::vector`, 这里记录一下，内容主要来自《C++标准库》这本书。
---
今天做题的时候用到了`std::vector`, 这里记录一下，内容主要来自《C++标准库》这本书。
<!--more-->

根据C++standard，vector是以dynamic array实现的。在使用之前需要包含头文件`<vector>`

```cpp
#include <vector>
```

### 大小和容量

Vector本身效率很高，但代价是需要分配出更大的空间。所以相比起一些手动算法，在空间控制上可能没那么理想。

想要获得当前vector内的元素个数，可以使用`size()`方法。

```cpp
//std::vector<int> coll
coll.size()
```

可以直接返回一个整数，其大小是这个vector内的元素个数。

如果这个vector是空的，则`coll.empty()`会返回`true`。

除此之外，还涉及一个问题就是一个vector的容量（Capacity）。特别是如果你需要使用频繁、大规模地使用Vector可以改变长度这个特性的话，尤其需要注意。因为vector在运行过程中可能会重新分配空间，这将导致地址发生变化，如果不做任何措施，原有的引用、指针和迭代器等都可能会失效。而且重新分配内存很耗时间。序偶一你需要好好考虑容量问题。

​	你可以使用`reserve()`来保留适当的容量以避免因容量不够而重新分配内存：

```cpp
std::vector<int> v;
v.reserve(80);//reserve memroy for 80 elements
```

但vector不能像string那样用`reserve()`来减小容量。vector的容量不能缩减(但长度可以缩减)。如果给`reserve()`的参数小于当前容量，什么也不会发生。

### 几种比较常见的操作

`c.empty()`: 返回是否为空

`c.size()`：返回元素个数

`c.max_size()`发挥元素个数之最大可能量

`c.assign(n, elem)`: 复制n个elem赋给C

`c.assign(begin, end)`: 将区间[begin, end)内的元素赋给c

`c.assign(initlist)`: 用初始值列表给c赋值

`c1.swap()`或`swap(c1, c2)`: 置换c1和c2的数据

#### 访问操作

`c[index]`(不检查范围)或`c.at(index)`（检查范围）

`c.front()`返回首元素

`c.back()`返回末尾元素

### 迭代器相关

`c.begin()`, `c.end()`返回一个random-access iterator指向首、尾元素

`c.cbegin()`, `c.cend()` 返回一个const ramdom-access iterator指向首、尾元素

`c.rbegin()`, `c.rend()`, `c.crbegin()`, `c.crend()`返回反向迭代的首尾元素迭代器

#### 利用迭代器的一些操作

`c.push_back(elem)`: 附加一个elem拷贝于末尾

`c.pop_back()`: ...上面的逆操作

`c.insert()`支持以下参数列表：

`pos, elem`

`pos, n, elem`

`pos, begin, end`

`pos, initlist`

`c.emplace(pos, args...)`

`e.emplace_back(args...)`

`c.erase(pos)`: 移除pos这个iterator上的元素

`e.erase(begin, end)`： 移除从begin到end中间所有的元素

所以如果你想移除“与某个值相等”的元素，虽然vector没有直接提供，但是可以通过其他一些辅助函数来实现。比如，你可以通过下面这个语句将所有值为val的元素移除

```cpp
#include<algorithm>//提供remove函数的声明
std::vector<elem> coll;
...
//remove al elements with value val
coll.erase(remove(coll.begin(), coll.end(), val), coll.end());
```

如果你想只删除值一样的第一个元素：

```cpp
std::vector<elem> coll;
...
std::vector<elem>::iterator pos;
pos=find(coll.begin(), coll.end(), val);
if(pos!=coll.end())
{
    coll.erase(pos);
}
```



###　关于Vector的异常处理

除非用户自定义了新的异常，或者标准异常（比如`bad_alloc`), `c.at()`是唯一一个标准认可的可以抛出异常的函数. 其他的函数，基本都不会抛出异常，甚至标准还保证类似`push_back()`这样的方法绝对不会抛出异常。

