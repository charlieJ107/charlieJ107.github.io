---
title: "An introduction about the Mushoom POV Project"
description: "In this guide, we will discuss how to configure and control a serial port on a UNIX system using C++ and the native termios library. We will cover opening the serial port device, configuring the port parameters, and reading/writing data to the serial port."
date: "2023-06-19" # The date of the post fist published.
tags: # [Optional] The tags of the post.
  - "Project"
  - "ESP32"
  - "C"
  - "Hardware"
  - "PCB"
---

The Mushroom POV is a Persistence of Vision (POV) display based on the ESP32, which is the hardware implementation of [@Eloise](https://github.com/Eloise-Chen0722)'s undergraduate thesis project. This article primarily introduces some technical considerations in the software and hardware design of this project.

## Overall Design

The Mushroom POV is essentially a POV display, which works by rapidly rotating an LED strip, creating the illusion of a complete image within a certain time frame. However, unlike most implementations readily available online, where display content is directly encoded into the program to generate, we need our POV display to dynamically show different content. Thus, we require the POV display to receive external data and convert it into control signals for the LED strip. To achieve this goal, we need to accomplish the following steps:

1. Receive external data via wired or wireless means.
2. Encode the data into the colors each LED on the strip should display.
3. Control the color of each LED on the strip at specific time points to display the correct image.

Of course, this also involves encoding videos or images from a host computer into a suitable protocol for the POV display to parse correctly. This aspect will be discussed in detail in subsequent sections.

## Hardware Design

### MCU Selection

The core of the Mushroom POV is an MCU that needs to rapidly receive external data and convert it into control signals for the LED strip. Hence, we require an MCU capable of fast data processing. Here, we chose the ESP32, which is a dual-core MCU with each core capable of reaching 240MHz, and it also features a hardware-accelerated DMA engine, significantly boosting data processing speed. Additionally, the ESP32 includes a WiFi module, facilitating wireless transmission. Therefore, the ESP32 is a highly suitable MCU for this project. We also considered using the STM32F4, but due to its lack of a WiFi module, requiring additional peripherals, we ultimately chose the ESP32.

### LED Strip

Our strip utilizes APA102 LEDs, a type of digitally controllable LED strip where each LED has an independent control chip, controllable via the SPI interface. The advantage of this strip is its SPI controllability, allowing for accelerated data transmission using the DMA engine. Moreover, each LED having an independent control chip enables serial control, significantly reducing the number of control signals and thus reducing PCB complexity. However, even within APA102, there are different models. It's crucial to choose those with higher response speeds to ensure no display issues during high-speed rotation. Additionally, APA102 comes in various sizes and packaging specifications; some come with plastic casings, making individual LED sizes large, thus preferring those with small LED sizes, directly mountable on PCB. The strip I purchased from a certain marketplace is APA102-2020, with each LED measuring only 2mm x 2mm, allowing for more LEDs in limited space, thereby enhancing display resolution. However, this also implies higher difficulty in mounting, requiring finer mounting equipment. If you have the equipment and skills, you can mount them yourself. Otherwise, you can have the PCB manufacturer do it to ensure mounting quality.

### Power Supply

Since our strip is digitally controllable, it requires a 3.3V power supply. However, as the ESP32 operates at 3.3V, we need to provide two power sources: one at 3.3V for the ESP32 and another at 5V for the strip. It's worth noting that since the ESP32 operates at 3.3V, its IO port outputs 3.3V voltage, while the strip's input voltage is 5V, necessitating the use of level shifters to convert the ESP32's 3.3V IO port output to 5V level. Here, we utilized the 74HC245, an 8-bit bidirectional level shifter that can convert the ESP32's 3.3V IO port output to 5V level and vice versa, achieving bidirectional level shifting. Additionally, due to the strip's high power consumption, a large capacitor is needed to stabilize the power supply; we used a 1000uF capacitor here.

### Motor

If precise image display is required, a stepper motor with sufficient accuracy should be chosen. However, if only simple textures need to be displayed, a regular DC motor would suffice. For stepper motors, the issue of stepper motor drive will also arise.