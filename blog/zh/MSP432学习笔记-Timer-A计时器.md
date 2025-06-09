---
title: MSP432学习笔记-Timer A计时器
date: 2020-12-20
category: 学了就忘
tags:
    - C
    - MSP432
description: 定时器的本质其实就是一个寄存器在时钟脉冲下周期性地进行增减.
---
<!--more-->
### 定时器概述

定时器的本质其实就是一个**寄存器在时钟脉冲下周期性地进行增减**.

MSP432上定时器有这么几个资源

- 看门狗
- 实时时钟`RTC_C`
- `SysTick`
- Timer A（16位）
- Timer 32（32位）

其中，Timer A和Timer 32都是通用定时器，而其他的都属于特殊功能的定时器。

### Timer A定时器

包括四个时钟源： `TAxCLK`, `ACLK`,, `SMCLK`, `INCLK`, 两个分频单元`ID`, `IDEX`,然后有一个16位的计时器`Timer`, 符号是`TAxR`. 一旦溢出就会向`TAxCTL`的`TAIFG`这个寄存器写入一个值，这个时候CPU就可以捕捉这个值来进行控制。

这个时候通过MC控制位可以控制Timer A的计数模式

- 连续计数：一直计数到溢出，然后一直计数到归零，再一直计数到溢出
- 向上模式：计数到CCR[0]中断触发，然后清零，再计数到CCR[0]
- 向上/向下模式：计数到CCR[0]中断触发，然后递减计数到0，再计数到CCR[0]
- 暂停

#### 连续计数模式

其实就是一路计数到溢出, 然后翻转成0, 从0从新开始. 

另外, 反转的时候会给`TAxCTL TAIFG`这个中断标志位置1. 

程序`ta0_03`这个程序是用Timer A来实现LED的闪烁. 这个闪烁实现的是用Timer A的定时实现的, 每次溢出来实现一次闪烁. 

首先, 整个程序分为两个部分, 一个是主程序, 主程序的任务其实就是配置初始化. 

标准操作, 关`WDT`,设置GPIO输出, 初始化高电平. 

```
WDT_A->CTL = WDT_A_CTL_PW |             // Stop WDT
        WDT_A_CTL_HOLD;

// Configure GPIO
P1->DIR |= BIT0;
P1->OUT |= BIT0;
```

然后的动作就是配置定时器,  启用中断系统. 然后就可以休眠了

```
// Configure Timer_A
   TIMER_A0->CTL = TIMER_A_CTL_SSEL__SMCLK |  // SMCLK
           TIMER_A_CTL_MC_2 |              // Continuous mode
           TIMER_A_CTL_CLR |               // Clear TAR
           TIMER_A_CTL_ID_3 |              // CLKDIV
           TIMER_A_CTL_IE ;                 // Enable overflow interrupt
	SCB->SCR |= SCB_SCR_SLEEPONEXIT_Msk;    // Enable sleep on exit from ISR

   // Ensures SLEEPONEXIT takes effect immediately
   __DSB();

   // Enable global interrupt
   __enable_irq();

   NVIC->ISER[0] = 1 << ((TA0_N_IRQn) & 31);

   __sleep();

   __no_operation();                       // For debugger
```

这其中, 首先设置的是时钟源

```

TIMER_A0->CTL = TIMER_A_CTL_SSEL__SMCLK |  // SMCLK
```

再下来一个是选择分频系数

```

IMER_A_CTL_ID_3 |              // CLKDIV
```

然后则是`MC`寄存器来决定工作模式, 这个工作模式有这么几种情况, 包括停止模式(`stop`, `00`), 上升模式(`up`, `01`) , 连续模式(`contiuouse`, `10`)和上升/下降模式(`up/down`, `11`). 

然后就是清空`TAR`, 这个`TAR`就是Timer A的寄存器, 一共16位,  也就是0-65535. 溢出的时候就触发一次中断. 使能中断`TAIE`, 给中断标志位预置数`TAIFG`..

这里有一个操作

```
SCB->SCR |= SCB_SCR_SLEEPONEXIT_Msk;    // Enable sleep on exit from ISR

   // Ensures SLEEPONEXIT takes effect immediately
   __DSB();
```

这个操作可以保证CPU响应中断之后重新进入休眠模式. 

接下来要考虑的是中断服务函数. 中断服务函数的任务也很简单, 因为只需要闪烁, 所以反转LED的输出电平就可以了. 

```
void TA0_N_IRQHandler(void)
{
    TIMER_A0->CTL &= ~TIMER_A_CTL_IFG;      // Clear timer overflow interrupt flag
    P1->OUT ^= BIT0;                        // Toggle P1.0 LED
}
```

### 其他工作模式与CCR寄存器

​    之所以要引入CCR寄存器, 是因为CCR寄存器具备这样几个特征:

- 可以设置为0-最大值的任意数值
- 不会干扰`TAR`, 也就是Timer A的本身寄存器的溢出的过程
- 可以用`TAR`计数跟他比较, 等于它的时候可以发出一个中断

CCR总共有7个, CCR0到CCR6. 有一个比较器, 只要`TAR`跟`CCR`相同的时候就可以触发一个中断. 

这里的例子是官方例子的`ta0_01`. 这个例子是用CCR寄存器控制led灯闪烁的频率. 

具体的思路其实是, 设定一个CCR初始值. CCR的作用是比较一个值, 一旦比较相同, 则触发中断. 

主函数的设定跟之前差不多, 最大的区别是增加了CCR寄存器的判断. 比较捕获寄存器`CCR[0]`寄存器的控制在`TIMER_A0->CCTL[0]`这个控制寄存器里. 通过这个寄存器使能中断, 并给`CCR[0]`设定初始值, 所以有了这样的语句:

```

TIMER_A0->CCTL[0] = TIMER_A_CCTLN_CCIE; // TACCR0 interrupt enabled
TIMER_A0->CCR[0] = 50000;
```

接下来则是通用的给Timer A设置时钟源和工作模式, 使能中断, 然后就可以休眠了. 整个主函数的内容如下: 

```

int main(void) {
    WDT_A->CTL = WDT_A_CTL_PW |             // Stop WDT
            WDT_A_CTL_HOLD;

    // Configure GPIO
    P1->DIR |= BIT0;
    P1->OUT |= BIT0;

    TIMER_A0->CCTL[0] = TIMER_A_CCTLN_CCIE; // TACCR0 interrupt enabled
    TIMER_A0->CCR[0] = 50000;
    TIMER_A0->CTL = TIMER_A_CTL_SSEL__SMCLK | // SMCLK, continuous mode
            TIMER_A_CTL_MC__CONTINUOUS;

    SCB->SCR |= SCB_SCR_SLEEPONEXIT_Msk;    // Enable sleep on exit from ISR

    // Ensures SLEEPONEXIT takes effect immediately
    __DSB();

    // Enable global interrupt
    __enable_irq();

    NVIC->ISER[0] = 1 << ((TA0_0_IRQn) & 31);

    while (1)
    {
        __sleep();

        __no_operation();                   // For debugger
    }
}
```

对于中断服务函数, 中断服务函数是在`TAR`与`CCR[0]`的寄存器比较后发现相同的时候触发. 这个时候要做的事情除了清零中断标志位, 翻转LED外, 还要给`CCR[0]`寄存器重新赋值. 这个赋值我们这样考虑: `CCR[0]`寄存器总共有16位, 跟`TAR`一致. 最大是65535. 因为我们最开始设定未50000, 那么最后如果这个再网上加15536个数, 就会变成0. 对于`ta0_01`这个例程中, 它的中断服务函数是直接加上50000, 那这个时候`CCR[0]`就会变成65535-5000=15535. 然后再从下次再捕获到`TAR`记录到15536的时候就会再次触发中断, 然后再加上50000就会回到0, 再从0记起到50000, +50000变成15535…

```

// Timer A0 interrupt service routine

void TA0_0_IRQHandler(void) {
    TIMER_A0->CCTL[0] &= ~TIMER_A_CCTLN_CCIFG;
    P1->OUT ^= BIT0;
    TIMER_A0->CCR[0] += 50000;              // Add Offset to TACCR0
}
```

这里注意, `CCR[0]`的中断触发出来的中断向量是`TA0_0`, 中断服务函数的名称是`TA0_0_IRQHandler`, 而其他的`CCR[1]-CCR[6]`都共用同一个中断向量`TA0_N`, 中断服务函数名称是`TA0_N_IRQHandler`. 这就带来了一个问题, 就是这个中断函数被触发的时候, 你是不知道到底是哪个中断标志位引起的中断. 所以你需要逐个判断中断标志位, 然后再进行清零, 之后再接着进行你想做的事. 

```

void TA0_N_IRQHandler(void)
{
	if (TIMER_A0->CCTL[1] & TIMER_A_CCTLN_CCIFG)
    {
        TIMER_A0->CCTL[1] &= ~TIMER_A_CCTLN_CCIFG;
    }
    if (TIMER_A0->CCTL[2] & TIMER_A_CCTLN_CCIFG)
    {
        TIMER_A0->CCTL[2] &= ~TIMER_A_CCTLN_CCIFG;
    }
}
```

### Timer A 结合 CCR【0】的工作模式

Timer A总共有四种工作模式，其中，向上，向上/向下都是需要CCR[0]寄存器来配合的。

### Timer A 的输入捕获功能

![image-20201123160813978](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Typora-auto/image-20201123160813978.png)

首先有个CCIS来选择捕获源，捕获源可以选择的有：

- CCI6A
- CCI6B
- GND
- VCC

然后选择捕获模式，也就是CM寄存器：上边沿，下边沿，或者上下边沿都捕获

接下来选择时间同步模式，因为你想捕获的信号跟时钟信号有时候是不同步的，这个时候你需要一个东西来选择是否同步。 这个控制位是`SCS`. 如果你想读取同步过的信号,就读`SCCI`这个寄存器的值, 如果你不关心是否同步, 就读取`CCI`这个寄存器的值. 

如果一切顺利, 单片机正常捕获, 就会将捕获信号存储在 CCR 寄存器里面. 

有这么一种特殊情况, 如果CCR捕获之后还没来得及处理, 下一次捕获就又发生了, 这个时候CCR寄存器内捕获的内容会被冲刷掉, 但是会有一个标志位`COV`你可以读取到这个情况的发生. 

### 利用定时器输出PWM

定时器输出PWM的关键在于, 在一定时间内调整GPIO口的翻转, 说白了就是用CCR.

首先有一个周期计数器, 实现一个周期的确定, 通常用CCR0;

然后你需要有一个计时器来控制PWM的占空比, 所以需要一个高电平的计数器, 通常是其他的CCR, 比如CCR2

### 实例: 利用Timer A的CCR和中断实现呼吸灯

```

/**
 * 呼吸灯
 */ 
#include "msp.h"
#define RATIO_STEP 0.01
#define MAX_PERCENT 0.9
#define MIN_PERCENT 0.01
#define MAXVALUE CCR0VALUE *MAX_PERCENT
#define MINVALUE CCR0VALUE *MIN_PERCENT
int step;
volatile int count = 0;
volatile int flag = 1;
unsigned int flag1 = 0;
unsigned int flag2 = 0;
int main(void)
{
        WDT_A->CTL = WDT_A_CTL_PW | // Stop WDT
                     WDT_A_CTL_HOLD;

        // Configure GPIO
        P6->DIR |= BIT6 | BIT7; // P6.6~7 set TA1.1~2
        P6->SEL0 |= BIT6 | BIT7;
        P6->SEL1 &= ~(BIT6 | BIT7);

        TIMER_A2->CCR[0] = 5000; // CCR0用来控制一整个呼吸灯的周期
        //CCR3用来控制变亮的这个半周期
        TIMER_A2->CCTL[3] = TIMER_A_CCTLN_OUTMOD_7; // CCR3 reset/set
        TIMER_A2->CCR[3] = 5000;                    // CCR3 PWM duty cycle
        //CCR4用来控制变暗的这个半周期
        TIMER_A2->CCTL[4] = TIMER_A_CCTLN_OUTMOD_7; // CCR4 reset/set
        TIMER_A2->CCR[4] = 0;                       // CCR4 PWM duty cycle

        TIMER_A2->CTL = TIMER_A_CTL_SSEL__SMCLK | TIMER_A_CTL_MC__UP | // Up mode 
                        TIMER_A_CTL_CLR;                               // Clear
        //如果CCR0溢出, 则会触发CCR Interrupt Flag
        //给CCR[0]的 Interrupt Flag 清零
        TIMER_A2->CCTL[0] &= ~TIMER_A_CCTLN_CCIFG;
        //CCR中断Enable
        TIMER_A2->CCTL[0] = TIMER_A_CCTLN_CCIE;

        SCB->SCR |= SCB_SCR_SLEEPONEXIT_Msk;
        __DSB();
        __enable_irq();
        NVIC->ISER[0] = 1 << ((TA2_0_IRQn)&31);
        // Enter LPM0
        while (1)
        {
                __sleep();
                __no_operation(); // For debugger
        }
}

//CCR0溢出, 触发的中断服务函数
void TA2_0_IRQHandler(void)
{
        //先清零中断向量寄存器
        TIMER_A2->CCTL[0] &= ~TIMER_A_CCTLN_CCIFG;

        //如果CCR3
        if (TIMER_A2->CCR[3] >= 4800)
        {
                flag1 = 1;
        }
        else if (TIMER_A2->CCR[3] <= 100)
        {
                flag1 = 0;
        }
        //flag1说明CCR3是否处在高位
        if (flag1)
        {
                TIMER_A2->CCR[3] -= 5;
        }
        else
        {
                //CCR3处在低位
                TIMER_A2->CCR[3] += 5;
        }

        if (TIMER_A2->CCR[4] >= 4800)
        {
                flag2 = 1;
        }
        else if (TIMER_A2->CCR[4] <= 100)
        {
                flag2 = 0;
        }

        if (flag2)
        {
                //CCR4 >= 4800
                TIMER_A2->CCR[4] -= 5;
        }
        else
        {
                //CCR4 <= 100
                TIMER_A2->CCR[4] += 5;
        }
}
```

### 总结

在这里总结一下跟定时器有关的程序设计基本流程

- 定时器一般是要配合其他东西进行操作的, 比如GPIO啥的, 所以你肯定要先配置各种GPIO之类的其他东西
- 接下来你可能需要给定时器设置一个工作模式

```
TIMER_A2->CCTL[3] = TIMER_A_CCTLN_OUTMOD_7; // CCR3 reset/set
```

![image-20201214195838263](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Typora-auto/image-20201214195838263.png)

然后你需要先给定时器设定一个初值, 语句如下:

```

TIMER_A2->CCR[0] = 5000; // CCR0用来控制一整个呼吸灯的周期
```

设置整个Timer_A的工作模式

```

TIMER_A2->CTL = TIMER_A_CTL_SSEL__SMCLK | TIMER_A_CTL_MC__UP | // Up mode 
                       TIMER_A_CTL_CLR;                               // Clear
```

![image-20201214195812209](https://data-vankyle-1257862518.cos.ap-shanghai.myqcloud.com/image/Typora-auto/image-20201214195812209.png)

使能CCR中断

```

//给CCR[0]的 Interrupt Flag 清零
TIMER_A2->CCTL[0] &= ~TIMER_A_CCTLN_CCIFG;
//CCR中断Enable
TIMER_A2->CCTL[0] = TIMER_A_CCTLN_CCIE;
```

CCIE这个寄存器的数据表已经在上面了

其他全局中断的使能

```

SCB->SCR |= SCB_SCR_SLEEPONEXIT_Msk;
   __DSB();
   __enable_irq();
   NVIC->ISER[0] = 1 << ((TA2_0_IRQn)&31);
```

注意NVIC的地方, 需要把中断向量名填进去, CCR0用的是`TA2_0_IRQn`, 其他的是`TA2_N_IRQn`

中断服务函数（以呼吸灯为例）

中断什么时候被触发？

当Timer_A跟CCR计时器里的值一样的时候
