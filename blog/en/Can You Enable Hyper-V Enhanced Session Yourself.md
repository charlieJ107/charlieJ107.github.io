---
draft: false
title: "Can You Enable Hyper-V Enhanced Session Yourself?"
date: 2020-05-16
category: Guides
tags: 
    - Windows
    - Hyper-V
    - Virtualizations
    - Linux
    - Ubuntu
description: "Yes, you can."
---
Yes, you can.
<!--more-->

### What?

Microsoft bundles a hypervisor called Hyper-V with Windows. It actually runs pretty fast compared to VirtualBox and the like, and it has Docker support. But the catch is that many essential features—like clipboard sharing and USB device passthrough—require Hyper-V's Enhanced Session Mode.

If you dig into it, you'll find that Enhanced Session Mode is just RDP (Remote Desktop Protocol) under the hood. Great for Windows VMs, but it's a pain for Linux.

Microsoft provides pre-configured Ubuntu images (like 18.04) in Hyper-V's "Quick Create" section, and they come with xrdp already set up so you can connect via RDP. Convenient if you use their images, but the downloads are slow and customization is limited. I looked into it myself and found that you can actually configure your own Ubuntu install the same way—Microsoft even provides a script for it, though you'll need to iron out a few wrinkles.

### Let's do it!

First, find Microsoft's VM tools repo, which contains the configuration scripts you need. It's [here](https://github.com/microsoft/linux-vm-tools).

Let's assume you've already installed Ubuntu 18.04 (note that 18.04.2, 18.04.3, and 18.04.4 have slight differences, though they're mostly compatible). Later versions work similarly since the desktop environment hasn't changed much. The only big break is between 16.04 and 18.04.

Clone the repository with git:

```bash
git clone https://github.com/microsoft/linux-vm-tools
```

Next, run the `linux-vm-tools/18.04/install.sh` script. Before you do, make it executable:

```bash
sudo chmod +x ./install.sh
sudo ./install.sh
```

Microsoft thinks they're done here, but there's a catch. The script will ask you to reboot. Do it:

```bash
reboot
```

Then run it again:

```bash
sudo ./install.sh
```

And then shut down:

```bash
shutdown now
```

Now use PowerShell (as Administrator) to enable Enhanced Session Mode on the VM:

```powershell
Set-VM -VMName 'your-vm-name' -EnhancedSessionTransportType HvSocket
# After setting it, you can check if it worked with:
(Get-VM -VMName 'your-vm-name').EnhancedSessionTransportType
```

In theory, Enhanced Session should work now, but it probably won't. According to [this article](http://c-nergy.be/blog/?p=13390), you'll likely hit a login failure.

Here's what you need to do:

First, install a dependency:

```bash
sudo apt-get install xserver-xorg-core
```

Then reinstall some packages that the above dependency might have displaced. (Supposedly it can break mouse support, though I never ran into it—but install them anyway):

```bash
sudo apt-get -y install xserver-xorg-input-all
```

After installing the missing dependencies, manually install the xorgxrdp package to restore xRDP functionality:

```bash
apt-get install xorgxrdp
```

Now you should finally be able to enjoy Enhanced Session Mode.
