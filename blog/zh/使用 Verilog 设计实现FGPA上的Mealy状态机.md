---
title: '使用 Verilog 设计实现FGPA上的Mealy状态机'
date: 2020-05-16
category: 学了就忘
tags: 
    - FGPA
    - Verilog
    - Vivado
description: Mealy状态机的设计方法
---
Mealy状态机的设计方法
<!--more-->

​	用Mealy状态机设计1101序列检测器的状态转换图如图所示:

![Mealy状态机状态转换图]

Mealy状态机设计1101序列检测的Verilog代码:

```verilog
`timescale 1ns / 1ps

module seqdetb(
    input wire clk,
    input wire clr,
    input wire din,
    output reg dout
    );
    
    reg [1:0] present_state, next_state;
    parameter S0=3'b00, S1=3'b01,S2=3'b10,S3=3'b11;
    //状态寄存器
    always @ (posedge clk or posedge clr)
        begin
            if (clr==1)
                present_state <= S0;
            else
                present_state <= next_state;
        end
        //C1模块
        always@ (*)
            begin
                case(present_state)
                    S0: if(din == 1)
                            next_state <= S1;
                        else
                            next_state <= S0;
                    S1: if(din == 1)
                            next_state <= S2;
                        else
                            next_state <= S0;
                    S2: if(din == 0)
                            next_state <= S3;
                        else
                            next_state <= S2;
                    S3: if(din == 1)
                            next_state <= S1;
                        else
                            next_state <= S0;
                    default
                        next_state <= S0;
                endcase
            end
        
        //C2模块
        always @ (posedge clk or posedge clr)
            begin
                if(clr==1)
                    dout <= 0;
                else if( (present_state == S3) && (din == 1))
                    dout <=1;
                else
                    dout <= 0;
            end    
endmodule

```

针对这个设计代码, 可以编写如下的测试文件用于行为仿真:

```verilog
`timescale 1ns / 1ps

module seqdetb_test(

    );
    reg clk;
    reg clr;
    reg din;
    wire dout;
    parameter period = 100;
    seqdetb seqdetb1(
    .clk(clk),
    .clr(clr),
    .din(din),
    .dout(dout)
    );
    wire present_state;
    wire next_state;
    initial 
        begin
            clk = 0;
            clr = 1;
            din = 0;
        end
    
    always #(period/2) 
        begin 
            clk = ~clk;
        end
    always #(period*2)
        begin
            din=~din;
        end
    always #period
        begin 
            clr=~clr;
        end
endmodule

```

仿真获得的测试波形如下: 

![seqdetb_test](https://image-vankyle-1257862518.cos.ap-chongqing.myqcloud.com/github/seqdetb_test.png)

对工程进行综合后, 可以成功生成BitStream文件.

### 结合状态机实现交通信号灯

通过状态机来实现一个交通信号灯, 状态转换表如下: 

| 状态 | 南北方向 | 东西方向 | 延迟/s |
| ---- | -------- | -------- | ------ |
| 0    | 绿       | 红       | 5      |
| 1    | 黄       | 红       | 1      |
| 2    | 红       | 红       | 1      |
| 3    | 红       | 绿       | 5      |
| 4    | 红       | 黄       | 1      |
| 5    | 红       | 红       | 1      |

信号灯的实现程序如下: 

```verilog
`timescale 1ns / 1ps

module traffic(
    input wire clk_3Hz,
    input wire clr,
    output reg [5:0] lights
    );
    
    reg [2:0] state;
    reg [3:0] count;
    parameter S0=3'b000, S1=3'b001, S2=3'b010,//states
                S3=3'b011, S4=3'b100, S5=3'b101;
    parameter SEC5=4'b1110, SEC1=4'b0010;
    always @ (posedge clk_3Hz or posedge clr)
        begin
            if(clr==1)
                begin
                    state <= S0;
                    count <= 0;
                end
            else
                case(state)
                    S0:
                        if(count<SEC5)
                            begin
                                state <= S0;
                                count <= count +1;
                            end
                        else
                            begin
                                state <= S1;
                                count <= 0;
                            end
                    S1:
                        if(count<SEC1)
                            begin
                                state <=S1;
                                count <= count +1;
                            end
                        else
                            begin
                                state <= S2;
                                count <= 0;
                            end
                    S2:
                        if(count<SEC1)
                            begin
                                state <= S2;
                                count <= count +1;
                            end
                        else
                            begin
                                state <=  S3;
                                count <= 0;
                            end
                    S3:
                        if(count<SEC1)
                            begin
                                state <= S3;
                                count <= count +1;
                            end
                        else
                            begin
                                state <=  S4;
                                count <= 0;
                            end
                    S4:
                        if(count<SEC1)
                            begin
                                state <= S4;
                                count <= count +1;
                            end
                        else
                            begin
                                state <=  S5;
                                count <= 0;
                            end
                    S5:
                        if(count<SEC1)
                            begin
                                state <= S5;
                                count <= count + 1;
                            end
                        else
                            begin
                                state <=  S0;
                                count <= 0;
                            end
                    default state <= S0;
                    endcase
                end
            always @(*)
                begin
                    case(state)
                        S0: lights=6'b100001;
                        S1: lights=6'b100010;
                        S2: lights=6'b100100;
                        S3: lights=6'b001100;
                        S4: lights=6'b010100;
                        S5: lights=6'b100100;
                        default lights=6'b100001;
                    endcase
                end
endmodule

```

对信号灯这个部分进行仿真, 编写的仿真测试文件如下: 

```verilog
`timescale 1ns / 1ps

module traffic_test(

    );
    reg clk_3Hz;
    reg clr;
    wire [5:0] lights;
    traffic theTraffic(
        .clk_3Hz(clk_3Hz),
        .clr(clr),
        .lights(lights)
        );
    parameter period = 20;
    initial 
        begin 
        clk_3Hz=0;
        clr=1;
        #10;
        clr=0;
        end

    always # (period/2)
        begin
            clk_3Hz=~clk_3Hz;
        end 
endmodule

```

![traffic_test](https://image-vankyle-1257862518.cos.ap-chongqing.myqcloud.com/github/traffic_test.png)

为了制造3Hz的时钟信号, 需要实现一个分频器

```verilog
`timescale 1ns / 1ps

module clkdiv(
    input wire clk_100MHz,
    input wire clr,
    output wire clk_3Hz
    );
    reg [24:0] q;
    //25bit counter
    always @ (posedge clk_100MHz or posedge clr)
        begin
            if(clr==1)
                q <= 0;
            else
                q <= q + 1;
        end
    assign clk_3Hz=q[24] ;//3Hz
endmodule

```

最后用一个顶层模块将分频器和交通灯两个模块封装起来

```verilog
`timescale 1ns / 1ps

module traffic_lights_top(
    input wire clk_100MHz,
    input wire [4:4] s,
    output wire [5:0] ld
    );
    wire clr, clk_3Hz;
    assign clr=s;
    clkdiv U1(.clk_100MHz(clk_100MHz),
                .clr(clr),
                .clk_3Hz(clk_3Hz)
              );
    traffic U2(.clk_3Hz(clk_3Hz),
                .clr(clr),
                .lights(ld)
              );    
endmodule

```

经过综合, 可以生成BitStream文件