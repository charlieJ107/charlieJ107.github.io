---
title: "配置UNIX串口的C++编程指南"
description: "在本指南中，我们将介绍如何使用C++和原生的termios库来配置和控制UNIX系统上的串口。我们将讨论如何打开串口设备、配置串口参数以及读写串口数据。" 
date: "2023-06-03" # The date of the post fist published.
tags: # [Optional] The tags of the post.
  - "C++"
  - "Linux"
---

### 1. 打开串口设备

要打开串口设备，我们可以使用open函数，并指定设备文件的路径，例如`/dev/ttyTHS1`。

```cpp
#include <fcntl.h>
#include <unistd.h>

int serialPort = open("/dev/ttyTHS1", O_RDWR | O_NOCTTY);
if (serialPort == -1) {
    // 处理打开串口失败的情况
}
```

在此示例中，我们打开了`/dev/ttyTHS1`串口设备，并将文件描述符存储在`serialPort`变量中。如果打开失败，可以根据需要进行错误处理。

### 2. 配置串口参数

要配置串口参数，我们使用`struct termios`结构体来存储和修改串口配置选项。我们使用`tcgetattr`函数获取当前的串口配置参数，并根据需要进行修改，最后使用`tcsetattr`函数将修改后的参数应用到串口。

```cpp
#include <termios.h>

struct termios serialOptions;
tcgetattr(serialPort, &serialOptions);
// 修改serialOptions中的配置参数
tcsetattr(serialPort, TCSANOW, &serialOptions);
```

在上述示例中，我们使用`tcgetattr`函数获取当前的串口配置参数，并将其存储在`serialOptions`结构体中。然后，我们可以根据需要修改`serialOptions`中的配置参数。最后，使用`tcsetattr`函数将修改后的参数应用到串口。

在修改串口参数时，你需要考虑以下常见的配置参数：

- 波特率（Baud Rate）：使用`cfsetispeed`和`cfsetospeed`函数设置输入和输出的波特率。
- 数据位（Data Bits）：通过修改`c_cflag`字段的`CS5`、`CS6`、`CS7`或`CS8`标志位来设置数据位的数量。
- 校验位（Parity）：通过修改`c_cflag`字段的`PARENB`和`PARODD`标志位来设置奇偶校验。
- 停止位（Stop Bits）：通过修改`c_cflag`字段的`CSTOPB`标志位来设置停止位的数量。
- 流控制（Flow Control）：通过修改`c_cflag`字段的`CRTSCTS`、`IXON`、`IXOFF`和`IXANY`标志位来启用或禁用硬件流控制和软件流控制。

以下是关于`struct termios`中各个标志位字段的功能和含义的详细解释：

```cpp
struct termios {
    tcflag_t c_iflag;   // 输入模式标

志
    tcflag_t c_oflag;   // 输出模式标志
    tcflag_t c_cflag;   // 控制模式标志
    tcflag_t c_lflag;   // 本地模式标志
    cc_t c_cc[NCCS];    // 特殊控制字符
};
```

1. `c_iflag`（输入模式标志）字段用于配置输入模式的选项。其中一些常见的标志位包括：
   - `IGNBRK`：忽略终端输入中的BREAK条件。
   - `BRKINT`：接收到BREAK条件时产生中断信号。
   - `IGNPAR`：忽略奇偶校验错误的输入字节。
   - `PARMRK`：对奇偶校验错误的输入字节使用标记。
   - `INPCK`：启用输入奇偶校验。
   - `ISTRIP`：去除输入字节的第8个位（即，仅保留7位）。
   - `INLCR`：将输入中的换行符转换为回车符。
   - `IGNCR`：忽略输入中的回车符。
   - `ICRNL`：将输入中的回车符转换为换行符。

2. `c_oflag`（输出模式标志）字段用于配置输出模式的选项。一些常见的标志位包括：
   - `OPOST`：处理输出，启用输出处理。
   - `ONLCR`：将输出中的换行符转换为回车和换行符。
   - `OCRNL`：将输出中的回车符转换为换行符。
   - `ONLRET`：将输出中的回车符转换为换行符。

3. `c_cflag`（控制模式标志）字段用于配置串口的控制模式选项。一些常见的标志位包括：
   - `CSIZE`：字符长度的掩码位，用于指定字符长度的大小。
   - `PARENB`：启用奇偶校验。
   - `PARODD`：使用奇数奇偶校验。
   - `CSTOPB`：使用两位停止位。
   - `CREAD`：使能接收数据。
   - `CLOCAL`：忽略调制解调器控制线。

4. `c_lflag`（本地模式标志）字段用于配置本地模式的选项。一些常见的标志位包括：
   - `ISIG`：使能信号处理。
   - `ICANON`：启用规范模式。
   - `ECHO`：使能回显输入字符。
   - `ECHOE`：在擦除字符时使用退格符。
   - `ECHOK`：使能回显换行符后的擦除行。
   - `ECHONL`：使能回显换行符。
   - `IEXTEN`：启用扩展输入处理。

5. `c_cc`（特殊控制字符）数组字段包含了

多个特殊控制字符。其中一些常用的控制字符包括：
   - `VMIN`：读取的最小字符数。
   - `VTIME`：非规范模式下的超时值。
   - `VINTR`：中断字符。
   - `VQUIT`：退出字符。
   - `VERASE`：擦除字符。
   - `VKILL`：终止字符。

以上是关于`struct termios`中各个标志位字段的功能和含义的详细解释。通过配置这些标志位，你可以控制串口的输入、输出、控制和本地模式选项，以满足你的需求和应用场景。请根据实际情况进行合理的配置和调整。

### 3. 读写串口数据

配置完串口参数后，我们可以开始读写串口数据。我们可以使用`read`函数从串口读取数据，使用`write`函数向串口写入数据。

```cpp
#include <unistd.h>

const int BUFFER_SIZE = 1024;
char buffer[BUFFER_SIZE];
int bytesRead = read(serialPort, buffer, BUFFER_SIZE);
// 处理读取到的数据

char data[] = "Hello, serial port!";
int bytesWritten = write(serialPort, data, sizeof(data));
// 处理写入数据的结果
```

在上述示例中，我们使用`read`函数从串口读取数据，并将数据存储在`buffer`数组中。读取的字节数存储在`bytesRead`变量中。然后，我们可以根据需要处理读取到的数据。

同样地，我们使用`write`函数将数据写入串口。在此示例中，我们将`data`数组中的数据写入串口，并将写入的字节数存储在`bytesWritten`变量中。然后，我们可以根据需要处理写入数据的结果。

请注意，在实际的应用中，你可能需要添加错误处理、超时处理和数据解析等功能，以确保稳定和可靠的串口通信。

### 4. 关闭串口设备

在使用完串口设备后，我们应该使用`close`函数关闭已打开的串口设备。

```cpp
close(serialPort);
```

以上是使用C++和原生的termios库配置UNIX系统上串口的基本步骤。你可以根据具体的需求和应用场景进行参数配置和数据读写操作。在实际使用中，请务必进行适当的错误处理和异常处理，以确保代码的稳定性和可靠性。