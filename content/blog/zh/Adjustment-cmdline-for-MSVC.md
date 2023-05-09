---
title: c++:改造cmdline用于MSVC下的命令行参数解析
category: 拿来主义
description: "cmdline是一个轻量级的c++命令行参数解析工具，全部源码只有一个cmdline.h头文件，使用起来非常方便，关于如何使用它，不是本文讨论的重点，本文要说的是如何解决cmdline在MSVC下不能编译的问题。"
date: 2021-10-17 13:19:44
tags:
  - C++
  - Microsoft
---

cmdline是一个轻量级的c++命令行参数解析工具，全部源码只有一个cmdline.h头文件，使用起来非常方便，关于如何使用它，不是本文讨论的重点，本文要说的是如何解决cmdline在MSVC下不能编译的问题。

<!--more-->

## 问题

使用cmdline的时候，在gcc下编译都正常，但在MSVC环境下，是不能编译的，因为缺少头文件`cxxabi.h`,这个头文件MSVC是没有的, 因此不能直接被MSVC编译进去。而`#include <cxxabi.h>`中的函数只有一处被用到: 

```c++
static inline std::string demangle(const std::string& name)
{
    int status = 0;
    char* p = abi::__cxa_demangle(name.c_str(), 0, 0, &status);
    std::string ret(p);
    free(p);
}
```

## 原因

C/C++语言在编译以后，函数和数据类型的名字会被编译器修改，改成编译器内部的名字，这个名字会在链接的时候用到。如果用backtrace之类的函数打印堆栈时，显示的就是被编译器修改过的名字，比如说`_Z3foov` ， 数据类型名称也是一样，比如在gcc下`double`的类型内部名字就变成`d`,gcc下调用`typeid(double).name()`返回的结果是`d` .

那么这个函数或类型真实的名字是什么呢？ 如何在运行时获取类型或函数真实的名称呢？ 

上面这个demangle函数中调用的`abi::__cxa_demangle`的作用就是将编译器内部使用的名字反向转换(demangle)为源代码中定义的名字。 

MSVC为什么没有提供`abi::__cxa_demangle`类似的功能呢？因为MSVC编译器编译的代码`typeid`返回的是demangle后的结果。 

也就是说，在MSVC下`typeid(double).name()`返回的就是`double`。所以不需要类似的功能。

## 解决

解决的方案也很简单, 通过在编译时区分编译器, 即可针对不同的编译器使用不同的编译策略. 

首先是头文件部分, 仅在使用GCC时加入这个头文件:

```c++
#ifdef __GNUC__
#include <cxxabi.h>
#endif // __GNUC__
```

其次是针对这个函数, 我们在使用GCC时保留原逻辑, 并在使用MSVC时直接返回原名. 对于其他的编译器, 则直接报错, 让用户自己实现一个demangle(无慈悲).

```c++
static inline std::string demangle(const std::string& name)
{
#ifdef _MSC_VER
    return name;
#elif defined(__GNUC__)
    int status = 0;
    char* p = abi::__cxa_demangle(name.c_str(), 0, 0, &status);
    std::string ret(p);
    free(p);
    return ret;
#else //其他不支持的编译器需要自己实现这个部分
#error Unexcepted C/C++ complier(MSVC/GCC), Need to implement this method for demangle
#endif // _MSC_VER
}
```

## 附录: 区分不同编译平台的宏

### 编译器

* GCC
  * `#ifdef  __GNUC__`
  * `#if __GNUC__ >= 3 // GCC3.0以上`
* Visual C++
  * `#ifdef  _MSC_VER`（非VC编译器很多地方也有定义）
  * `#if _MSC_VER >=1000` // VC++4.0以上
  * `#if _MSC_VER >=1100` // VC++5.0以上
  * `#if _MSC_VER >=1200` // VC++6.0以上
  * `#if _MSC_VER >=1300` // VC2003以上
  * `#if _MSC_VER >=1400` // VC2005以上
* Borland  C++
  * `#ifdef  __BORLANDC__`

### UNIX

* UNIX
  * `#ifdef  __unix`
  * `#ifdef  __unix__`

* Linux 
  * `#ifdef  __linux`
  * `#ifdef  __linux__`

* FreeBSD 
  * `#ifdef  __FreeBSD__`
* NetBSD 
  * `#ifdef  __NetBSD__`

### Windows

* 32bit
  * `#ifdef  _WIN32`
  * `#ifdef WIN32`
* 64bit
  * `#ifdef  _WIN64`
* GUI  App
  * `#ifdef  _WINDOWS `
* CUI  App
  * `#ifdef  _CONSOLE`
* Windows的Ver … WINVER
  ※ PC机Windows（95/98/Me/NT/2000/XP/Vista）和Windows CE都定义了
  * `#if (WINVER >= 0x030a) `// Windows 3.1以上
  * `#if (WINVER >= 0x0400)` // Windows 95/NT 4.0以上
  * `#if (WINVER >= 0x0410) `// Windows 98以上
  * `#if (WINVER >= 0x0500) `// Windows Me/2000以上
  * `#if (WINVER >= 0x0501)` // Windows XP以上
  * `#if (WINVER >= 0x0600) `// Windows Vista以上
* Windows 95/98/Me的Ver … 
  * `_WIN32_WINDOWS`
* MFC App、PC机上（Windows CE没有定义）
  * `#ifdef  _WIN32_WINDOWS`
  * `#if (_WIN32_WINDOWS >= 0x0400)` // Windows 95以上
  * `#if (_WIN32_WINDOWS >= 0x0410) `// Windows 98以上
  * `#if (_WIN32_WINDOWS >= 0x0500) `// Windows Me以上

* Windows NT 的Ver … 
  * `_WIN32_WINNT`
  * `#if (_WIN32_WINNT  >= 0x0500)` // Windows 2000以上
  * `#if (_WIN32_WINNT  >= 0x0501)` // Windows XP以上`
  * `#if (_WIN32_WINNT  >= 0x0600)` // Windows Vista以上

* Windows CE（PocketPC ）
  * `#ifdef  _WIN32_WCE`
* Windows CE
  * `WINCEOSVER`
* Windows CE
  * `WCE_IF`
* Internet Explorer的Ver 
  * `_WIN32_IE `

### Cygwin
* Cygwin
  * `#ifdef  __CYGWIN__`
* 32bit版Cygwin（现在好像还没有64bit版）
  * `#ifdef  __CYGWIN32__`
* MinGW（-mno-cygwin指定）
  * `#ifdef  __MINGW32__`
