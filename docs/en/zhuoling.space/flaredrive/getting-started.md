---
draft: false
title: "Getting started with FlareDrive"
description: "Sign in, create a repository, and complete an upload and download."
project: flaredrive
section: guide
order: 10
updatedAt: 2026-09-20
version: "2026-09-20 · 2b4db7a"
---

## Sign in and understand repositories

Open [FlareDrive](https://flaredrive.zhuoling.space), choose Sign In, and authenticate through [auth.zhuoling.space](https://auth.zhuoling.space). Registration is open, and you can use the service after registering.

After signing in, the application opens the file interface. A repository is an independent drive containing folders and files. Create several repositories to organize content for different purposes.

## Create your first repository

Choose New repository in the repository list and enter a name. For your first session, prepare a small test file to work through repository creation, upload and download.

To create an encrypted repository, first set and save an encryption passphrase in Settings, then select Enable end-to-end encryption in the creation dialog. Your account provides authentication and access permissions; the passphrase unlocks repository keys.

Keep your passphrase safe. The server cannot recover encrypted files if the passphrase is lost. Existing repositories still require their corresponding passphrase; changing the saved passphrase in Settings does not automatically update existing repository keys.

## Upload and download

Open the repository, navigate to the destination folder and use the upload control to select your test file. Follow progress in the upload queue or transfer center, wait for completion, and confirm that the file appears in the directory listing.

Download the file and compare it with the original. For encrypted files, the browser needs the corresponding passphrase to unlock the repository key and decrypt the contents.

After completing this round trip, use the same workflow to manage other files.

## Troubleshooting

- Sign-in failures: check your auth.zhuoling.space account's sign-in status.
- Decryption failures: verify that you are using the passphrase for the target repository.
- Upload failures: read the task error, check the destination and write permission, then retry.
- Reading shared files: confirm that your account has access and that you have the keys required for decryption.

See [encryption, permissions and metadata](/projects/flaredrive/docs/encryption-and-access/) for how keys and permissions work.
