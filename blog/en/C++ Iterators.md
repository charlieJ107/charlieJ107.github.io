---
draft: false
title: "C++ Iterators"
date: 2020/5/6
categories: 
    - Learning Notes
tags: 
    - C++
    - libstd
description: "I honestly have no idea where my previous iterator summary went... Guess I'll just write it again..."
---

I honestly have no idea where my previous iterator summary went... Guess I'll just write it again...

<!--more-->

### What are Iterators and Why Do We Need Them?

STL provides many types of containers, like arrays and vectors. Iterators provide a unified interface for operating on these containers. Although the iterator objects themselves differ across different container types, they expose the same interface, allowing you to perform the same (or at least similar) operations through the same interface.

### Iterator Categories

Iterator operations can be divided into two types: reading and writing, which correspond to input and output operations for containers. An input iterator reads data from a container into the program, while an output iterator writes data into the container. The terms "input" and "output" refer to the container's perspective: writing data into the container is called input, and reading data from the container into the program is called output.

Additionally, based on the iteration direction, iterators can be classified into forward iterators, reverse iterators, random access iterators, and bidirectional iterators. Input iterators are typical single-pass iterators that can only increment but not decrement. Output iterators are also single-pass. Bidirectional iterators have all the characteristics of forward iterators while additionally supporting two decrement operations: `++i` and `i++`.

Generally, the most commonly used are random access iterators, which have all the characteristics of bidirectional iterators and additionally support random access operations, such as pointer arithmetic operations and comparison operators for sorting elements.

At this point you'll notice that iterators form a hierarchy. The highest level is the random access iterator, which has all the functionality of all previous iterator types while supporting some operations that other iterator types don't support. Of course, this comes at the cost of higher overhead. If your program is performance-sensitive, you need to consider these differences; otherwise, you can simply use random access iterators.

The types of various iterators are not fixed; they are merely conceptual descriptions. In actual implementation, each container class defines a class-level `typedef` named `iterator`. For example, the iterator type for `vector<int>` is `vector<int>::iterator`. However, the documentation for this class also indicates that a vector's iterator is a random access iterator, which allows algorithms based on any iterator type to be used on it. Similarly, the iterator for `list<int>` is `list<int>::iterator`. For another example, STL provides a doubly-linked list with a bidirectional iterator, but this iterator cannot use algorithms based on random access, though it can use algorithms supported by bidirectional iterators.

### Common Iterator Models

#### 1. Using Pointers as Iterators

Iterators are essentially generalized pointers, and pointers satisfy all the requirements of iterators. Since iterators are the interface for STL algorithms and pointers are iterators, STL algorithms can operate on pointer-based non-STL containers using pointers. This allows you to use STL's algorithms on your own data structures, not just STL containers. For example, STL algorithms can be used on arrays to perform sorting with `sort()`.

`sort()` takes iterators pointing to the first element of the container and the one-past-the-end element as parameters. Let's say we have a `double` array called `Receipts`; we'll use it as an example to perform ascending sort:

```cpp
const int SIZE = 100;
double Recipts[SIZE];
```

Now we find the parameters we want to pass, which are `&Reciptes[0]` and `&Reciptes[SIZE]`. You can then sort it using this function call:

```cpp
sort(Reciptes, Reciptes[SIZE]);
```

Of course, you can also use other STL functions like `copy()`, or even `copy()` your array to the screen by passing it to an `ostream_iterator`:

```cpp
#include <iterator>
ostream_iterator<int, char> out_iter(cout, " ");
copy(dice.begin(), dice.end(), out_iter);
```

#### 2. Other Useful Iterators

In addition to `ostream_iterator`, the `<iterator>` header file provides several other predefined iterator types, such as `reverse_iterator`, `back_insert_iterator`, `front_insert_iterator`, and `insert_iterator`. Each has its own strengths, and you can check the official documentation to learn more about them.
