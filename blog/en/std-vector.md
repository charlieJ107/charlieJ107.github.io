---
draft: false
title: "std::vector"
date: 2020-03-03 18:50:03
category: Learning Notes
tags: 
    - C++
    - libstd
description: "I used `std::vector` while solving a problem today. Here I'm recording some notes; the content is mainly from the book 'The C++ Standard Library'."
---
I used `std::vector` while solving a problem today. Here I'm recording some notes; the content is mainly from the book "The C++ Standard Library".

<!--more-->

According to the C++ standard, vector is implemented as a dynamic array. Before using it, you need to include the header file `<vector>`:

```cpp
#include <vector>
```

### Size and Capacity

Vector itself is very efficient, but at the cost of allocating more space than needed. So compared to some manual algorithms, it may not be as ideal for space control.

To get the current number of elements in a vector, you can use the `size()` method:

```cpp
//std::vector<int> coll
coll.size()
```

It directly returns an integer, which is the number of elements in the vector.

If the vector is empty, `coll.empty()` will return `true`.

In addition to this, there's another issue to consider: the capacity of a vector. Especially if you need to frequently use the vector's ability to change its length on a large scale, you need to pay particular attention. Since a vector may reallocate space during execution, this will cause addresses to change. If you don't take any measures, the original references, pointers, and iterators may all become invalid. And reallocating memory is very time-consuming, so you need to carefully consider the capacity issue.

You can use `reserve()` to reserve adequate capacity to avoid reallocating memory due to insufficient capacity:

```cpp
std::vector<int> v;
v.reserve(80);//reserve memory for 80 elements
```

However, unlike strings, vectors can't use `reserve()` to shrink the capacity. A vector's capacity cannot be reduced (but its size can). If you pass a parameter to `reserve()` that is smaller than the current capacity, nothing will happen.

### Common Operations

`c.empty()`: returns whether the vector is empty

`c.size()`: returns the number of elements

`c.max_size()`: returns the maximum possible number of elements

`c.assign(n, elem)`: copies n copies of elem to c

`c.assign(begin, end)`: assigns elements in the range [begin, end) to c

`c.assign(initlist)`: assigns values to c using an initializer list

`c1.swap(c2)` or `swap(c1, c2)`: swaps the data in c1 and c2

#### Access Operations

`c[index]` (no range check) or `c.at(index)` (with range check)

`c.front()` returns the first element

`c.back()` returns the last element

### Iterators

`c.begin()`, `c.end()` return a random-access iterator pointing to the first and last elements

`c.cbegin()`, `c.cend()` return a const random-access iterator pointing to the first and last elements

`c.rbegin()`, `c.rend()`, `c.crbegin()`, `c.crend()` return reverse iterators pointing to the first and last elements

#### Operations Using Iterators

`c.push_back(elem)`: appends a copy of elem to the end

`c.pop_back()`: reverse operation of the above

`c.insert()` supports the following parameter lists:

`pos, elem`

`pos, n, elem`

`pos, begin, end`

`pos, initlist`

`c.emplace(pos, args...)`

`c.emplace_back(args...)`

`c.erase(pos)`: removes the element at the iterator pos

`c.erase(begin, end)`: removes all elements from begin to end

So if you want to remove elements that "equal a certain value", although vector doesn't directly provide this, you can achieve it through some auxiliary functions. For example, you can use the following statement to remove all elements with value val:

```cpp
#include<algorithm>//provides the declaration of the remove function
std::vector<elem> coll;
...
//remove all elements with value val
coll.erase(remove(coll.begin(), coll.end(), val), coll.end());
```

If you want to delete only the first element with the same value:

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

### Exception Handling for Vector

Unless the user has defined a new exception or a standard exception (like `bad_alloc`), `c.at()` is the only standard-approved function that can throw exceptions. Other functions basically don't throw exceptions; the standard even guarantees that methods like `push_back()` will never throw exceptions.
