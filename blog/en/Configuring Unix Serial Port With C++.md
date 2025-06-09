---
title: "Configuring UNIX Serial Port with C++ and termios Library: A Step-by-Step Guide"
description: "In this guide, we will discuss how to configure and control a serial port on a UNIX system using C++ and the native termios library. We will cover opening the serial port device, configuring the port parameters, and reading/writing data to the serial port." 
date: "2023-06-03" # The date of the post fist published.
tags: # [Optional] The tags of the post.
  - "C++"
  - "Linux"
---

### 1. Opening the Serial Port Device

To open the serial port device, we can use the `open` function and specify the path to the device file, such as `/dev/ttyTHS1`.

```cpp
#include <fcntl.h>
#include <unistd.h>

int serialPort = open("/dev/ttyTHS1", O_RDWR | O_NOCTTY);
if (serialPort == -1) {
    // Handle the error case when opening the serial port fails
}
```

In this example, we open the `/dev/ttyTHS1` serial port device and store the file descriptor in the `serialPort` variable. If the open operation fails, you can handle the error as needed.

### 2. Configuring the Serial Port Parameters

To configure the serial port parameters, we use the `struct termios` structure to store and modify the configuration options. We use the `tcgetattr` function to get the current serial port configuration parameters and make modifications as necessary. Finally, we use the `tcsetattr` function to apply the modified parameters to the serial port.

```cpp
#include <termios.h>

struct termios serialOptions;
tcgetattr(serialPort, &serialOptions);
// Modify the configuration parameters in serialOptions

// Example: Set the baud rate to 115200
cfsetispeed(&serialOptions, B115200);
cfsetospeed(&serialOptions, B115200);

// Example: Set data bits to 8
serialOptions.c_cflag &= ~CSIZE;   // Clear the existing data size bits
serialOptions.c_cflag |= CS8;      // Set the data size to 8 bits

// Example: Enable hardware flow control
serialOptions.c_cflag |= CRTSCTS;

tcsetattr(serialPort, TCSANOW, &serialOptions);
```

In the above example, we use the `tcgetattr` function to get the current serial port configuration parameters and store them in the `serialOptions` structure. Then, we can modify the configuration parameters in `serialOptions` as needed.

The `struct termios` structure contains various flags and fields to configure the serial port parameters. Let's discuss the meaning and functionality of some important flags:

1. `c_iflag` (Input Mode Flags): These flags control the input mode options. Some common flags include:
   - `IGNBRK`: Ignore BREAK condition.
   - `BRKINT`: Generate an interrupt signal when a BREAK condition is detected.
   - `IGNPAR`: Ignore parity errors.
   - `PARMRK`: Mark parity errors.
   - `INPCK`: Enable input parity checking.
   - `ISTRIP`: Strip off the eighth bit of input characters.
   - `INLCR`: Map input carriage return (CR) to newline (LF).
   - `IGNCR`: Ignore input carriage return (CR).
   - `ICRNL`: Map input carriage return (CR) to newline (LF).

2. `c_oflag` (Output Mode Flags): These flags control the output mode options. Some common flags include:
   - `OPOST`: Enable output processing.
   - `ONLCR`: Map output newline (LF) to carriage return and newline (CR+LF).
   - `OCRNL`: Map output carriage return (CR) to newline (LF).
   - `ONLRET`: Map output carriage return

 (CR) to newline (LF).

3. `c_cflag` (Control Mode Flags): These flags control the control mode options. Some common flags include:
   - `CSIZE`: Mask for character size bits to specify the number of data bits.
   - `PARENB`: Enable parity generation and detection.
   - `PARODD`: Use odd parity instead of even parity.
   - `CSTOPB`: Use two stop bits instead of one.
   - `CREAD`: Enable receiver.
   - `CLOCAL`: Ignore modem control lines.

4. `c_lflag` (Local Mode Flags): These flags control the local mode options. Some common flags include:
   - `ISIG`: Enable signals.
   - `ICANON`: Enable canonical input mode.
   - `ECHO`: Enable echoing of input characters.
   - `ECHOE`: Echo erase characters as backspace.
   - `ECHOK`: Echo newline after kill characters.
   - `ECHONL`: Echo newline even if `ICANON` is not set.
   - `IEXTEN`: Enable extended input processing.

5. `c_cc` (Special Control Characters): This array field contains special control characters. Some common control characters include:
   - `VMIN`: Minimum number of characters to read.
   - `VTIME`: Timeout value in tenths of a second for non-canonical mode.
   - `VINTR`: Interrupt character.
   - `VQUIT`: Quit character.
   - `VERASE`: Erase character.
   - `VKILL`: Kill character.

You can modify these flags and fields in the `serialOptions` structure according to your requirements.

### 3. Reading and Writing Serial Port Data

After configuring the serial port parameters, we can start reading and writing data to the serial port. We can use the `read` function to read data from the serial port and the `write` function to write data to the serial port.

```cpp
#include <unistd.h>

const int BUFFER_SIZE = 1024;
char buffer[BUFFER_SIZE];
int bytesRead = read(serialPort, buffer, BUFFER_SIZE);
// Handle the read data

char data[] = "Hello, serial port!";
int bytesWritten = write(serialPort, data, sizeof(data));
// Handle the write result
```

In the above example, we use the `read` function to read data from the serial port and store it in the `buffer` array. The number of bytes read is stored in the `bytesRead` variable. Then, we can handle the read data as needed.

Similarly, we use the `write` function to write data to the serial port. In this example, we write the data from the `data` array to the serial port and store the number of bytes written in the `bytesWritten` variable. Then, we can handle the write result as needed.

Please note that in practical applications, you may need to add error handling, timeout handling, and data parsing to ensure stable and reliable serial communication.

### 4. Closing the Serial Port Device

After using the serial port device, it is important to close the opened port using the `close` function.

```cpp
close(serialPort);
```

The above steps outline the basic process of configuring a UNIX serial port using C++ and the termios library. You can modify the parameter settings and perform data read/write operations according to your specific requirements and application scenarios. Be sure to include appropriate error handling and exception handling to ensure code stability and reliability.

We hope this guide provides you with helpful insights into configuring a UNIX serial port. If you have any further questions, feel free to ask.