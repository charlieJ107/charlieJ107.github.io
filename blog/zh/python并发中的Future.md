---
title: "Python并发中的Future"
description: "在 Python 的 `concurrent.futures` 模块中，`Future` 是一种对象，用于表示异步操作的结果。你可以将其视为一个占位符，用于在某个任务执行完成之前存储任务的结果。`Future` 对象允许你以非阻塞的方式提交任务，并在将来检查任务的状态、获取结果，或等待任务完成。" 
date: "2024-5-13" # The date of the post fist published.
# updateAt: "2021-01-01" # [Optional] The date of the post last updated.
# heroImage: "heroImage" # [Optional] The image url of the post hero image.
category: "学了就忘" # [Optional] The category of the post.
# badgets: # [Optional] The badgets of the post.
#   - "badget" 
#   - "badget"
tags: # [Optional] The tags of the post.
  - "Python"
#   - ""
---

> 本文由AI辅助创作

在 Python 的 `concurrent.futures` 模块中，`Future` 是一种对象，用于表示异步操作的结果。你可以将其视为一个占位符，用于在某个任务执行完成之前存储任务的结果。`Future` 对象允许你以非阻塞的方式提交任务，并在将来检查任务的状态、获取结果，或等待任务完成。

### 1. `Future` 的基本功能：
- **提交任务**：当你通过 `ThreadPoolExecutor.submit()` 或 `ProcessPoolExecutor.submit()` 提交一个任务时，返回的就是一个 `Future` 对象。
- **检查状态**：可以通过 `Future` 对象检查任务是否完成，是否出错等。
- **获取结果**：可以通过调用 `Future.result()` 来获取任务的执行结果。如果任务尚未完成，`result()` 会阻塞，直到任务完成为止。

### 2. `Future` 的常用方法：
- `result(timeout=None)`：返回任务的结果。如果任务尚未完成，它将阻塞直到任务完成或超时。如果任务失败，它会抛出相应的异常。
- `done()`：检查任务是否已经完成。返回 `True` 表示任务已经完成，`False` 表示任务尚未完成。
- `cancel()`：尝试取消尚未开始的任务。如果任务已经运行，则无法取消。
- `cancelled()`：检查任务是否被取消。
- `exception(timeout=None)`：如果任务引发了异常，返回该异常。如果任务未完成，它将等待，直到任务完成或超时。

### 3. 等待 `Future` 完成的几种方式：

#### 方法 1：使用 `result()` 阻塞等待

最直接的方式是调用 `Future.result()`，它会阻塞当前线程，直到任务完成并返回结果。

```python
from concurrent.futures import ThreadPoolExecutor
import time

def task():
    time.sleep(2)
    return "Task completed!"

with ThreadPoolExecutor() as executor:
    future = executor.submit(task)

    # 阻塞等待任务完成，获取结果
    result = future.result()
    print(result)
```

在这个例子中，`future.result()` 阻塞当前线程，直到任务完成，返回 `"Task completed!"`。

#### 方法 2：使用 `done()` 检查任务是否完成

你可以用 `done()` 方法非阻塞地检查任务是否完成。

```python
from concurrent.futures import ThreadPoolExecutor
import time

def task():
    time.sleep(2)
    return "Task completed!"

with ThreadPoolExecutor() as executor:
    future = executor.submit(task)

    while not future.done():
        print("Waiting for task to complete...")
        time.sleep(0.5)

    print(f"Task result: {future.result()}")
```

在这个例子中，程序会持续检查任务是否完成，而不会阻塞主线程。

#### 方法 3：使用 `as_completed()` 等待多个 `Future` 完成

如果你有多个 `Future`，可以使用 `concurrent.futures.as_completed()` 来依次处理每个任务的完成。它会以任务完成的顺序返回 `Future`。

```python
from concurrent.futures import ThreadPoolExecutor, as_completed
import time

def task(n):
    time.sleep(n)
    return f"Task {n} completed!"

with ThreadPoolExecutor() as executor:
    futures = [executor.submit(task, i) for i in range(1, 4)]

    # 按照任务完成的顺序处理结果
    for future in as_completed(futures):
        print(future.result())
```

在这个例子中，`as_completed(futures)` 返回一个生成器，按任务完成的顺序返回 `Future`，而不必等待所有任务完成。

#### 方法 4：使用 `wait()` 来等待多个 `Future` 完成

`concurrent.futures.wait()` 允许你等待多个 `Future`，并根据是否完成进行分类。

```python
from concurrent.futures import ThreadPoolExecutor, wait
import time

def task(n):
    time.sleep(n)
    return f"Task {n} completed!"

with ThreadPoolExecutor() as executor:
    futures = [executor.submit(task, i) for i in range(1, 4)]

    # 等待所有任务完成
    done, not_done = wait(futures)

    # 处理完成的任务
    for future in done:
        print(future.result())
```

在这个例子中，`wait()` 返回两个集合：已完成任务的 `Future` 和未完成任务的 `Future`。

### 4. 使用 `timeout` 来设置等待时间

你可以在 `result()` 或 `exception()` 方法中设置 `timeout` 参数，以防止程序长时间阻塞等待任务完成。超时后，它会抛出 `concurrent.futures.TimeoutError`。

```python
from concurrent.futures import ThreadPoolExecutor, TimeoutError
import time

def task():
    time.sleep(2)
    return "Task completed!"

with ThreadPoolExecutor() as executor:
    future = executor.submit(task)

    try:
        # 等待 1 秒，如果任务未完成将引发 TimeoutError
        result = future.result(timeout=1)
        print(result)
    except TimeoutError:
        print("The task did not complete in the given time.")
```

在这个例子中，任务需要 2 秒完成，但我们只等待 1 秒，因此会抛出 `TimeoutError`。

### 总结：
`Future` 是 Python 中处理并发任务的一个强大工具，它允许你异步执行任务并在任务完成后获取结果或处理异常。你可以使用 `result()` 阻塞等待，使用 `done()` 非阻塞检查，或使用 `as_completed()` 和 `wait()` 来等待多个 `Future`。

## 等待多个Future组成的list
在 Python 中，如果你有一个 `Future` 数组（即多个 `Future` 对象），你可以使用 `concurrent.futures.wait()` 或 `concurrent.futures.as_completed()` 来等待所有 `Future` 完成并收集结果。

### 方法 1：使用 `wait()` 等待所有 `Future` 完成并收集结果

`concurrent.futures.wait()` 会阻塞当前线程，直到所有 `Future` 完成。完成后，你可以遍历这些 `Future` 并提取结果。

```python
from concurrent.futures import ThreadPoolExecutor, wait

def task(n):
    return f"Task {n} result"

# 创建一个线程池
with ThreadPoolExecutor() as executor:
    # 提交多个任务并收集 Future 对象
    futures = [executor.submit(task, i) for i in range(5)]

    # 使用 wait 等待所有任务完成
    done, _ = wait(futures)

    # 提取所有完成任务的结果
    results = [future.result() for future in done]

    print("All tasks completed.")
    print("Results:", results)
```

#### 说明：
- `wait(futures)` 返回两个集合：`done`（已完成的 `Future`）和 `not_done`（未完成的 `Future`）。
- 使用 `result()` 提取每个 `Future` 的结果。

### 方法 2：使用 `as_completed()` 逐步获取完成的 `Future` 并收集结果

`concurrent.futures.as_completed()` 返回一个生成器，按任务完成的顺序返回 `Future`。你可以依次从生成器中获取结果，并将它们收集到一个数组中。

```python
from concurrent.futures import ThreadPoolExecutor, as_completed

def task(n):
    return f"Task {n} result"

# 创建一个线程池
with ThreadPoolExecutor() as executor:
    # 提交多个任务并收集 Future 对象
    futures = [executor.submit(task, i) for i in range(5)]

    # 使用 as_completed 获取每个完成的 Future 的结果
    results = [future.result() for future in as_completed(futures)]

    print("All tasks completed.")
    print("Results:", results)
```

#### 说明：
- `as_completed(futures)` 生成一个按任务完成顺序的 `Future` 对象，允许你在任务完成时立即处理结果。
- 和 `wait()` 不同，`as_completed()` 允许你在每个任务完成时立刻处理该任务的结果，而不需要等待所有任务都完成。

### 总结：
- 如果你希望一次性等待所有 `Future` 完成并收集结果，`wait()` 是一个合适的选择。
- 如果你想在每个任务完成时就立即处理结果，`as_completed()` 提供了更高的灵活性。

两种方法的返回结果顺序不同：
- `wait()` 返回的结果顺序与 `Future` 提交的顺序一致。
- `as_completed()` 返回的结果顺序与任务实际完成的顺序一致。

# 线程安全地将结果写入csv中
在并行处理环境下，多个线程可能同时尝试写入同一个文件（如 CSV 文件），这可能导致数据竞争或文件损坏。要确保线程安全地写入 CSV，你有几种方法可选：

### 1. 使用线程锁（Lock）

在 Python 中，可以使用 `threading.Lock` 来确保只有一个线程可以同时写入文件。通过在写入 CSV 文件时加锁，可以防止多个线程同时操作同一个文件，确保写入操作的原子性。

#### 示例代码：

```python
import csv
from threading import Lock
from concurrent.futures import ThreadPoolExecutor
import time

# 创建一个全局锁
lock = Lock()

# 模拟文件处理函数，返回处理结果
def process_file(file_name):
    time.sleep(1)  # 模拟处理时间
    return [file_name, "Processed"]  # 结果作为一个列表返回，方便写入csv

# 线程安全的写入csv函数
def write_to_csv(file_name, data):
    with lock:  # 加锁确保线程安全
        with open(file_name, mode='a', newline='') as file:
            writer = csv.writer(file)
            writer.writerow(data)
            print(f"Wrote {data} to {file_name}")

# 创建一个线程池
with ThreadPoolExecutor() as executor:
    file_names = ['file1', 'file2', 'file3', 'file4']
    
    # 提交任务并在完成后将结果写入csv
    futures = [executor.submit(process_file, file_name) for file_name in file_names]
    
    for future in futures:
        result = future.result()  # 获取处理结果
        write_to_csv('output.csv', result)  # 将处理结果写入csv
```

#### 解释：
- **`lock`**：在写入 CSV 文件时加锁，确保只有一个线程可以写入，避免数据竞争。
- **`write_to_csv` 函数**：每次写入时都获得锁，从而保证不会有多个线程同时写入文件。
- **文件写入模式**：使用 `mode='a'` 以追加模式打开文件，避免覆盖已有数据。

### 2. 使用 `queue.Queue` 收集结果，并由单独的线程写入

另一个方法是让各个线程将处理结果放入线程安全的 `queue.Queue` 中，然后使用一个单独的线程负责从队列中读取结果并写入 CSV。这样可以完全避免多个线程同时操作文件。

#### 示例代码：

```python
import csv
import queue
from concurrent.futures import ThreadPoolExecutor
from threading import Thread
import time

# 线程安全的队列，用于存储处理结果
result_queue = queue.Queue()

# 模拟文件处理函数，返回处理结果
def process_file(file_name):
    time.sleep(1)  # 模拟处理时间
    result = [file_name, "Processed"]  # 结果作为一个列表返回，方便写入csv
    result_queue.put(result)  # 将结果放入队列中

# 单独的线程从队列中读取结果并写入CSV
def csv_writer_thread(file_name):
    with open(file_name, mode='a', newline='') as file:
        writer = csv.writer(file)
        while True:
            result = result_queue.get()
            if result is None:  # 如果收到停止信号，结束写入
                break
            writer.writerow(result)
            print(f"Wrote {result} to {file_name}")
            result_queue.task_done()

# 创建线程池
with ThreadPoolExecutor() as executor:
    file_names = ['file1', 'file2', 'file3', 'file4']

    # 创建一个单独的线程负责写入csv
    writer_thread = Thread(target=csv_writer_thread, args=('output.csv',), daemon=True)
    writer_thread.start()

    # 提交任务
    futures = [executor.submit(process_file, file_name) for file_name in file_names]

    # 等待所有任务完成
    for future in futures:
        future.result()

    # 向队列发送None，通知写入线程结束
    result_queue.put(None)

    # 等待队列中的所有任务完成
    result_queue.join()

    # 等待写入线程结束
    writer_thread.join()
```

#### 解释：
- **`queue.Queue`**：一个线程安全的队列，所有线程都可以将处理结果安全地放入该队列。
- **`csv_writer_thread`**：一个独立的线程持续从队列中获取处理结果并写入 CSV 文件。当所有任务完成时，向队列发送 `None` 信号，告诉写入线程结束。
- **队列的优点**：各个线程只负责处理和将结果放入队列，写入操作由单独的线程完成，避免了文件写入冲突。

### 3. 使用 `pandas` 处理并发写入（适合较大规模数据）

如果你正在处理大规模数据，并且需要更复杂的数据处理和写入逻辑，可以使用 `pandas` 来批量写入数据。你可以让每个线程将结果写入内存中的 `DataFrame`，然后在所有任务完成后一次性写入 CSV 文件。这种方法适用于大量数据需要合并写入的场景。

#### 示例代码：

```python
import pandas as pd
from concurrent.futures import ThreadPoolExecutor
import time

# 用于存储每个线程处理的结果
results = []

# 模拟文件处理函数，返回处理结果
def process_file(file_name):
    time.sleep(1)  # 模拟处理时间
    return {'file_name': file_name, 'status': 'Processed'}

# 创建线程池
with ThreadPoolExecutor() as executor:
    file_names = ['file1', 'file2', 'file3', 'file4']
    
    # 提交任务并收集结果
    futures = [executor.submit(process_file, file_name) for file_name in file_names]
    
    for future in futures:
        result = future.result()  # 获取处理结果
        results.append(result)    # 将结果添加到列表中

# 使用 pandas 将结果一次性写入csv
df = pd.DataFrame(results)
df.to_csv('output.csv', index=False)
print("All results written to output.csv")
```

#### 解释：
- **`results` 列表**：每个线程将处理结果存入内存中的列表中，最终由 `pandas` 统一处理写入 CSV。
- **`pandas.DataFrame`**：处理大规模数据时，`pandas` 能高效地进行数据整合和写入。
- **优点**：所有线程的结果都存储在内存中，最终一次性批量写入，减少了频繁的文件 IO 操作。

### 总结：
- **锁机制**：适合小规模的并发写入任务，直接使用 `Lock` 来保护写入操作。
- **队列机制**：适合复杂的并发场景，使用队列让多个线程处理任务，单独一个线程安全地进行文件写入。
- **批量写入**：适合大规模数据场景，使用 `pandas` 等工具将数据批量写入以提高效率。

你可以根据你的实际需求选择最适合的方法。