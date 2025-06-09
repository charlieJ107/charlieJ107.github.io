---
title: '从ASP.Net Core启蒙依赖关系注入'
date: 2020/5/6
categories: 
- 学了就忘
tags: 
    - C#
    - ASP.Net Core
    - Micorsoft
description: 事由是想写一个教材征订管理系统, 里面涉及到自行设计的一个购物车的数据模型类`Cart`和一个管理类`CartManager`, 遇到了相关问题, 所以仔细去读了官方的文档, 现在记录如下
---

事由是想写一个教材征订管理系统, 里面涉及到自行设计的一个购物车的数据模型类`Cart`和一个管理类`CartManager`, 遇到了相关问题, 所以仔细去读了官方的文档, 现在记录如下:
<!--more-->

### 概述

#### 1. 依赖项是什么

依赖项 , 是另一个对象所需的任何对象。

比如我的`CartManager`对象, 就需要依赖Cart对象, `ICollection`对象和`BookBill`对象等等.

#### 2. 为什么要做依赖关系注入

在这里, 官方文档举了一个更加简单的例子, 假设有一个被其他类依赖的`MyDependency`类, 其他类需要调用这个类的`WriteMessage`方法:

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

稍微分析一下这个类, 除了一个什么都不做的构造函数之外, 还有一个打印消息的函数, 这个函数返回Task. 

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

接下来, 我们开始在一个页面的`PageModel`实例化一个`Mydependency`对象, 这个是一个常规操作. 

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

但是这样做是有问题的: 

1. 如果你需要修改`MyDependency`, 就必须在类的源代码里卖弄修改, 这个很可怕, 万一你还有别的地方用到了这个类, 那你修改就全改了, 会很麻烦. 

   	2. 如果`Mydependency`具有其他依赖关系, 就必须在`Mydependency`里面进行配置. 然后又有很多类需要依赖于`MyDpendency`,  这就导致这种代码到处都是, 很分散. 
   	3. 如果你想单独测试这个部分, 你会发现现在这个架构很艰难. 

为了解决这些问题, 我们通过依赖关系注入来实现这个类. 它可以做到以下几点:

1. 使用接口或者基类抽象化依赖关系的实现, 你的依赖关系是通过类继承来实现的, 你想换一个依赖, 继承另一个类就可以了.
2. 可以同时注册服务容器中的依赖关系. ASP.NET Core 提供了一个内置服务容器`IServiceProvider`, 这个服务已经在应用的`Startup.ConfigureService`方法中注册. 
3. 将服务注入到使用它的类的构造函数中. 框架负责创建依赖的对象. 如果不再需要这个对象了, 就可以直接由框架进行处理. 

### 如何依赖关系注入

按照依赖关系注入的思想, 当你需要自己做一个服务的时候 (比如我要做的这个`CartManager`), 你需要先写一个这个服务的接口(`interface`), 然后根据这个接口写一个类来实现这个服务, 之后再注册

所以我们可以这样来实现这个框架:

```c#
public interface IMyDependency
{
    Task WriteMessage(string message);
}
```

这是个`interface`, 这个`interface`. 

这个接口里面的`WriteMessage`由一个`MyDependency`这个类的实现. 

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

接下来, 你需要在`Startup.cs`中的服务注册里把你的服务注册进去: 

```c#
public void ConfigureServices(IServiceCollection services)
{
    services.AddRazorPages();

    services.AddScoped<IMyDependency, MyDependency>();//这里是你注册的服务
    
    services.AddTransient<IOperationTransient, Operation>();
    services.AddScoped<IOperationScoped, Operation>();
    services.AddSingleton<IOperationSingleton, Operation>();
    services.AddSingleton<IOperationSingletonInstance>(new Operation(Guid.Empty));

    // OperationService depends on each of the other Operation types.
    services.AddTransient<OperationService, OperationService>();
}
```

使用的注册函数根据你这个服务的生存期不同, 可以选择以下几种生存期

* 暂时

  暂时生存期服务 ([AddTransient](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.extensions.dependencyinjection.servicecollectionserviceextensions.addtransient)) 是每次从服务容器进行请求时创建的。 这种生存期适合轻量级、 无状态的服务。

* 范围内

  作用域生存期服务 ([AddScoped](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.extensions.dependencyinjection.servicecollectionserviceextensions.addscoped)) 以每个客户端请求（连接）一次的方式创建。

  注意: 在中间件内使用有作用域的服务时，请将该服务注入至 `Invoke` 或 `InvokeAsync` 方法。 请不要通过构造函数注入进行注入，因为它会强制服务的行为与单一实例类似。 这个在自定义中间件中会有专门的说明. 

* 单例

  单一实例生存期服务 ([AddSingleton](https://docs.microsoft.com/zh-cn/dotnet/api/microsoft.extensions.dependencyinjection.servicecollectionserviceextensions.addsingleton)) 是在第一次请求时（或者在运行 `Startup.ConfigureServices` 并且使用服务注册指定实例时）创建的。 每个后续请求都使用相同的实例。 如果应用需要单一实例行为，建议允许服务容器管理服务的生存期。 不要实现单一实例设计模式并提供用户代码来管理对象在类中的生存期。

  注意: 从单一实例解析有作用域的服务很危险。 当处理后续请求时，它可能会导致服务处于不正确的状态。



### 依赖实现的配置

当你的依赖(比如`MyDependency`) 需要ASP.Net内置的其他服务时, 可以直接用传参的方式传进来 因为其他的服务已经被注册过了. 但是如果你的构造函数需要内置类型(比如`string`), 你就没办法给`string`做服务注册. 这个时候你可以通过`Configuration`或者`Options`来注入这些类型: 

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

### 大功告成

你终于可以在页面中像使用其他框架提供的服务一样使用自己的服务了. 

```c#
public class IndexModel : PageModel
{
    private readonly IMyDependency _myDependency;//定义一个服务的私有变量

    public IndexModel(
        IMyDependency myDependency, //构造函数中接受这个变量
        OperationService operationService,
        IOperationTransient transientOperation,
        IOperationScoped scopedOperation,
        IOperationSingleton singletonOperation,
        IOperationSingletonInstance singletonInstanceOperation)
    {
        _myDependency = myDependency;//赋值
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
        //愉快地使用这个服务提供的方法
        await _myDependency.WriteMessage(
            "IndexModel.OnGetAsync created this message.");
    }
}
```

### 一些建议

#### 如何从创建一个适合依赖关系注入的服务:

最佳做法是：

* 设计服务以使用依赖关系注入来获取其依赖关系。

- 避免有状态的、静态类和成员。 将应用设计为改用单一实例服务，可避免创建全局状态。
- 避免在服务中直接实例化依赖类。 直接实例化将代码耦合到特定实现。
- 不在应用类中包含过多内容，确保设计规范，并易于测试。



如果一个类似乎有过多的注入依赖关系，这通常表明该类拥有过多的责任并且违反了[单一责任原则 (SRP)](https://docs.microsoft.com/zh-cn/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles#single-responsibility)。 尝试通过将某些职责移动到一个新类来重构类。 请记住，Razor Pages 页模型类和 MVC 控制器类应关注用户界面问题。 业务规则和数据访问实现细节应保留在适用于这些[分离的关注点](https://docs.microsoft.com/zh-cn/dotnet/standard/modern-web-apps-azure-architecture/architectural-principles#separation-of-concerns)的类中。