---
draft: false
title: FileAccess
hub: fileaccess
description: "A native Android client for personal NAS storage, with SMB file management, media previews and incremental photo and video backup."
updatedAt: 2026-09-20
group: personal
url: https://github.com/charlieJ107/file-access-app-android
badges: [Android, SMB, MPL-2.0]
tags: [Android, Kotlin, NAS, Backup]
---

FileAccess brings files on a personal NAS to Android: browse folders, preview media, upload and download files, and back up phone photos and videos to storage you control.

## Current capabilities

- Save and test SMB connections; browse, filter and sort the current directory, with batch selection.
- Create folders, rename entries, delete files or empty folders, and upload or download through the system file picker.
- View thumbnails in a list or adaptive grid; preview text, images and PDFs, and play media supported by the device.
- Inspect a persistent transfer queue and pause, resume or cancel tasks. SMB uploads support recovery and full verification before commit.
- Configure incremental backup for camera media or an authorized folder, subject to network and charging conditions.

Backup retains copies in one direction: deleting a local file leaves its existing NAS copy in place.

## Built for native Android

The interface uses Kotlin, Jetpack Compose and Material 3. Room persists transfer tasks. WorkManager schedules automatic backups, while Android user-initiated data transfer jobs handle explicitly started transfers. Android Keystore protects stored credentials. SMB signing is enabled by default, with an option to require SMB3 encryption.

## Download and development stage

As of September 20, 2026, the [v0.1.0 development preview](https://github.com/charlieJ107/file-access-app-android/releases/tag/v0.1.0) is available. It requires Android 15 or later; the main validation environment is an Android 16 emulator. Physical phones, NAS devices and vendor-specific background scheduling need further acceptance testing.

SMB is the current protocol. WebDAV, S3, private APIs, two-way synchronization and end-to-end encryption are future directions. Android scheduling and permissions affect when background backups run.

The source is licensed under MPL-2.0. Visit the [GitHub repository](https://github.com/charlieJ107/file-access-app-android), or start with [installation and your first backup](/projects/fileaccess/docs/getting-started/).
