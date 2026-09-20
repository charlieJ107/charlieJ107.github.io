---
draft: false
title: "Encryption, permissions and metadata"
description: "Separate account permissions, file-content encryption and client-held keys."
project: flaredrive
section: explanation
order: 20
updatedAt: 2026-09-20
version: "2026-09-20 · 2b4db7a"
---

## File contents and directory information

FlareDrive supports encrypted and unencrypted repositories. Encrypted repositories encrypt file contents in the browser before uploading ciphertext to object storage.

The server still processes metadata such as filenames and directory hierarchy to organize the tree and check access permissions. File-content encryption has a different protection boundary from this metadata.

## The roles of the keys

A repository uses an RSA key pair, with its private key protected by an AES key derived from the passphrase. File contents use versioned encryption formats, and the browser selects an adapter using the format metadata saved with each file.

When reading an existing file, the client uses that file's version information to decrypt it. New uploads can use a newer writing format. This structure allows formats to evolve while preserving access to older data.

## Sharing permissions and decryption keys

The server determines access using the account and node permissions. Encrypted repositories provide the public key to non-owners while restricting access to the private-key envelope.

Users with write permission can upload encrypted content using the public key. Reading existing encrypted files requires the corresponding private key. Directory sharing grants access permission, and decryption additionally requires the appropriate keys.

## Passphrases and recovery

Users retain the encryption passphrase that unlocks the repository's private key. The server cannot recover a lost passphrase. On another device, use the target repository's passphrase to restore the client's ability to decrypt files.

Changing the saved passphrase in Settings does not automatically re-encrypt existing repository private keys. Retain and use the corresponding passphrase for each existing repository.

Start with the [getting started guide](/projects/flaredrive/docs/getting-started/) to complete an upload and download using a test file.
