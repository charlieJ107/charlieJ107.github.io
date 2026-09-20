---
draft: false
title: "MSP432 Notes - GPIO Basic Input and Output"
date: 2020-12-20
category: Learning Notes
tags:
  - c
  - MSP432
description: "GPIO basic input and output mainly consists of two parts, which follows the same approach as Arduino."
---

GPIO basic input and output mainly consists of two parts, which follows the same approach as Arduino. First, during the initialization phase, you need to determine which port you will use, what each port is for, and whether it is input or output.

Then in the software, there are two possible things you might want to do:

- If you want to use GPIO for output, you assign a value to the output state of the GPIO port
- If you want to use GPIO to read input, you need to read what the value of the GPIO input is

<!--more-->

### Important: Register Assignment Statements

Set the bit to 1:

```
p1->OUT |= BIT0;
```

Set the bit to 0:

```
P1->OUT &= ~(BIT0);
```

Toggle the bit:

```
P1->OUT ^= BIT0;
```

### Register Initialization Configuration

First, let's see how MSP432 configures GPIO.

#### Output

```

P1->DIR |= BIT0; //set direction to output
P1->OUT |= BIT0; //set to high level
```

When `DIR` is set to output, `OUT` determines the output high (1) or low (0) level; when `DIR` is set to input, `OUT` determines pull-up or pull-down.

#### Input

```

P1->DIR &= ~BIT1；
P1->OUT = BIT1;
```

### Reading Input

GPIO has a read-only register `PxIN`. The entire bit can be directly read to determine if the pin is high (1) or low (0).

### Other Registers You Might Use

#### `PxREN`

Configure pull-up/pull-down resistors

#### `PxSEL`

Function selection register

| PxSEL1 | PxSEL0 | I/O Function     |
| ------ | ------ | ------------ |
| 0      | 0      | GPIO       |
| 0      | 1      | Primary module function   |
| 1      | 0      | Secondary module function   |
| 1      | 1      | Tertiary module function |
