---
title: "Content Defined Chunk (CDC)"
description: "Under the hood of CDC" 
date: "2023-05-24" # The date of the post fist published.
category: "拿来主义" # [Optional] The category of the post.
tags: # [Optional] The tags of the post.
  - "Storage"
  - "CDC"
---

> This article was created with the assistance of AI.

# Why Use Chunking?

By chunking data, we isolate changes. When a file is modified, only the modified chunks need to be updated.

## How to Chunk?

### Fixed-Length Chunking

Currently, files are chunked into fixed lengths. For example, suppose the file content is `abcdefg`. By dividing it into chunks of four bytes, we get `abcd|efg`. If a character is added at the beginning, making the content `0abcdefg`, the chunks become `0abc|defg`. Both chunks differ completely from the previous ones. This means that, when syncing the modification to a network file system, both chunks must be re-uploaded.

### Content-Defined Variable-Length Chunking

If chunks are defined based on content, using `d` as a breakpoint, chunks are formed as `0abcd|efg`. Here, only one chunk differs from the previous set, which significantly improves efficiency compared to fixed-length chunking.

#### Problem

There is an extremely low probability of creating multiple short chunks, e.g., `dddd` would be divided as `d|d|d|d`. This situation leads to excessive chunks, making it hard to manage. Obviously, we cannot always use the same content as the breakpoint. For instance, if the file content is `dd...d`, it would be chunked into `d|d|...|d|`, with each chunk containing just one character, wasting space and going against the original intent of chunking.

To address this issue, we need a method to randomly select breakpoints such that chunks have an average size while maintaining certain properties for the breakpoints.

---

# Hashing

Hashing maps an input of any length to a fixed-length output with the following properties:

- Fast in the forward direction
- Difficult to reverse
- Sensitive to input changes
- Avoids collisions
- Rolling hash

### Objective: Optimizing String Matching with Hashing

By matching strings based on their hash values, given a pattern string of length $ n $, we can take substrings of the matching string of length $ n $, compute their hashes, and compare with the pattern hash. With high probability, a hash collision implies the substrings match the pattern. However, brute-forcing all combinations is inefficient, so optimization is required.

Using a rolling hash, a sliding window of length $n$ calculates the hash of each substring by removing the effect of the old character and adding the effect of the new character, significantly reducing computational complexity.

#### Rolling Hash Formula

Let the substring within the window before sliding be $ s_{i...i+n} $. If $ M $ is a prime polynomial, the hash is:

$$
\text{hash}(s_{i...i+n}) = \left(s_i \cdot a^n + s_{i+1} \cdot a^{n-1} + \dots + s_{i+n-1} \cdot a + s_{i+n}\right) \bmod M
$$

After sliding, the hash for $ s_{i+1...i+n+1} $ is:

$$
\text{hash}(s_{i+1...i+n+1}) = \left(a \cdot \text{hash}(s_{i...i+n}) - s_i \cdot a^n + s_{i+n+1}\right) \bmod M
$$

Thus, the recurrence relation is:

$$
\text{hash}(s_{i+1...i+n+1}) = \left(a \cdot \text{hash}(s_{i...i+n}) - s_i \cdot a^n + s_{i+n+1}\right) \bmod M
$$

This allows $ O(1) $ computation for the next hash value, resulting in $ O(m + n) $ complexity for $ m $ substrings.

### Rabin-Karp Algorithm

The Rabin-Karp algorithm implements string matching using rolling hash. It relies on an efficient hash function, specifically the **Rabin Fingerprint**.

#### Rabin Fingerprint

The Rabin fingerprint is a polynomial hash on a finite field $ GF(2) $, e.g., $ f(x) = x^3 + x^2 + 1 $, represented as $ 1101 $ in binary.

Addition and subtraction are XOR operations, simplifying computation by avoiding carry-over concerns. However, multiplication and division require $ O(k) $ complexity (where $ k $ is the polynomial's degree).

---

### Implementation Example

For a polynomial $ M(x) $ of degree $ 64 $:

```cpp
uint64_t poly = 0xbfe6b8a5bf378d83LL;
```

The recurrence relation is:

$$
H = \left(a(x) \cdot H_\text{old} - s_i \cdot a^n(x) + s_{i+n}\right) \bmod M(x)
$$

Key optimizations include:

1. **Multiplication $ a(x) \cdot H_\text{old} $**: Precompute terms involving $ a(x) $.
2. **Efficient Modulo Operations**: Precompute values for modular reduction using $ g(x) $, simplifying modulo operations.

---

### Code for Finding Polynomial Degree

Below is the C++ implementation of finding the highest degree of a polynomial, equivalent to finding the most significant bit of a binary number:

```cpp
uint32_t RabinChecksum::find_last_set(uint32_t value) {
    if (value & 0xffff0000) {
        if (value & 0xff000000)
            return 24 + byteMSB[value >> 24];
        else
            return 16 + byteMSB[value >> 16];
    } else {
        if (value & 0x0000ff00)
            return 8 + byteMSB[value >> 8];
        else
            return byteMSB[value];
    }
}

uint32_t RabinChecksum::find_last_set(uint64_t v) {
    uint32_t h = v >> 32;
    if (h)
        return 32 + find_last_set(h);
    else
        return find_last_set((uint32_t)v);
}
```

Using this, polynomial multiplication can be implemented efficiently.

[Original Article (Chinese)](https://blog.csdn.net/cyk0620/article/details/120813255)