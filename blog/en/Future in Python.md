---

title: "Future in Python Concurrency"

description: "In Python's `concurrent.futures` module, a `Future` is an object that represents the result of an asynchronous operation. You can think of it as a placeholder for storing the result of a task until its execution is complete. The `Future` object allows you to submit a task in a non-blocking manner and check the status of the task, get the result, or wait for the task to complete in the future." 

date: "2024-5-13" # The date of the post fist published.

# updateAt: "2021-01-01" # [Optional] The date of the post last updated.

# heroImage: "heroImage" # [Optional] The image url of the post hero image.

category: "Learning Notes" # [Optional] The category of the post.

# badgets: # [Optional] The badgets of the post.

# - "badget" 

# - "badget"

tags: # [Optional] The tags of the post.

  - "Python"

# - ""

---

> This article was created with the aid of AI

In Python's `concurrent.futures` module, a `Future` is an object that represents the result of an asynchronous operation. You can think of it as a placeholder for storing the result of a task until its execution is complete. The `Future` object allows you to submit a task in a non-blocking manner and check the status of the task in the future, get the result, or wait for the task to complete.

### 1. `Future` basic functions:

- **Submit a task**: when you submit a task via `ThreadPoolExecutor.submit()` or `ProcessPoolExecutor.submit()`, what is returned is a `Future` object.

- **Check status**: you can check whether the task is completed or not, whether there is any error, etc. through the `Future` object.

- **Get result**: You can get the result of the task execution by calling `Future.result()`. If the task is not yet complete, `result()` will block until the task is complete.

### 2. Common methods of `Future`:

- `result(timeout=None)`: returns the result of the task. If the task has not completed, it will block until the task completes or times out. If the task fails, it will throw the appropriate exception.

- `done()`: checks if the task has completed. Returning `True` means the task is done, `False` means the task is not done.

- `cancel()`: attempts to cancel a task that has not yet started. If the task is already running, it cannot be cancelled.

- `cancelled()`: checks if the task has been cancelled.

- `exception(timeout=None)`: returns an exception if it was raised by the task. If the task is not completed, it waits until the task completes or times out.

### 3. Several ways to wait for `Future` to complete:

#### Method 1: Blocking the wait with `result()`.

The most straightforward way is to call `Future.result()`, which blocks the current thread until the task completes and returns the result.

```python

from concurrent.futures import ThreadPoolExecutor

import time

def task().

    time.sleep(2)

    return "Task completed!"

with ThreadPoolExecutor() as executor: future = executor.

    future = executor.submit(task)

    # Block and wait for the task to complete, get the result

    result = future.result()

    print(result)

```

In this example, ``future.result()`` blocks the current thread until the task completes, returning ``"Task completed!"``.

#### Method 2: Using `done()` to check if a task is complete

You can check for task completion non-blockingly with the ``done()`` method.

```python

from concurrent.futures import ThreadPoolExecutor

import time

def task().

    time.sleep(2)

    return "Task completed!"

with ThreadPoolExecutor() as executor: future = executor.

    future = executor.submit(task)

    while not future.done(): print("Waiting for task to complete.

        print("Waiting for task to complete...")

        time.sleep(0.5)

    print(f "Task result: {future.result()}")

```

In this example, the program will keep checking for task completion without blocking the main thread.

#### Method 3: Waiting for multiple `Future`s to complete using `as_completed()`

If you have multiple `Futures`, you can use `concurrent.futures.as_completed()` to handle the completion of each task in turn. It will return `Future` in the order in which the tasks were completed.

```python

from concurrent.futures import ThreadPoolExecutor, as_completed

import time

def task(n).

    time.sleep(n)

    return f "Task {n} completed!"

with ThreadPoolExecutor() as executor:

    futures = [executor.submit(task, i) for i in range(1, 4)]

    # Process the results in the order in which the tasks were completed

    for future in as_completed(futures): print(future.result())

        print(future.result())

```

In this example, `as_completed(futures)` returns a generator that returns `Future` in the order in which the tasks were completed, without having to wait for all of them to complete.

#### Method 4: Using `wait()` to wait for multiple `Futures` to complete

``concurrent.futures.wait()`` allows you to wait for multiple ``Futures`` and sort them according to whether they are completed or not.

```python

from concurrent.futures import ThreadPoolExecutor, wait

import time

def task(n).

    time.sleep(n)

    return f "Task {n} completed!"

with ThreadPoolExecutor() as executor: futures = [executor.submit(task)].

    futures = [executor.submit(task, i) for i in range(1, 4)]

    # Wait for all tasks to complete

    done, not_done = wait(futures)

    # Process the completed tasks

    for future in done.

        print(future.result())

```

In this example, `wait()` returns two collections: `Future` for completed tasks and `Future` for not_done tasks.

### 4. Using `timeout` to set the wait time

You can set the `timeout` parameter in the `result()` or `exception()` method to prevent the application from blocking for a long time waiting for the task to complete. When it times out, it throws `concurrent.futures.TimeoutError`.

```python

from concurrent.futures import ThreadPoolExecutor, TimeoutError

import time

def task().

    time.sleep(2)

    return "Task completed!"

with ThreadPoolExecutor() as executor: future = executor.

    future = executor.submit(task)

    try.

        # Wait 1 second, if the task is not completed a TimeoutError will be thrown.

        result = future.result(timeout=1)

        result = future.result(timeout=1) print(result)

    except TimeoutError: print("The task did not complete")

        print("The task did not complete in the given time.")

```

In this example, the task took 2 seconds to complete, but we only waited 1 second, so a ``TimeoutError`` is thrown.

### Summary:

``Future`` is a powerful tool for handling concurrent tasks in Python that allows you to execute tasks asynchronously and get the results or handle exceptions when the task completes. You can wait for multiple `Futures` with `result()` blocking, with `done()` non-blocking checks, or with `as_completed()` and `wait()`.

## Waiting for a list of multiple Futures

In Python, if you have an array of `Futures` (i.e., multiple `Future` objects), you can use `concurrent.futures.wait()` or `concurrent.futures.as_completed()` to wait for all of the `Futures` to complete and collect the results.

### Method 1: Use `wait()` to wait for all `Futures` to complete and collect the results.

`concurrent.futures.wait()` blocks the current thread until all `Futures` have completed. When they're done, you can iterate through the `Futures` and extract the results.

```python

from concurrent.futures import ThreadPoolExecutor, wait

def task(n): return f "Task {n} result

    return f "Task {n} result"

# Create a thread pool

with ThreadPoolExecutor() as executor: # Create a thread pool.

    # Submit multiple tasks and collect Future objects

    futures = [executor.submit(task, i) for i in range(5)]

    # Use wait to wait for all tasks to complete

    done, _ = wait(futures)

    # Extract the results of all completed tasks

    results = [future.result() for future in done]

    print("All tasks completed.")

    print("Results:", results)

```

#### Description:

- `wait(futures)` returns two sets: `done` (completed `Future`) and `not_done` (uncompleted `Future`).

- Use `result()` to extract the result of each `Future`.

### Method 2: Use `as_completed()` to incrementally fetch the completed `Future` and collect the results.

`concurrent.futures.as_completed()` returns a generator that returns `Futures` in the order in which the tasks were completed. You can take the results from the generator in order and collect them into an array.

```python

from concurrent.futures import ThreadPoolExecutor, as_completed

def task(n).

    return f "Task {n} result"

# Create a thread pool

with ThreadPoolExecutor() as executor.

    # Submit multiple tasks and collect Future objects

    futures = [executor.submit(task, i) for i in range(5)]

    # Use as_completed to get the result of each completed Future

    results = [future.result() for future in as_completed(futures)]

    print("All tasks completed.")

    print("Results:", results)

```

#### Description:

- `as_completed(futures)` generates a `Future` object in the order in which the tasks were completed, allowing you to process the results as soon as the tasks are completed.

- Unlike `wait()`, `as_completed()` allows you to process the results of each task as soon as it completes, without waiting for all tasks to complete.

### Summary:

- If you want to wait for all `Future`s to complete and collect the results at once, `wait()` is an appropriate choice.

- If you want to process the results as soon as each task completes, `as_completed()` provides more flexibility.

The two methods return results in different orders:

- `wait()` returns results in the same order that `Future` submits them.

- `as_completed()` returns the results in the same order as the task actually completed.

# Write results to csv thread-safely

In a parallel processing environment, multiple threads may try to write to the same file (e.g., a CSV file) at the same time, which can lead to data contention or file corruption. To ensure that threads write to a CSV safely, you have several options:

### 1. Use a thread lock (Lock)

In Python, you can use `threading.Lock` to ensure that only one thread can write to a file at a time. Locking a CSV file prevents multiple threads from working on the same file at the same time, ensuring that writes are atomic.

#### Example code:

```python

import csv

from threading import Lock

from concurrent.futures import ThreadPoolExecutor

import time

# Create a global lock

lock = Lock()

# Simulate a file processing function and return the result

def process_file(file_name).

    time.sleep(1) # simulate processing time

    return [file_name, "Processed"] # Return the results as a list for writing to csv.

# Thread-safe write-to-csv function.

def write_to_csv(file_name, data): # write to csv with lock: # lock to ensure threaded writing.

    with lock: # Lock to ensure thread-safe writing.

        with open(file_name, mode='a', newline='') as file.

            writer = csv.writer(file)

            writer.writerow(data)

            print(f "Wrote {data} to {file_name}")

# Create a thread pool

with ThreadPoolExecutor() as executor:

    file_names = ['file1', 'file2', 'file3', 'file4']

    

    # Submit the task and write the results to a csv when it's done

    futures = [executor.submit(process_file, file_name) for file_name in file_names]

    

    for future in futures.

        result = future.result() # get the result of the process

        write_to_csv('output.csv', result) # Write the result of the process to csv

```

#### Explanation:

- **`lock`**: puts a lock on writing to a CSV file to ensure that only one thread can write, avoiding data contention.

- **`write_to_csv` function**: acquires a lock each time it writes, thus ensuring that no more than one thread can write to the file at the same time.

- **File writing mode**: use `mode='a'` to open the file in append mode to avoid overwriting existing data.

### 2. Use `queue.Queue` to collect results and have separate threads write to them

Another way to avoid multiple threads manipulating the file at the same time is to have each thread place the results into a thread-safe `queue.Queue` and then use a separate thread to read the results from the queue and write them to the CSV.

#### Example code:

```python

import csv

import queue

from concurrent.futures import ThreadPoolExecutor

from threading import Thread

import time

# Thread-safe queue for storing the results of processing

result_queue = queue.Queue()

# Simulate a file processing function and return the result

def process_file(file_name): # Simulate file processing function, return results.

    time.sleep(1) # simulate processing time

    result = [file_name, "Processed"] # Return the results as a list for writing to a csv.

    result_queue.put(result) # put the result into the queue

# A separate thread reads the results from the queue and writes them to the CSV

def csv_writer_thread(file_name).

    with open(file_name, mode='a', newline='') as file.

        writer = csv.writer(file)

        while True: result = result_queue.

            result = result_queue.get()

            if result is None: # If you get a stop signal, end the write.

                break

            writer.writerow(result)

            print(f "Wrote {result} to {file_name}")

            result_queue.task_done()

# Create a thread pool

with ThreadPoolExecutor() as executor:

    file_names = ['file1', 'file2', 'file3', 'file4']

    # Create a separate thread to write the csv to

    writer_thread = Thread(target=csv_writer_thread, args=('output.csv',), daemon=True)

    writer_thread.start()

    # Submit the task

    futures = [executor.submit(process_file, file_name) for file_name in file_names]

    # Wait for all tasks to complete

    for future in futures: future.result()

        future.result()

    # Send None to the queue to notify the write thread of its end

    result_queue.put(None)

    # Wait for all tasks in the queue to complete

    result_queue.join()

    # Wait for the write thread to finish

    writer_thread.join()

```

#### Explanation:

- **`queue.Queue` **: a thread-safe queue into which all threads can safely place the results of their processing.

- **`csv_writer_thread` **: a separate thread continuously fetches processing results from the queue and writes them to the CSV file. When all tasks are complete, a `None` signal is sent to the queue to tell the write thread to finish.

- **Advantages of queues**: Each thread is only responsible for processing and placing the results into the queue. The writing operation is done by a separate thread, avoiding file writing conflicts.

### 3. Using `pandas` to handle concurrent writes (for larger scale data)

If you are working with large-scale data and need more complex data processing and writing logic, you can use `pandas` to batch write data. You can have each thread write the results to a `DataFrame` in memory and then write to a CSV file all at once when all tasks are complete. This approach is suitable for scenarios where a large amount of data needs to be written in a consolidated manner.

#### Example code:

```python

import pandas as pd

from concurrent.futures import ThreadPoolExecutor

import time

# Use to store the results of each thread's processing

results = []

# Simulate a file processing function and return the results

def process_file(file_name): time.sleep(1) # Simulate file processing.

    time.sleep(1) # simulate processing time

    return {'file_name': file_name, 'status': 'Processed'}

# Create a thread pool

with ThreadPoolExecutor() as executor.

    file_names = ['file1', 'file2', 'file3', 'file4']

    

    # Submit the task and collect the results

    futures = [executor.submit(process_file, file_name) for file_name in file_names]

    

    for future in futures: result = future.result()

        result = future.result() # get the result of the process

        results.append(result) # add the result to the list

# Use pandas to write the results to a csv in one pass

df = pd.DataFrame(results)

df.to_csv('output.csv', index=False)

print("All results written to output.csv")

```

#### Explanation:

- **`results` list**: each thread stores the results of its processing into a list in memory, which is ultimately processed by `pandas` in a unified way to write to CSV.

- **`pandas.DataFrame` **: when dealing with large-scale data, `pandas` can efficiently integrate and write data.

- **Advantages**: The results of all threads are stored in memory and eventually written in a batch at once, reducing frequent file IO operations.

### Summary:

- **Lock mechanism**: suitable for small-scale concurrent write tasks, directly using `Lock` to protect the write operation.

- **Queue mechanism**: Suitable for complex concurrency scenarios, using a queue to let multiple threads handle the task, and a single thread to write the file safely.

- **Batch Write**: Suitable for large-scale data scenarios, use tools such as `pandas` to write data in batches to improve efficiency.

You can choose the most suitable method according to your actual needs.