---
draft: false
title: "MSP432 Notes - Timer A"
date: 2020-12-20
category: Learning Notes
tags:
    - C
    - MSP432
description: "At its core, a timer is just a register that increments or decrements periodically under clock pulses."
---
<!--more-->

### Timer Overview

At its core, a timer is just a **register that increments or decrements periodically under clock pulses**.

The MSP432 has several timer resources:

- Watchdog timer
- Real-time clock `RTC_C`
- `SysTick`
- Timer A (16-bit)
- Timer 32 (32-bit)

Among these, Timer A and Timer 32 are general-purpose timers, while the others are special-purpose timers.

### Timer A

Timer A includes four clock sources: `TAxCLK`, `ACLK`, `SMCLK`, `INCLK`, two divider units `ID`, `IDEX`, and a 16-bit counter `Timer` (symbol: `TAxR`). When it overflows, a value is written to the `TAIFG` register in `TAxCTL`, allowing the CPU to capture and handle this value for control.

The MC control bits determine Timer A's counting mode:

- Continuous counting: counts up to overflow, wraps to zero, counts up to overflow again
- Up mode: counts to CCR[0] to trigger an interrupt, then clears and counts to CCR[0] again
- Up/down mode: counts to CCR[0] to trigger an interrupt, then counts down to 0, then counts to CCR[0] again
- Stop

#### Continuous Counting Mode

This mode simply counts up to overflow, then wraps back to 0 and starts again.

When wrapping around, the `TAxCTL TAIFG` interrupt flag is set to 1.

The example program `ta0_03` implements LED blinking using Timer A. The blinking is timed by Timer A, with each overflow triggering a blink.

First, the program is divided into two parts: the main program and the ISR. The main program's job is initialization and configuration.

Standard setup: stop the WDT, configure GPIO for output, initialize to high level.

```
WDT_A->CTL = WDT_A_CTL_PW |             // Stop WDT
        WDT_A_CTL_HOLD;

// Configure GPIO
P1->DIR |= BIT0;
P1->OUT |= BIT0;
```

Then configure the timer, enable the interrupt system, and go to sleep:

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

First, set the clock source:

```

TIMER_A0->CTL = TIMER_A_CTL_SSEL__SMCLK |  // SMCLK
```

Next, select the frequency divider:

```

TIMER_A_CTL_ID_3 |              // CLKDIV
```

Then use the `MC` register to set the operating mode, which has several options: stop mode (`00`), up mode (`01`), continuous mode (`10`), and up/down mode (`11`).

Then clear `TAR`. This is Timer A's counter register, 16 bits total (0-65535). An interrupt triggers on overflow. Enable the interrupt with `TAIE` and preset the interrupt flag `TAIFG`.

There's one operation to note:

```
SCB->SCR |= SCB_SCR_SLEEPONEXIT_Msk;    // Enable sleep on exit from ISR

   // Ensures SLEEPONEXIT takes effect immediately
   __DSB();
```

This ensures the CPU re-enters sleep mode after handling an interrupt.

Next, consider the interrupt service routine. The ISR's job is simple: just toggle the LED output level to create blinking.

```
void TA0_N_IRQHandler(void)
{
    TIMER_A0->CTL &= ~TIMER_A_CTL_IFG;      // Clear timer overflow interrupt flag
    P1->OUT ^= BIT0;                        // Toggle P1.0 LED
}
```

### Other Operating Modes and CCR Registers

The reason for introducing the CCR register is that it has these characteristics:

- Can be set to any value from 0 to the maximum
- Doesn't interfere with `TAR` (Timer A's overflow)
- Can compare with `TAR`, and when they match, generate an interrupt

There are 7 CCR registers total: CCR0 through CCR6. With a comparator, whenever `TAR` matches a `CCR`, it triggers an interrupt.

The example here is the official `ta0_01`. This demonstrates using the CCR register to control LED blinking frequency.

The basic idea is to set an initial CCR value. The CCR acts as a comparator—when it matches the counter value, an interrupt fires.

The main function is similar to before, with the key addition of CCR register checks. The capture-compare control register `CCR[0]` is controlled via `TIMER_A0->CCTL[0]`. This register enables the interrupt and sets the initial value for `CCR[0]`:

```

TIMER_A0->CCTL[0] = TIMER_A_CCTLN_CCIE; // TACCR0 interrupt enabled
TIMER_A0->CCR[0] = 50000;
```

Then set the Timer A clock source and operating mode, enable interrupts, and sleep. Here's the complete main function:

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

The interrupt service routine fires when `TAR` matches `CCR[0]`. Besides clearing the interrupt flag and toggling the LED, we must reload `CCR[0]`. Here's the logic: `CCR[0]` has 16 bits like `TAR`, maximum 65535. Since we initially set it to 50000, adding another 15535 wraps to 0. In the `ta0_01` example, the ISR directly adds 50000, so `CCR[0]` becomes 65535 - 50000 = 15535. The next time `TAR` reaches 15536, the interrupt fires again and adds 50000, wrapping back to 0. Then it counts from 0 to 50000, adds 50000 to become 15535 again, and so on.

```

// Timer A0 interrupt service routine

void TA0_0_IRQHandler(void) {
    TIMER_A0->CCTL[0] &= ~TIMER_A_CCTLN_CCIFG;
    P1->OUT ^= BIT0;
    TIMER_A0->CCR[0] += 50000;              // Add Offset to TACCR0
}
```

Note: the `CCR[0]` interrupt uses the vector `TA0_0` and the ISR name is `TA0_0_IRQHandler`, while `CCR[1]-CCR[6]` all share the vector `TA0_N` and ISR name `TA0_N_IRQHandler`. This creates a problem: when the ISR fires, you don't know which interrupt flag caused it. So you need to check each flag individually, clear it, then proceed with your logic.

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

### Timer A Operating Modes with CCR[0]

Timer A has four operating modes. The up mode and up/down mode both require CCR[0] to work properly.

### Input Capture Function of Timer A

Whether capturing, comparing, or outputting PWM, all configuration bits fit into a single 16-bit register `TAxCCTLn` (each CCR has one, accessed as `TIMER_Ax->CCTL[n]` in code). Here's the bit field table; the bits used in following sections are all here:

**TAxCCTLn — Capture/Compare Control Register**

| Bits | Field | Meaning | Values |
| --- | --- | --- | --- |
| 15-14 | **CM** | Capture mode (which edge to capture) | `00` disable / `01` rising edge / `10` falling edge / `11` both edges |
| 13-12 | **CCIS** | Capture source selection | `00` CCInA / `01` CCInB / `10` GND / `11` VCC |
| 11 | **SCS** | Whether capture signal is synchronized with timer clock | `0` asynchronous / `1` synchronous |
| 10 | **SCCI** | Read-only. Latched, synchronized input level when compare matches | — |
| 9 | — | Reserved | — |
| 8 | **CAP** | Operating mode | `0` compare mode / `1` capture mode |
| 7-5 | **OUTMOD** | Output mode (see PWM section below) | `000`–`111` |
| 4 | **CCIE** | Interrupt enable for this CCR | `0` disabled / `1` enabled |
| 3 | **CCI** | Read-only. Current input signal level | — |
| 2 | **OUT** | Output pin level when OUTMOD=`000` | `0` low / `1` high |
| 1 | **COV** | Capture overflow flag | `1` means previous capture not yet read when new capture arrived |
| 0 | **CCIFG** | Interrupt flag | Must be **cleared by software** after being set |

> Data from TI's official CMSIS header `msp432p401r.h` `TIMER_A_CCTLN_*` macros, consistent with SLAU356《MSP432P4xx Technical Reference Manual》Timer_A chapter. Macro naming follows `TIMER_A_CCTLN_<field>_<value>`, e.g. `TIMER_A_CCTLN_CM_1` is "rising edge capture" (`0x4000`).

With this table in mind, the capture configuration sequence is clear:

First, the **CAP** bit — **to capture, you must set this to 1**. The default `0` is compare mode; skipping this step means everything else is wasted.

Next is **CCIS**, selecting the capture source. Options are `CCInA`, `CCInB`, `GND`, `VCC` (where n is the CCR number; CCR2 uses CCI2A/CCI2B). Using GND and VCC seems odd, but it lets you generate a capture event in software—toggle CCIS between GND and VCC to send an edge to the capture circuit.

Then **CM**, deciding which edge to capture: rising, falling, or both. Use both edges to measure pulse width; single edge for period.

Next, synchronization mode. Your capture signal usually **doesn't sync** with the timer clock, so direct capture risks metastability. **Setting SCS to 1 for sync capture is recommended.** Read **SCCI** for synchronized levels, or **CCI** if you don't care about sync.

If all goes well, when a capture occurs, the current `TAxR` value is stored in `CCR[n]` and **CCIFG** is set.

One edge case: if CCR's value is captured before the previous capture was read, the old value gets overwritten. In this case, **COV** is set, so you can detect it. Note **COV doesn't auto-clear; you must clear it in software**, otherwise it stays 1.

### PWM Output using Timers

The key to timer-based PWM is adjusting GPIO transitions within a period—essentially using CCR.

First, set a period counter to establish the cycle length, usually using CCR0.

Then set a duty cycle counter to control the PWM high time, typically another CCR like CCR2.

### Example: Breathing Light using Timer A's CCR and Interrupts

```

/**
 * Breathing light
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

        TIMER_A2->CCR[0] = 5000; // CCR0 controls the entire breathing cycle period
        // CCR3 controls the brightening half-cycle
        TIMER_A2->CCTL[3] = TIMER_A_CCTLN_OUTMOD_7; // CCR3 reset/set
        TIMER_A2->CCR[3] = 5000;                    // CCR3 PWM duty cycle
        // CCR4 controls the dimming half-cycle
        TIMER_A2->CCTL[4] = TIMER_A_CCTLN_OUTMOD_7; // CCR4 reset/set
        TIMER_A2->CCR[4] = 0;                       // CCR4 PWM duty cycle

        TIMER_A2->CTL = TIMER_A_CTL_SSEL__SMCLK | TIMER_A_CTL_MC__UP | // Up mode 
                        TIMER_A_CTL_CLR;                               // Clear
        // If CCR0 overflows, it triggers the CCR Interrupt Flag
        // Clear the Interrupt Flag for CCR[0]
        TIMER_A2->CCTL[0] &= ~TIMER_A_CCTLN_CCIFG;
        // Enable CCR interrupt
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

// ISR triggered by CCR0 overflow
void TA2_0_IRQHandler(void)
{
        // Clear the interrupt flag register first
        TIMER_A2->CCTL[0] &= ~TIMER_A_CCTLN_CCIFG;

        // If CCR3
        if (TIMER_A2->CCR[3] >= 4800)
        {
                flag1 = 1;
        }
        else if (TIMER_A2->CCR[3] <= 100)
        {
                flag1 = 0;
        }
        // flag1 indicates whether CCR3 is at high end
        if (flag1)
        {
                TIMER_A2->CCR[3] -= 5;
        }
        else
        {
                // CCR3 is at low end
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
                // CCR4 >= 4800
                TIMER_A2->CCR[4] -= 5;
        }
        else
        {
                // CCR4 <= 100
                TIMER_A2->CCR[4] += 5;
        }
}
```

### Summary

Here's a summary of the basic program design flow for timer work:

- Timers usually work with other peripherals like GPIO, so configure those first
- Next, set the timer's operating mode:

```
TIMER_A2->CCTL[3] = TIMER_A_CCTLN_OUTMOD_7; // CCR3 reset/set
```

Here, `OUTMOD` is bits 7-5 of `TAxCCTLn`, with 8 possible output modes:

**OUTMOD (TAxCCTLn bits 7-5)**

| OUTMOD | Macro | Mode | Behavior |
| --- | --- | --- | --- |
| `000` | `TIMER_A_CCTLN_OUTMOD_0` | Output | Output equals the `OUT` bit directly, like software control of the pin |
| `001` | `TIMER_A_CCTLN_OUTMOD_1` | Set | Set to 1 when counter reaches CCRn, then hold |
| `010` | `TIMER_A_CCTLN_OUTMOD_2` | Toggle/Reset | Toggle when counter reaches CCRn, clear when reaching CCR0 |
| `011` | `TIMER_A_CCTLN_OUTMOD_3` | Set/Reset | Set to 1 when reaching CCRn, clear when reaching CCR0 |
| `100` | `TIMER_A_CCTLN_OUTMOD_4` | Toggle | Toggle when reaching CCRn |
| `101` | `TIMER_A_CCTLN_OUTMOD_5` | Reset | Clear when reaching CCRn, then hold |
| `110` | `TIMER_A_CCTLN_OUTMOD_6` | Toggle/Set | Toggle when reaching CCRn, set when reaching CCR0 |
| `111` | `TIMER_A_CCTLN_OUTMOD_7` | Reset/Set | Clear when reaching CCRn, set when reaching CCR0 |

Two key points about this table:

- **Modes 2, 3, 6, 7 don't make sense on `CCTL[0]`**. They depend on two events—"reaching CCRn" and "reaching CCR0"—but when n=0 these are the same event, so output won't behave as expected. So CCR0 usually just sets the period; PWM duty cycles go to CCR1–CCR6.
- **In up mode, OUTMOD_7 is the most convenient for PWM**: CCR0 sets period, CCRn sets duty cycle, output goes low when reaching CCRn and high when reaching CCR0 (new cycle), giving:

  $$
  \text{Duty cycle} = 1 - \frac{\mathrm{CCR}n}{\mathrm{CCR}0 + 1}
  $$

  For intuitive "higher CCRn = brighter", use OUTMOD_3 (Set/Reset) instead.

Next, set initial values for the timer:

```

TIMER_A2->CCR[0] = 5000; // CCR0 controls the entire breathing cycle period
```

Set the overall Timer_A operating mode:

```

TIMER_A2->CTL = TIMER_A_CTL_SSEL__SMCLK | TIMER_A_CTL_MC__UP | // Up mode 
                       TIMER_A_CTL_CLR;                               // Clear
```

Timer_A's mode is controlled by the 16-bit `TAxCTL` register:

**TAxCTL — Timer_A Control Register**

| Bits | Field | Meaning | Values |
| --- | --- | --- | --- |
| 15-10 | — | Reserved | — |
| 9-8 | **TASSEL** | Clock source selection | `00` TAxCLK / `01` ACLK / `10` SMCLK / `11` INCLK |
| 7-6 | **ID** | Input divider | `00` /1 / `01` /2 / `10` /4 / `11` /8 |
| 5-4 | **MC** | Count mode | `00` stop / `01` up (to CCR0) / `10` continuous (to 0FFFFh) / `11` up/down (to CCR0 then back to 0) |
| 3 | — | Reserved | — |
| 2 | **TACLR** | Write 1 to clear TAxR, divider, and count direction; **this bit auto-clears** | — |
| 1 | **TAIE** | Timer overflow interrupt enable | `0` disabled / `1` enabled |
| 0 | **TAIFG** | Timer overflow interrupt flag | Must be cleared by software |

The corresponding macros are `TIMER_A_CTL_*`. Note TI provides two naming styles for the same field: with single underscores by index (`TIMER_A_CTL_TASSEL_2`) and double underscores by meaning (`TIMER_A_CTL_SSEL__SMCLK`). They have the same value; the latter is more readable and recommended.

Let's verify the code above:

```text
TIMER_A_CTL_SSEL__SMCLK   = 0x0200   →  TASSEL = 10, clock source is SMCLK
TIMER_A_CTL_MC__UP        = 0x0010   →  MC     = 01, count up to CCR0
TIMER_A_CTL_CLR           = 0x0004   →  TACLR  =  1, immediately clear counter
                          ─────────
                   TAxCTL = 0x0214
```

Note the use of `=` instead of `|=`, so `TAIE` is also set to 0—this example relies on CCR0 interrupt, not timer overflow, so that's fine. But if appending to existing configuration, use `|=`.

Also, `ID` can only divide down to /8. For slower speeds, the `IDEX` field (bits 2-0) of the `TAxEX0` register can divide by 1–8 more. Chained together, you can reach /64 maximum:

```c
TIMER_A2->EX0 = TIMER_A_EX0_IDEX__8;   // Chained with ID, total divide up to 8 × 8 = 64
```

Enable CCR interrupts:

```

// Clear the Interrupt Flag for CCR[0]
TIMER_A2->CCTL[0] &= ~TIMER_A_CCTLN_CCIFG;
// Enable CCR interrupt
TIMER_A2->CCTL[0] = TIMER_A_CCTLN_CCIE;
```

Both `CCIE` and `CCIFG` are bits in `TAxCCTLn`; positions are in the bit field table above.

These two lines have a subtle issue: the second line uses `=` instead of `|=`, overwriting the entire `CCTL[0]`—including the `CCIFG` we just cleared. So the first line was wasted. The correct way is:

```c
TIMER_A2->CCTL[0] &= ~TIMER_A_CCTLN_CCIFG;   // Clear interrupt flag
TIMER_A2->CCTL[0] |=  TIMER_A_CCTLN_CCIE;    // Enable interrupt, preserve other bits
```

Enable other global interrupts:

```

SCB->SCR |= SCB_SCR_SLEEPONEXIT_Msk;
   __DSB();
   __enable_irq();
   NVIC->ISER[0] = 1 << ((TA2_0_IRQn)&31);
```

Note the NVIC part: put the interrupt vector name there. CCR0 uses `TA2_0_IRQn`, others use `TA2_N_IRQn`.

Interrupt Service Routine (using breathing light as example)

When is an interrupt triggered?

When Timer_A equals the value in a CCR register.

### References

- TI. *MSP432P4xx Microcontrollers Technical Reference Manual* (SLAU356), Chapter: Timer_A. <https://www.ti.com/lit/ug/slau356i/slau356i.pdf>
- TI. *MSP432P401R Datasheet* (SLAS826). <https://www.ti.com/lit/ds/symlink/msp432p401r.pdf>
- Bit field positions and values in this article's tables come from TI's official CMSIS header `msp432p401r.h` macro definitions `TIMER_A_CTL_*`, `TIMER_A_CCTLN_*`, `TIMER_A_EX0_*`
