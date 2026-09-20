---
draft: false
title: "C++ Virtual Methods"
date: 2020-11-03
categories:
    - Learning Notes
tags:
    - C++
description: "The virtual keyword is commonly used on methods in C++ classes to declare them as virtual methods. Virtual methods allow programs to choose the correct function implementation based on the actual object type."
---
<!--description--->
The virtual keyword is commonly used on methods in C++ classes to declare them as virtual methods. Virtual methods allow programs to choose the correct function implementation based on the actual object type.

<!--more-->

As everyone knows, in the process of class inheritance, derived classes inherit methods from base classes. When a derived class redefines a method that is identical to one declared in the base class, the base class method can be overridden. In typical object usage, for two methods with different behavior, the program will decide which version to use based on the actual type of object being used.

However, as a C++ programmer, you typically don't pass objects by value; instead, you pass pointers or references (especially references).

At the same time, during coding it's easy to unexpectedly find yourself passing a derived class object through a base class variable (including pointer and reference variables). In this case, for a derived class object, according to how the program is preset, it will call the base class's corresponding method with the same name. If the derived class has special requirements for this method, those requirements are ignored. This is not what we want.

The `virtual` keyword exists to solve this problem. When a method is declared as `virtual` in the base class, calling this method through a pointer or reference will automatically choose the correct version based on the type of object **that the pointer or reference points to**, rather than merely based on the **type of the pointer or reference variable itself**.

Let's look at an example from *C++ Primer Plus*:

```cpp
/***************************************
 * File: brass.h
 * Bank account classes
***************************************/

#ifndef BRASS_H_
#define BRASS_H_

#include <string>

// Brass Account Class (Base class)

class Brass
{
private:
    std::string fullName;
    long acctNum;
    double balance;
public:
    Brass(const std::string & s = "Nullbody", long an = -1, double bal = 0.0);
    void Deposit(double amt);
    virtual void Withdraw(double amt);
    double Balance() const;
    virtual void ViewAcct() const;
    virtual ~Brass() {}//Note: the destructor here is a virtual function
};

```

This is a base class. As you can see, the `Balance()` and `Withdraw()` methods in this base class are declared as virtual methods.

Meanwhile, there is a class named `BrassPlus` that inherits from this base class:

```cpp
//Brass Plus Account Class
class BrassPlus : public Brass
{
private:
    double maxLoan;
    double rate;
    double owesBank;
public:
    BrassPlus(const std::string & s = "Nullbody", long an = -1);
    ...;
    virtual void ViewAcct() const;
    virtual void Withdraw(double amt);
    ...; //Some methods not in the base class
    //Note: this derived class does not explicitly declare a destructor
};
```

Declaring a virtual destructor in the base class ensures that when a derived class object is destroyed, it is destructed in the correct way, avoiding memory leaks. **You should always declare a virtual destructor in the base class**.

## Dynamic Binding and Static Binding

Binding: deciding which version of a function to use (the overloaded one, the overridden one, or the original).

Static binding: determined at compile time (for overloaded functions, the compiler can determine which one to use based on function parameters at compile time).

Dynamic binding: determined at runtime, for `virtual` functions that have been overridden.

How is dynamic binding performed? It is based on the compatibility of C++ pointer and reference types.

Since class inheritance represents an "is-a" relationship, this relationship determines that base class pointers or references can point to derived class objects. This is accomplished through upcasting. C++ uses virtual member functions to satisfy this requirement. The underlying implementation of virtual functions uses a virtual function table.

## Virtual Function Table

C++ doesn't specify in its standard how virtual functions should be implemented, but typically compilers use a virtual function table. The virtual function table is a hidden member that exists in each object. It is a pointer that points to an array whose members are addresses of virtual functions. The virtual function table stores what functions the object will actually use. If a derived class contains a new definition of a virtual function, the virtual function table will store the newly defined function; otherwise, if no new function is defined, the virtual function table stores the original function.

This leads to a problem: objects that have virtual functions will be larger than expected! Additionally, calling a function will include the time cost of looking up its address.

## What Are Virtual Methods For?

This is something I learned gradually through various experiences. Usually, when designing a base class, we try to use virtual methods as much as possible. Especially when we want to create an interface that only provides method declarations without providing implementations, virtual methods are very useful. Not only do they allow us to successfully call the derived class's methods when we call them, but they also remind us promptly to implement the methods.

It's worth noting that since a constructor needs to know the concrete type of the object, and the behavior of virtual functions is determined at runtime, when the compiler doesn't know all the information about the object, it cannot provide what the constructor needs. Therefore, **constructors cannot be virtual functions**.

On the other hand, since destructors often need to be destructed according to the actual situation of the derived class, **destructors are often virtual functions**.
