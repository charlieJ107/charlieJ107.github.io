---
draft: false
title: "Install FileAccess and make your first backup"
description: "Download the APK, connect to an SMB share and check a photo or video backup."
project: fileaccess
section: guide
order: 10
updatedAt: 2026-09-20
---

## Prepare your phone and NAS

You need Android 15 or later and an SMB share reachable from the phone. Have the NAS host address, share name, username and password ready. Uploads and backups require write access to the destination folder. Connections currently use manually entered NAS details.

Version 0.1.0 is a development preview. Start with a few test files to validate your phone and NAS combination, and keep additional copies of important files. The project's main validation environments are an Android 16 emulator and isolated SMB fixtures.

## Install the application

Download an APK and the matching `SHA256SUMS` from [GitHub Releases](https://github.com/charlieJ107/file-access-app-android/releases). As of September 20, 2026, the v0.1.0 page provides `fileaccess-1.apk`. Follow Android's installation screen to grant installation permission to the browser or file manager you are using, then confirm installation.

The app can check versions and download and verify updates. Android asks you to confirm installation of an update.

## Add an SMB connection

1. Open the Spaces area and choose Add SMB connection.
2. Enter the host, share name and account. Use a hostname or address such as `192.168.1.10` in the host field.
3. Set the port, root directory and domain as needed. You can require SMB3 encryption if the NAS supports it.
4. Test and save the connection. Open a test folder and check browsing, previews and a small upload.

SMB signing is enabled by default. Requiring SMB3 encryption needs corresponding server support. Android Keystore encrypts credentials stored on the device.

## Create a backup rule

Create a backup rule in the destination NAS folder. Select camera photos and videos, or authorize a local folder through the system directory picker. Configure Wi-Fi, metered-network and charging conditions as needed, then use Back up now in the Backup area to start the first scan.

Camera backup can access only media authorized by the operating system. If you grant access to selected photos, backup is limited to that selection.

## Check transfers and copies

Inspect progress and failure details in Transfers. Confirm that the task succeeded, then check that the NAS file opens correctly. Large files also need verification after copying; this phase remains part of the task.

Later scans process files incrementally. Local deletion retains the NAS copy, and changed files can produce new copies. Android background scheduling, network conditions and permissions may delay automatic backups.

The current version supports SMB and one-way backup. Read the [implementation status](https://github.com/charlieJ107/file-access-app-android/blob/master/docs/implementation-status.md) for further boundaries and the [design article](/blogs/fileaccess-reliable-nas-backup/) for recovery behavior.
