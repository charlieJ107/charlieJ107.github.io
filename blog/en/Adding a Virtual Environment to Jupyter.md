---
draft: false
title: "Adding a Virtual Environment to Jupyter"
category: Guides
date: 2022-04-09 17:53:23
tags:
    - Python
    - Jupyter
description: "If you use Jupyter Lab like I do, you probably want to use different virtual environments as kernels for different projects. Here's how to add a virtual environment to Jupyter Lab."
---

If you use Jupyter Lab like I do, you probably want to use different virtual environments as kernels for different projects. Here's how to add a virtual environment to Jupyter Lab.

<!---more-->

First, create a virtual environment. If you've got Jupyter Lab already, spinning up a venv from the terminal should be straightforward.

Then activate the virtual environment and install `ipykernel` and `ipython`. Actually, just installing `ipykernel` is enough:

```bash
pip install ipykernel
```

Then, while in that virtual environment, install the kernel to your Jupyter config directory in your home folder. Make sure to use the `--user` flag:

```bash
ipython kernel install --user --name <kernel_name> 
```

If it tells you the installation succeeded, you're done.
