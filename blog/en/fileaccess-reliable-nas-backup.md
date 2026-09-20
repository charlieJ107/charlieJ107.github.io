---
draft: false
title: "FileAccess: helping phone-to-NAS backups continue"
description: "Understanding FileAccess SMB backup through Android background tasks, durable checkpoints and full verification."
date: 2026-09-20
updatedAt: 2026-09-20
category: Project design
projects: [fileaccess]
tags: [Android, SMB, NAS, Backup]
---

A video recorded on a phone may encounter a Wi-Fi switch, the end of a background time slice, process termination or a full destination disk before reaching a NAS. FileAccess starts from these everyday conditions: a task needs enough durable information for its next execution to know where to continue and how to verify the final file.

FileAccess is my native Android file client for personal NAS storage. The current v0.1.0 development preview focuses on SMB, with browsing, media previews, uploads, downloads and incremental photo and video backup.

## Keep tasks beyond the lifetime of a process

Android allocates execution opportunities according to task type, battery, network and system policy. FileAccess uses Room to persist its transfer queue and separates explicitly started transfers from automatic backup. The former use user-initiated data transfer jobs; the latter use WorkManager.

A backup task carries a persistent operation identifier and state. When the transfer engine is recreated, it can continue using those records. The transfer screen exposes pause, resume, cancel and failure details to the user.

This also shapes expectations: system scheduling and permissions can delay automatic backups. Users can explicitly start a backup and inspect its outcome in the task list.

## A checkpoint represents confirmed data

An SMB upload writes a temporary file in the destination directory, then commits it under its final name using a rename that preserves an existing destination. During upload, a remote receipt records file identity, confirmed offset and verification information. Two alternating receipt slots help recovery select a complete record.

Before continuing, the client checks the source version, remote identity and confirmed content prefix. It resumes writing after those checks agree. When something has changed, it preserves recovery information and reports why attention is needed.

Consider a connection that drops after a write but before the client receives confirmation. The remote file may have grown while the interface's recorded offset lags behind. Recovery must reconcile the remote receipt and content to establish which data is confirmed.

## Verification is part of the resumable task

After transferring a large video, FileAccess checks the full source and remote SHA-256 digests and lengths. Verification may itself span background time slices, so the implementation saves verification offsets and digest state bound to source and remote version information.

The backup baseline advances after successful commit and confirmation. If the final response is lost, later execution checks file identity and full content to reconcile the outcome. A stable operation identifier keeps retries associated with the same task.

These steps support a concrete outcome: when a task reports success, it has completed the transfer, verification and commit process required by the implementation.

## Backup semantics that retain copies

FileAccess currently uses one-way backup. Deleting a local photo retains its existing NAS copy; changes to a source file can produce a new copy. This suits using a NAS as an additional home for phone media.

Canceling an upload enters a cleanup flow for temporary data. Cleanup also checks file identity and receipts. Records with uncertain ownership are retained with an explanation. Transfer reliability therefore includes uploading, recovery and cleanup.

## Validation scope and getting started

The repository's resumable-upload record includes repeated interruptions, complete digest comparison for a large file in an isolated SMB environment, and Android 16 emulator tests. These are existing project validation records. Physical NAS power-loss durability, SMB3 encryption interoperability and vendor-specific background scheduling still need device acceptance testing. Version checks also rely on visible metadata; external modifications that preserve that metadata are a relevant boundary.

Start with the [installation and first-backup guide](/projects/fileaccess/docs/getting-started/), using a small set of test files to validate your devices. Source code and installation packages are available from the [GitHub project](https://github.com/charlieJ107/file-access-app-android).

