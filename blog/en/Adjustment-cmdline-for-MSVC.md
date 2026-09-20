---
draft: false
title: "C++: Adapting cmdline for MSVC Command-Line Argument Parsing"
category: Borrowed
description: "cmdline is a lightweight C++ command-line argument parsing tool consisting of just a single cmdline.h header file, making it very convenient to use. This article focuses on how to resolve the issue of cmdline not compiling under MSVC."
date: 2021-10-17 13:19:44
tags:
  - C++
  - Microsoft
---

cmdline is a lightweight C++ command-line argument parsing tool consisting of just a single cmdline.h header file, making it very convenient to use. This article focuses on how to resolve the issue of cmdline not compiling under MSVC.

<!--more-->

## Problem

When using cmdline, compilation works fine under GCC, but it fails to compile under MSVC because it's missing the `cxxabi.h` header file, which MSVC doesn't provide, so it cannot be directly compiled by MSVC. The function from `#include <cxxabi.h>` is used in only one place:

```cpp
static inline std::string demangle(const std::string& name)
{
    int status = 0;
    char* p = abi::__cxa_demangle(name.c_str(), 0, 0, &status);
    std::string ret(p);
    free(p);
}
```

## Reason

When C/C++ code is compiled, function and data type names are modified by the compiler into internal names, which are used during the linking phase. When printing the stack trace using functions like backtrace, what's displayed are these compiler-modified names, for example `_Z3foov`. Data type names are handled similarly; for instance, in GCC, the internal name for `double` becomes `d`, and calling `typeid(double).name()` in GCC returns `d`.

So what are the real names of functions and types? How can we retrieve the real names of types or functions at runtime?

The `abi::__cxa_demangle` function called in the demangle function above serves to reverse-convert (demangle) the compiler's internal names back into the names as defined in the source code.

Why doesn't MSVC provide functionality similar to `abi::__cxa_demangle`? Because the code compiled by MSVC's compiler already returns the demangled result when `typeid` is called.

That is, in MSVC, `typeid(double).name()` already returns `double`. So such functionality is not needed.

## Solution

The solution is straightforward: we can distinguish between compilers at compile time and use different compilation strategies for each compiler.

First, in the header file section, include this header only when using GCC:

```cpp
#ifdef __GNUC__
#include <cxxabi.h>
#endif // __GNUC__
```

Second, for this function, we preserve the original logic when using GCC, and directly return the original name when using MSVC. For other compilers, we produce a compilation error and let the user implement their own demangle (no mercy):

```cpp
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
#else //Other unsupported compilers need to implement this part themselves
#error Unexpected C/C++ compiler (MSVC/GCC), need to implement this method for demangle
#endif // _MSC_VER
}
```

## Appendix: Macros to Distinguish Different Compilation Platforms

### Compilers

* GCC
  * `#ifdef  __GNUC__`
  * `#if __GNUC__ >= 3 // GCC 3.0 and above`
* Visual C++
  * `#ifdef  _MSC_VER` (many non-VC compilers also define this)
  * `#if _MSC_VER >=1000` // VC++ 4.0 and above
  * `#if _MSC_VER >=1100` // VC++ 5.0 and above
  * `#if _MSC_VER >=1200` // VC++ 6.0 and above
  * `#if _MSC_VER >=1300` // VC 2003 and above
  * `#if _MSC_VER >=1400` // VC 2005 and above
* Borland C++
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

* 32-bit
  * `#ifdef  _WIN32`
  * `#ifdef WIN32`
* 64-bit
  * `#ifdef  _WIN64`
* GUI App
  * `#ifdef  _WINDOWS `
* CUI App
  * `#ifdef  _CONSOLE`
* Windows Version ... WINVER
  * Both PC Windows (95/98/Me/NT/2000/XP/Vista) and Windows CE define this
  * `#if (WINVER >= 0x030a) ` // Windows 3.1 and above
  * `#if (WINVER >= 0x0400)` // Windows 95/NT 4.0 and above
  * `#if (WINVER >= 0x0410) ` // Windows 98 and above
  * `#if (WINVER >= 0x0500) ` // Windows Me/2000 and above
  * `#if (WINVER >= 0x0501)` // Windows XP and above
  * `#if (WINVER >= 0x0600) ` // Windows Vista and above
* Windows 95/98/Me Version ...
  * `_WIN32_WINDOWS`
* MFC App, PC platforms (not defined on Windows CE)
  * `#ifdef  _WIN32_WINDOWS`
  * `#if (_WIN32_WINDOWS >= 0x0400)` // Windows 95 and above
  * `#if (_WIN32_WINDOWS >= 0x0410) ` // Windows 98 and above
  * `#if (_WIN32_WINDOWS >= 0x0500) ` // Windows Me and above

* Windows NT Version ...
  * `_WIN32_WINNT`
  * `#if (_WIN32_WINNT  >= 0x0500)` // Windows 2000 and above
  * `#if (_WIN32_WINNT  >= 0x0501)` // Windows XP and above
  * `#if (_WIN32_WINNT  >= 0x0600)` // Windows Vista and above

* Windows CE (PocketPC)
  * `#ifdef  _WIN32_WCE`
* Windows CE
  * `WINCEOSVER`
* Windows CE
  * `WCE_IF`
* Internet Explorer Version
  * `_WIN32_IE `

### Cygwin
* Cygwin
  * `#ifdef  __CYGWIN__`
* 32-bit Cygwin (64-bit doesn't seem to exist yet)
  * `#ifdef  __CYGWIN32__`
* MinGW (with -mno-cygwin option)
  * `#ifdef  __MINGW32__`
