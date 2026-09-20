---
draft: false
title: "Accessing a Xiaomi Router Without Installing the Client"
date: 2020/2/13
categories:
    - Ramblings
tags:
    - System
    - Win10
    - Config
description: "A hacky workaround for a specific issue—temporary, not recommended for long-term use."
---
1. Windows 10 disabled a security policy that prevents you from accessing the Xiaomi router's shared network drive.
2. You need to adjust this policy in the **Local Group Policy Editor**, which you open by typing `gpedit.msc` in the **Run** dialog.
3. Navigate to **Computer Configuration → Administrative Templates → Network → Lanman Workstation**, then enable the option **"Enable insecure guest logons"**, and you should be able to access the drive.
4. After you're done accessing the router, remember to disable this option again to ensure security.
