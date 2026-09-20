---
draft: false
title: "Learning Dependency Injection from ASP.NET Core"
date: 2020/5/6
categories:
    - Learning Notes
tags: 
    - C#
    - ASP.Net Core
    - Micorsoft
description: "I was building a textbook subscription management system with custom shopping cart classes `Cart` and `CartManager`, ran into some issues, and carefully read through the official documentation to understand it better. Here's what I learned."
---

I was building a textbook subscription management system with custom shopping cart classes `Cart` and `CartManager`, ran into some issues, and carefully read through the official documentation to understand it better. Here's what I learned:
<!--more-->

### Overview

#### 1. What is a dependency?

A dependency is any object that another object needs.

For example, my `CartManager` object depends on `Cart` objects, `ICollection` objects, `BookBill` objects, and so on.

#### 2. Why do dependency injection?

The official documentation uses a simpler example. Say you have a `MyDependency` class that other classes depend on, and they need to call its `WriteMessage` method:

```c#
public class MyDependency
{
    public MyDependency()
    {
    }

    public Task WriteMessage(string message)
    {
        Console.WriteLine(
            $"MyDependency.WriteMessage called. Message: {message}");

        return Task.FromResult(0);
    }
}
```

Looking at this class, aside from a constructor that does nothing, there's a method that prints a message and returns a Task.

The typical approach is to instantiate a `MyDependency` object in a page's `PageModel`. That's the standard way to do it.

```c#
public class IndexModel : PageModel
{
    MyDependency _dependency = new MyDependency();

    public async Task OnGetAsync()
    {
        await _dependency.WriteMessage(
            "IndexModel.OnGetAsync created this message.");
    }
}
```

But this has problems:

1. If you need to modify `MyDependency`, you have to change it directly in the class source code, which is scary. If there are other places using this class, you'd have to change them all — a huge hassle.

2. If `MyDependency` has other dependencies, you have to configure them inside `MyDependency` as well. And if many other classes depend on `MyDependency`, this code ends up scattered all over the place.

3. If you want to test this part in isolation, the current architecture makes it very difficult.

To solve these problems, we use dependency injection. It allows us to:

1. Abstract dependency implementations using interfaces or base classes. Your dependencies are implemented through class inheritance, so if you want to swap a dependency, you just inherit from a different class.

2. Register dependencies in a service container all at once. ASP.NET Core provides a built-in service container `IServiceProvider`, which is registered in the application's `Startup.ConfigureService` method.

3. Inject services into the constructor of the class that uses them. The framework handles creating the dependency objects. When they're no longer needed, the framework handles cleanup.

### How to do dependency injection

Following the dependency injection pattern, when you create your own service (like my `CartManager`), you first write an interface for it, then implement that interface in a class, and finally register it.

Here's how we can implement this:

```c#
public interface IMyDependency
{
    Task WriteMessage(string message);
}
```

This is an interface.

The `WriteMessage` method in this interface is implemented by a `MyDependency` class.

```c#
public class MyDependency : IMyDependency
{
    private readonly ILogger<MyDependency> _logger;

    public MyDependency(ILogger<MyDependency> logger)
    {
        _logger = logger;
    }

    public Task WriteMessage(string message)
    {
        _logger.LogInformation(
            "MyDependency.WriteMessage called. Message: {MESSAGE}", 
            message);

        return Task.FromResult(0);
    }
}
```

Next, you need to register your service in the `Startup.cs` file's service registration:

```c#
public void ConfigureServices(IServiceCollection services)
{
    services.AddRazorPages();

    services.AddScoped<IMyDependency, MyDependency>();//here is your registered service
    
    services.AddTransient<IOperationTransient, Operation>();
    services.AddScoped<IOperationScoped, Operation>();
    services.AddSingleton<IOperationSingleton, Operation>();
    services.AddSingleton<IOperationSingletonInstance>(new Operation(Guid.Empty));

    // OperationService depends on each of the other Operation types.
    services.AddTransient<OperationService, OperationService>();
}
```

The registration function you use depends on the service's lifetime. You can choose from these lifetimes:

* Transient

  Transient lifetime services ([AddTransient](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.extensions.dependencyinjection.servicecollectionserviceextensions.addtransient)) are created each time they're requested from the service container. This lifetime is suitable for lightweight, stateless services.

* Scoped

  Scoped lifetime services ([AddScoped](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.extensions.dependencyinjection.servicecollectionserviceextensions.addscoped)) are created once per client request (connection).

  Note: When using scoped services within middleware, inject the service into the `Invoke` or `InvokeAsync` method. Do not inject through the constructor, as it will force the service to behave like a singleton. This is covered in detail in custom middleware documentation.

* Singleton

  Singleton lifetime services ([AddSingleton](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.extensions.dependencyinjection.servicecollectionserviceextensions.addsingleton)) are created on first request (or when running `Startup.ConfigureServices` and specifying an instance at registration time). Every subsequent request uses the same instance. If your app requires singleton behavior, it's recommended to let the service container manage the service's lifetime. Don't implement the singleton design pattern yourself and manage object lifetime in user code.

  Note: Resolving a scoped service from a singleton is dangerous. It may cause the service to be in an incorrect state when processing subsequent requests.



### Configuring dependency implementations

When your dependency (like `MyDependency`) needs other built-in ASP.NET services, you can pass them directly as parameters since those services are already registered. But if your constructor needs built-in types (like `string`), you can't register a service for `string`. In this case, you can use `Configuration` or `Options` to inject these types:

```c#
public class MyDependency : IMyDependency
{
    public MyDependency(IConfiguration config)
    {
        var myStringValue = config["MyStringKey"];

        // Use myStringValue
    }

    ...
}
```

### All done

Now you can use your own services in your pages just like you use the framework-provided services.

```c#
public class IndexModel : PageModel
{
    private readonly IMyDependency _myDependency;//define a private variable for the service

    public IndexModel(
        IMyDependency myDependency, //accept this variable in the constructor
        OperationService operationService,
        IOperationTransient transientOperation,
        IOperationScoped scopedOperation,
        IOperationSingleton singletonOperation,
        IOperationSingletonInstance singletonInstanceOperation)
    {
        _myDependency = myDependency;//assign it
        OperationService = operationService;
        TransientOperation = transientOperation;
        ScopedOperation = scopedOperation;
        SingletonOperation = singletonOperation;
        SingletonInstanceOperation = singletonInstanceOperation;
    }

    public OperationService OperationService { get; }
    public IOperationTransient TransientOperation { get; }
    public IOperationScoped ScopedOperation { get; }
    public IOperationSingleton SingletonOperation { get; }
    public IOperationSingletonInstance SingletonInstanceOperation { get; }

    public async Task OnGetAsync()
    {
        //happily use the methods provided by this service
        await _myDependency.WriteMessage(
            "IndexModel.OnGetAsync created this message.");
    }
}
```

### Some recommendations

#### How to design a service suitable for dependency injection:

Best practices are:

* Design services to obtain their dependencies using dependency injection.

- Avoid stateful, static classes and members. Design your app to use singleton services instead, which avoids creating global state.
- Avoid directly instantiating dependency classes in your service. Direct instantiation couples the code to a specific implementation.
- Don't put too much into application classes. Keep the design focused and easy to test.



If a class seems to have too many injected dependencies, this usually indicates that the class has too many responsibilities and is violating the [Single Responsibility Principle (SRP)](https://docs.microsoft.com/zh-cn/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles#single-responsibility). Try to refactor the class by moving some responsibilities to a new class. Keep in mind that Razor Pages page model classes and MVC controller classes should focus on user interface concerns. Business rules and data access implementation details should remain in classes dedicated to these [separation of concerns](https://docs.microsoft.com/zh-cn/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles#separation-of-concerns).
