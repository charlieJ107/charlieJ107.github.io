---
draft: false
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

捕获也好、比较也好、输出 PWM 也好, 配置项全都挤在同一个 16 位寄存器 `TAxCCTLn` 里 (每个 CCR 各有一个, 代码里就是 `TIMER_Ax->CCTL[n]`). 先把它的位域摆出来, 后面几节要用到的位全在这张表里:

**TAxCCTLn —— 捕获/比较控制寄存器**

| 位 | 字段 | 含义 | 取值 |
| --- | --- | --- | --- |
| 15-14 | **CM** | 捕获模式 (捕获哪种边沿) | `00` 不捕获 / `01` 上升沿 / `10` 下降沿 / `11` 双边沿 |
| 13-12 | **CCIS** | 捕获源选择 | `00` CCInA / `01` CCInB / `10` GND / `11` VCC |
| 11 | **SCS** | 捕获信号是否与定时器时钟同步 | `0` 异步 / `1` 同步 |
| 10 | **SCCI** | 只读。比较相等时锁存下来的、同步后的输入电平 | — |
| 9 | — | 保留 | — |
| 8 | **CAP** | 工作模式 | `0` 比较模式 / `1` 捕获模式 |
| 7-5 | **OUTMOD** | 输出模式，见下文 PWM 一节 | `000`–`111` |
| 4 | **CCIE** | 该 CCR 的中断使能 | `0` 关 / `1` 开 |
| 3 | **CCI** | 只读。当前输入信号的电平 | — |
| 2 | **OUT** | OUTMOD=`000` 时直接决定输出引脚电平 | `0` 低 / `1` 高 |
| 1 | **COV** | 捕获溢出标志 | `1` 表示上一次捕获还没读走就又来了一次 |
| 0 | **CCIFG** | 中断标志 | 置位后**需要软件清零** |

> 数据来自 TI 官方 CMSIS 头文件 `msp432p401r.h` 中的 `TIMER_A_CCTLN_*` 宏定义, 与 SLAU356《MSP432P4xx Technical Reference Manual》Timer_A 章节一致。宏的命名规律是 `TIMER_A_CCTLN_<字段>_<取值>`, 例如 `TIMER_A_CCTLN_CM_1` 就是"上升沿捕获"(`0x4000`)。

对着这张表, 捕获的配置顺序就很清楚了:

首先是 **CAP** 位——**要做捕获必须把它置 1**, 默认的 `0` 是比较模式, 这一步漏掉的话后面配什么都没用。

然后是 **CCIS**, 选择捕获源。可选的有 `CCInA`、`CCInB`、`GND`、`VCC` 四个 (这里的 n 是 CCR 的编号, 比如 CCR2 对应的就是 CCI2A / CCI2B)。选 GND 和 VCC 看着奇怪, 但它可以用来在软件里手动制造一次捕获事件——把 CCIS 在 GND 和 VCC 之间切换, 就相当于给捕获电路送了一个边沿。

接下来是 **CM**, 决定捕获哪种边沿: 上升沿、下降沿, 或者两个都要。测脉宽就用双边沿, 测周期用单边沿即可。

再接下来是同步模式。你想捕获的信号跟定时器时钟通常是**不同步**的, 直接采可能会采到亚稳态, 所以 **SCS** 置 1 让捕获与时钟同步是推荐做法。相应地, 如果你想读同步过的电平就读 **SCCI**, 不关心同步就读 **CCI**。

如果一切顺利, 捕获发生时 TAxR 的当前值会被存进 `CCR[n]`, 同时 **CCIFG** 置位。

还有一种特殊情况: 如果 CCR 捕获之后还没来得及读走, 下一次捕获就又发生了, 那么 CCR 里的旧值会被冲掉。这时 **COV** 会置位, 你可以读到这个情况的发生。注意 **COV 不会自动清零, 必须软件清**, 否则后面就一直是 1 了。

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

这里的 `OUTMOD` 就是 `TAxCCTLn` 的第 7-5 位, 一共 8 种输出模式:

**OUTMOD（TAxCCTLn 位 7-5）**

| OUTMOD | 宏 | 模式 | 行为 |
| --- | --- | --- | --- |
| `000` | `TIMER_A_CCTLN_OUTMOD_0` | Output | 输出直接等于 `OUT` 位, 相当于软件直接控制引脚 |
| `001` | `TIMER_A_CCTLN_OUTMOD_1` | Set | 计到 CCRn 时置 1, 然后一直保持 |
| `010` | `TIMER_A_CCTLN_OUTMOD_2` | Toggle/Reset | 计到 CCRn 时翻转, 计到 CCR0 时清零 |
| `011` | `TIMER_A_CCTLN_OUTMOD_3` | Set/Reset | 计到 CCRn 时置 1, 计到 CCR0 时清零 |
| `100` | `TIMER_A_CCTLN_OUTMOD_4` | Toggle | 计到 CCRn 时翻转 |
| `101` | `TIMER_A_CCTLN_OUTMOD_5` | Reset | 计到 CCRn 时清零, 然后一直保持 |
| `110` | `TIMER_A_CCTLN_OUTMOD_6` | Toggle/Set | 计到 CCRn 时翻转, 计到 CCR0 时置 1 |
| `111` | `TIMER_A_CCTLN_OUTMOD_7` | Reset/Set | 计到 CCRn 时清零, 计到 CCR0 时置 1 |

关于这张表有两点要特别注意:

- **模式 2、3、6、7 用在 `CCTL[0]` 上是没有意义的**。因为它们的行为同时依赖"计到 CCRn"和"计到 CCR0"两个事件, 而当 n = 0 时这俩是同一个事件, 结果就是输出不会按预期变化。所以 CCR0 通常只用来定周期, PWM 的占空比交给 CCR1–CCR6。
- **向上模式下, OUTMOD_7 是做 PWM 最顺手的一个**: CCR0 定周期, CCRn 定占空比, 输出在计到 CCRn 时拉低、计到 CCR0 (即新周期开始) 时拉高, 于是

  $$
  \text{占空比} = 1 - \frac{\mathrm{CCR}n}{\mathrm{CCR}0 + 1}
  $$

  想要"CCRn 越大越亮"的直觉方向, 用 OUTMOD_3 (Set/Reset) 即可。

然后你需要先给定时器设定一个初值, 语句如下:

```

TIMER_A2->CCR[0] = 5000; // CCR0用来控制一整个呼吸灯的周期
```

设置整个Timer_A的工作模式

```

TIMER_A2->CTL = TIMER_A_CTL_SSEL__SMCLK | TIMER_A_CTL_MC__UP | // Up mode 
                       TIMER_A_CTL_CLR;                               // Clear
```

整个 Timer_A 的模式由 `TAxCTL` 这个 16 位寄存器决定:

**TAxCTL —— Timer_A 控制寄存器**

| 位 | 字段 | 含义 | 取值 |
| --- | --- | --- | --- |
| 15-10 | — | 保留 | — |
| 9-8 | **TASSEL** | 时钟源选择 | `00` TAxCLK / `01` ACLK / `10` SMCLK / `11` INCLK |
| 7-6 | **ID** | 输入分频 | `00` /1 / `01` /2 / `10` /4 / `11` /8 |
| 5-4 | **MC** | 计数模式 | `00` 停止 / `01` 向上 (数到 CCR0) / `10` 连续 (数到 0FFFFh) / `11` 上下 (数到 CCR0 再数回 0) |
| 3 | — | 保留 | — |
| 2 | **TACLR** | 写 1 清零 TAxR、分频器和计数方向；**该位会自动归零** | — |
| 1 | **TAIE** | 定时器溢出中断使能 | `0` 关 / `1` 开 |
| 0 | **TAIFG** | 定时器溢出中断标志 | 需软件清零 |

对应的宏是 `TIMER_A_CTL_*`。注意 TI 的头文件给同一个字段提供了两套写法: 带单下划线的按序号 (`TIMER_A_CTL_TASSEL_2`)、带双下划线的按语义 (`TIMER_A_CTL_SSEL__SMCLK`), 两者数值相同, 后者可读性更好, 推荐用后者。

拿上面那行代码验算一下:

```text
TIMER_A_CTL_SSEL__SMCLK   = 0x0200   →  TASSEL = 10, 时钟源选 SMCLK
TIMER_A_CTL_MC__UP        = 0x0010   →  MC     = 01, 向上计数到 CCR0
TIMER_A_CTL_CLR           = 0x0004   →  TACLR  =  1, 立刻把计数器清零
                          ─────────
                   TAxCTL = 0x0214
```

注意这里用的是 `=` 而不是 `|=`, 所以 `TAIE` 被一并写成了 0——本例靠 CCR0 的中断工作, 不需要定时器溢出中断, 这样写没问题。但如果你是在已有配置上追加, 记得用 `|=`。

另外, ID 最多只能分频到 /8。如果还不够慢, 还有一个 `TAxEX0` 寄存器的 `IDEX` 字段 (位 2-0) 可以再分 1–8 倍, 两级串起来最多 /64:

```c
TIMER_A2->EX0 = TIMER_A_EX0_IDEX__8;   // 与 ID 串联, 总分频可达 8 × 8 = 64
```

使能CCR中断

```

//给CCR[0]的 Interrupt Flag 清零
TIMER_A2->CCTL[0] &= ~TIMER_A_CCTLN_CCIFG;
//CCR中断Enable
TIMER_A2->CCTL[0] = TIMER_A_CCTLN_CCIE;
```

`CCIE` 和 `CCIFG` 都是 `TAxCCTLn` 里的位, 位置见前面那张 TAxCCTLn 位域表。

这两行其实有点小问题: 第二行用的是 `=` 而不是 `|=`, 会把整个 `CCTL[0]` 覆盖掉——包括第一行刚清完的 `CCIFG`。也就是说第一行是白写的。正确的写法应该是:

```c
TIMER_A2->CCTL[0] &= ~TIMER_A_CCTLN_CCIFG;   // 清中断标志
TIMER_A2->CCTL[0] |=  TIMER_A_CCTLN_CCIE;    // 使能中断, 保留其他位
```

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

### 参考

- TI. *MSP432P4xx Microcontrollers Technical Reference Manual* (SLAU356), Chapter: Timer_A. <https://www.ti.com/lit/ug/slau356i/slau356i.pdf>
- TI. *MSP432P401R Datasheet* (SLAS826). <https://www.ti.com/lit/ds/symlink/msp432p401r.pdf>
- 本文位域表中的字段位置与取值取自 TI 官方 CMSIS 头文件 `msp432p401r.h` 里的 `TIMER_A_CTL_*`、`TIMER_A_CCTLN_*`、`TIMER_A_EX0_*` 宏定义
