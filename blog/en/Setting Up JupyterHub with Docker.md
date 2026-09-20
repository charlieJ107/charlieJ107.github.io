---
draft: false
title: "Setting Up JupyterHub with Docker"
date: 2021-08-31 02:08:14
category: Guides
tags:
    - Docker
    - Jupyter
    - Jupyter Hub
    - GPU
description: "This article introduces setting up a JupyterHub platform with Docker and implementing GPU sharing, along with multiple methods for identity verification"
---

> This article introduces setting up a JupyterHub platform with Docker and implementing GPU sharing, along with multiple methods for identity verification

<!--more-->

> **A note upfront**: This article was written in 2021 as a record from setting up a shared GPU environment for the lab. The private GitLab and private image registry mentioned have since gone offline; I've replaced those parts with generic instructions—just swap in your own OAuth provider and image registry instead. The approach remains the same. Please consult official documentation for the latest CUDA versions and driver installation methods.

## Environment Setup

First, ensure [Docker is installed](https://docs.docker.com/get-docker/)

```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh --mirror Aliyun # You can use this parameter to use Aliyun's mirror
sudo usermod -aG docker $USER # Add the current user to the docker group to use docker without sudo
```

Next, install the NVIDIA GPU driver and NVIDIA Container Toolkit

The GPU driver can be installed directly using ubuntu-drivers

```bash
sudo ubuntu-drivers install
```

To install NVIDIA Container Toolkit, follow the official documentation

```bash
distribution=$(. /etc/os-release;echo $ID$VERSION_ID) \
   && curl -s -L https://nvidia.github.io/nvidia-docker/gpgkey | sudo apt-key add - \
   && curl -s -L https://nvidia.github.io/nvidia-docker/$distribution/nvidia-docker.list | sudo tee /etc/apt/sources.list.d/nvidia-docker.list
   
sudo apt update

sudo apt install -y nvidia-docker2

sudo systemctl restart docker
```

GPU passthrough can be enabled by adding the `--gpus all` parameter when using `docker run`. You can test whether the installation was successful with this command

```bash
sudo docker run --rm --gpus all nvidia/cuda:11.2-base nvidia-smi
```

A successful installation produces output similar to the following

```bash
+-----------------------------------------------------------------------------+
| NVIDIA-SMI 450.51.06    Driver Version: 450.51.06    CUDA Version: 11.0     |
|-------------------------------+----------------------+----------------------+
| GPU  Name        Persistence-M| Bus-Id        Disp.A | Volatile Uncorr. ECC |
| Fan  Temp  Perf  Pwr:Usage/Cap|         Memory-Usage | GPU-Util  Compute M. |
|                               |                      |               MIG M. |
|===============================+======================+======================|
|   0  Tesla T4            On   | 00000000:00:1E.0 Off |                    0 |
| N/A   34C    P8     9W /  70W |      0MiB / 15109MiB |      0%      Default |
|                               |                      |                  N/A |
+-------------------------------+----------------------+----------------------+

+-----------------------------------------------------------------------------+
| Processes:                                                                  |
|  GPU   GI   CI        PID   Type   Process name                  GPU Memory |
|        ID   ID                                                   Usage      |
|=============================================================================|
|  No running processes found                                                 |
+-----------------------------------------------------------------------------+
```

## Building Required Images

JupyterHub itself doesn't perform computation; it's only a proxy and management platform. However, we want each user's allocated container to have GPU access, so we need to build our own GPU-capable images.

A user image meeting our requirements should have at least these characteristics:

* Based on nvidia/cuda
* Has `python3-pip` installed
* Has `jupyterlab`, `jupyterhub`, and `jupyter-notebook` installed

At the time, I wrote my own Dockerfile and kept it in the lab's private registry, which is now offline. However, the officially maintained [jupyter/docker-stacks](https://github.com/jupyter/docker-stacks) is more than sufficient; you just need to swap the base image for `nvidia/cuda`. Replace all instances of `registry.example.com/your-org/jupyter-docker/...` with your own built and pushed image names.

## Choosing a Deployment Method

You can deploy JupyterHub in a Docker container or on a bare machine. JupyterHub itself is just a proxy that routes web requests to the correct Jupyter Lab server based on authentication. So really, you need to make two choices: how to install JupyterHub, and how to install the Jupyter Lab servers it proxies. Since we need to consider isolation between environments, we'll go with Docker for both JupyterHub and Jupyter Lab.

For larger Hub services with multiple servers and many users, you could use Kubernetes to deploy JupyterHub. However, this is overkill for typical lab needs and wastes resources.

When a user logs into the Hub, the Hub authenticates them based on its configuration (defined in `Config.py`). Unauthenticated or unregistered users are redirected to the authentication endpoint. After completing the login flow, they're redirected back to the Hub. The Hub then uses a `Spawner` to allocate a Jupyter Lab server based on the authentication result. The mapping and related data are stored in the Hub's database.

![JupyterHub request flow: Browser requests first go to the HTTP Proxy. Unauthenticated requests are proxied to the Hub, which redirects to the OAuth provider via Authenticator. Once authorized, the Spawner launches the user's container and writes the route back to the Proxy. Thereafter, the Proxy directly forwards traffic to the user's container without going through the Hub](../../images/blog/jupyterhub-docker/jupyterhub-flow.en.svg)

One important detail: **after login completes, the Hub exits the data path**. All subsequent user requests are forwarded directly by the Proxy to their container. The Hub only participates during login and when starting/stopping containers. So a brief Hub restart won't interrupt users who are writing code.

JupyterHub needs to maintain some data, including the mapping between user IDs and their containers. For small numbers of users and light loads, the default SQLite is sufficient. If you require high availability features (regular backups, distributed storage, disaster recovery, etc.), you can use MySQL or another database. We'll stick with SQLite here.

## Choosing an Authentication Method

JupyterHub is a platform that allocates different Jupyter Notebooks to multiple users. First, it needs an authentication mechanism to distinguish between users. The default authentication mode is PAM-based, using the username and password of users on the Linux server running Jupyter Lab.

Beyond PAM authentication, I recommend OAuth instead. OAuth is an authentication protocol where an OAuth server provides user identity information. Many websites and applications support this, including GitHub, GitLab, and Google accounts.

Given the difficulty of maintaining PAM-based authentication and the inconvenience for registration and login, we'll use OAuth for authentication.

## Filling in Configuration Files

This section covers common configuration options for JupyterHub. Modify them according to your needs.

### Authentication

In theory, any OAuth provider can perform authentication, and the `oauthenticator` plugin has the best support for GitLab and GitHub. Let's use those as examples.

#### First, configure JupyterHub's external URL

Regardless of which OAuth provider you use, the first step is to determine JupyterHub's external URL—the callback address you register with the provider must match exactly, or login will be rejected.

By default, JupyterHub uses the machine's outward-facing IP. However, if you run the Hub in a container, it gets the container's internal IP, which external clients can't reach. So we leave an environment variable `JUPYTERHUB_URL` as an override. Pass it when running the container with `-e JUPYTERHUB_URL=<your address>`:

```python
import os
from jupyter_client.localinterfaces import public_ips

jupyterhub_url = os.environ.get("JUPYTERHUB_URL", "http://" + public_ips()[0] + ":8888")

c.JupyterHub.hub_ip = public_ips()[0]
```

#### Register an OAuth Application

Next, register an application with your chosen provider. This should be done by the JupyterHub administrator. The interfaces vary between providers, but the required fields are always the same:

| Field | Value |
| --- | --- |
| Application Name | Anything; users will see it during authorization |
| Callback URL (Redirect URI) | `<your JupyterHub URL>/hub/oauth_callback` |
| Scopes | For GitLab: `read_user`; for GitHub: leave empty or use `read:user` |

After saving, the provider will give you a `client_id` and `client_secret`. **`client_secret` is equivalent to a password—don't commit it to a code repository**. Pass it via environment variable instead of hardcoding it in the configuration file.

Common provider registration endpoints:

- GitHub: <https://github.com/settings/applications/new>
- GitLab.com or self-hosted GitLab: User Settings → Applications
- Other OAuth 2.0 / OIDC providers (Google, Azure AD, Keycloak, etc.): See [oauthenticator documentation](https://oauthenticator.readthedocs.io/)

#### Using GitLab

GitLab can be `gitlab.com` or any self-hosted GitLab instance. The configuration is identical; the only difference is whether you tell the plugin where GitLab is located:

```python
import os

c.JupyterHub.authenticator_class = 'oauthenticator.gitlab.GitLabOAuthenticator'
c.GitLabOAuthenticator.client_id = os.environ["OAUTH_CLIENT_ID"]
c.GitLabOAuthenticator.client_secret = os.environ["OAUTH_CLIENT_SECRET"]
c.GitLabOAuthenticator.scope = ['read_user']
c.GitLabOAuthenticator.oauth_callback_url = jupyterhub_url + "/hub/oauth_callback"
```

If using self-hosted GitLab, also pass `-e GITLAB_HOST="https://gitlab.example.com"` when running the container to tell the authenticator where to perform authentication. For `gitlab.com`, you can omit this.

#### Using GitHub

GitHub is simpler; you skip the server address specification:

```python
import os

# OAuth with GitHub
c.JupyterHub.authenticator_class = 'oauthenticator.GitHubOAuthenticator'
c.GitHubOAuthenticator.client_id = os.environ["OAUTH_CLIENT_ID"]
c.GitHubOAuthenticator.client_secret = os.environ["OAUTH_CLIENT_SECRET"]
c.GitHubOAuthenticator.oauth_callback_url = jupyterhub_url + "/hub/oauth_callback"
```

#### Restricting Who Can Log In

With just this configuration, **anyone with an account on that provider can log into your Hub**—clearly undesirable for public GitHub. Don't forget to add a whitelist:

```python
c.Authenticator.allowed_users = {'alice', 'bob'}
c.Authenticator.admin_users = {'alice'}
```

GitHub can also allow by organization or team, which is much more convenient than adding users individually:

```python
c.GitHubOAuthenticator.allowed_organizations = {'your-lab'}
```

## Data and File Storage Location

This step configures where data is stored. First, the database and cookie files (which manage user information and container mappings for each user), then the configuration file location, and finally each user's working directory. For easier maintenance and management, store everything in a unified location and persist it to the host machine when creating containers. Configuration files go in `/etc/jupyterhub/`, and data files go in `/srv/jupyterhub/`.

```python
c.JupyterHub.config_file = '/etc/jupyterhub/jupyterhub_config.py'

c.JupyterHub.cookie_secret_file = "/srv/jupyterhub/jupyterhub_cookie_secret"
c.JupyterHub.db_url = 'sqlite:////srv/jupyterhub/jupyterhub.sqlite' 
```

Each user's working directory location will be discussed in the next section.

## User Container Configuration

### Spawner

When a user logs into JupyterHub, the Hub allocates them their own container. This works as follows: the JupyterHub container has the host machine's `/var/run/docker.sock` mounted through, allowing it to control the host's docker daemon. JupyterHub manages user container allocation via a `Spawner`. When using Docker for user container allocation, the Spawner is `DockerSpawner`.

When a user needs a container, `DockerSpawner` calls the mounted `/var/run/docker.sock` to create a new container. The image for this container can be specified in the configuration file, or you can provide a list of images for users to choose from. `DockerSpawner` also handles things like the user's working directory. Since this part is tightly coupled to the user container image you've chosen, it requires some customization. Since we've built a custom user image, we need to configure it specifically for our image.

```python
c.JupyterHub.spawner_class = 'dockerspawner.DockerSpawner'
c.DockerSpawner.use_internal_ip = True
```

### User Data Directory

First, based on our custom user image, configure the username. We also need to decide where to store user files. By default, a `user-notebooks` folder is created in the directory where the container creation command is run, and a `jupyterhub-user-{username}` directory is created for each user. All user work files are saved there.

```python
notebook_user = os.environ.get('USER', 'ubuntu')
system_path = os.path.abspath(os.curdir)
notebook_dir = os.environ.get('USER_NOTEBOOK_DIR', '/home/{notebook_user}/work')
# Specify where user files are saved
c.DockerSpawner.notebook_dir = notebook_dir
c.DockerSpawner.volumes = { os.environ.get("USER_NOTEBOOK_DATA_DIR", os.path.join(system_path, "user-notebooks"))+'/jupyterhub-user-{username}': notebook_dir }
```

`notebook_dir` is **the starting location of Jupyter Lab within the user's container**

`volumes` is **where user files are saved on the host machine, corresponding to `notebook_dir`**

### Image Used by User Containers

The user container image specifies which image to use when allocating a container to each user. Since we need GPU support, we need to use our custom image.

```python
c.DockerSpawner.image = os.environ.get('DOCKER_NOTEBOOK_IMAGE', "registry.example.com/your-org/jupyter-docker/singleuser:20.04")
```

If you have multiple images for users to choose from, use the `allowed_images` configuration. Pass in a dictionary where the key is the image name shown to users and the value is the actual image name (including registry path).

```python
c.DockerSpawner.allowed_images = {
    "Base 18.04": "registry.example.com/your-org/jupyter-docker/singleuser:18.04",
    "Base 20.04": "registry.example.com/your-org/jupyter-docker/singleuser:20.04",
    
 }
```

### Parameters Passed to User Images

When a user image starts, it launches `Jupyter Lab`. To pass configuration file parameters, you can use `args`

```python
c.DockerSpawner.args=["--config=/etc/jupyterlab/jupyter_lab_config.py"]
```

### Enabling GPU

To allow user images to use GPUs, pass a specific parameter. See the corresponding issue for details:

```python
import docker
c.DockerSpawner.extra_host_config = {
    "device_requests": [
        docker.types.DeviceRequest(
            count=-1,
            capabilities=[["gpu"]],
        ),
    ],
}
```

### Specifying Jupyter Lab Instead of Notebook

Jupyter Lab is more user-friendly than Notebook, so we configure a startup command to ensure users get Jupyter Lab

```python
c.Spawner.cmd=["jupyter-labhub"]
```

#### Complete Configuration File Example

```python
# /etc/jupyterhub_config.py
## Get container IP and set callback URL
import os
from jupyter_client.localinterfaces import public_ips
jupyterhub_url = os.environ.get("JUPYTERHUB_URL","http://"+public_ips()[0]+":8888")

## Use GitLab for authentication
c.JupyterHub.authenticator_class = 'oauthenticator.gitlab.GitLabOAuthenticator'
## Pass client_id / client_secret via environment variables, don't hardcode them
c.GitLabOAuthenticator.client_id = os.environ["OAUTH_CLIENT_ID"]
c.GitLabOAuthenticator.client_secret = os.environ["OAUTH_CLIENT_SECRET"]
c.GitLabOAuthenticator.scope = ['read_user']
## If using GitHub authentication, comment out the above and uncomment the following
# c.JupyterHub.authenticator_class = 'oauthenticator.GitHubOAuthenticator'
# c.GitHubOAuthenticator.oauth_callback_url = jupyterhub_url+"/hub/oauth_callback"

c.GitLabOAuthenticator.oauth_callback_url = jupyterhub_url+"/hub/oauth_callback"

## Only allow users in the whitelist to log in, otherwise anyone with an account at the provider can access
c.Authenticator.allowed_users = {'alice', 'bob'}
c.Authenticator.admin_users = {'alice'}
## Configuration file location
c.JupyterHub.config_file = '/etc/jupyterhub/jupyterhub_config.py'
## Cookie and SQLite database file location

## File in which to store the cookie secret.
#  Default: 'jupyterhub_cookie_secret'
# data_dir = os.environ.get('DATA_VOLUME', '/jupyter-data')
c.JupyterHub.cookie_secret_file = "/srv/jupyterhub/jupyterhub_cookie_secret"


## If you have other parameters to pass to the database, add them here
#  sqlalchemy.create_engine for details.
#  Default: {}
# c.JupyterHub.db_kwargs = {}

## url for the database. e.g. `sqlite:///jupyterhub.sqlite`
#  Default: 'sqlite:///jupyterhub.sqlite'
c.JupyterHub.db_url = 'sqlite:////srv/jupyterhub/jupyterhub.sqlite' 
## Spawner-related settings
# Use Docker Spawner
c.JupyterHub.spawner_class = 'dockerspawner.DockerSpawner'
# Since JupyterHub also runs in a Docker container, use internal IP
c.DockerSpawner.use_internal_ip = True
# Determine the path used by user containers
notebook_user = os.environ.get('USER', 'ubuntu')
system_path = os.path.abspath(os.curdir)
notebook_dir = os.environ.get('USER_NOTEBOOK_DIR', '/home/{notebook_user}/work')
# Notebook startup location in the user container
c.DockerSpawner.notebook_dir = notebook_dir
# Host directory corresponding to the Notebook startup location in the user container
c.DockerSpawner.volumes = { os.environ.get("USER_NOTEBOOK_DATA_DIR", os.path.join(system_path, "user-notebooks"))+'/jupyterhub-user-{username}': notebook_dir }
# Image used by user containers
# Use `image` if allowing only a single image, otherwise use `allowed_images`
# c.DockerSpawner.image = os.environ.get('DOCKER_NOTEBOOK_IMAGE', "registry.example.com/your-org/jupyter-docker/singleuser")
# Allow users to select multiple images
c.DockerSpawner.allowed_images = {
    "Base 18.04": "registry.example.com/your-org/jupyter-docker/singleuser:18.04",
    "Base 20.04": "registry.example.com/your-org/jupyter-docker/singleuser:20.04",
 }

# Depending on the image used, if it starts as root (e.g., TensorFlow notebook images), add the "--allow-root" parameter
# c.DockerSpawner.args=["--allow-root", "--config=/etc/jupyterlab/jupyter_lab_config.py"]
c.DockerSpawner.args=["--config=/etc/jupyterlab/jupyter_lab_config.py"]

## Enable GPU for user containers
import docker
c.DockerSpawner.extra_host_config = {
    "device_requests": [
        docker.types.DeviceRequest(
            count=-1,
            capabilities=[["gpu"]],
        ),
    ],
    
}

##### VERY IMPORTANT #####
## Ensure Jupyter Lab rather than Notebook is launched
c.Spawner.cmd=["jupyter-labhub"]
##### VERY IMPORTANT #####

## SSL/TLS settings
# c.JupyterHub.ssl_key = '/cert/jupyterhub.key'
# c.JupyterHub.ssl_cert = '/cert/jupyterhub.crt'

## Set JupyterHub administrators by username (username, not email—the middle part of github.com/)
c.Authenticator.admin_users = admin_users = set()
admin_users.add("root")
```



## Enabling SSL (HTTPS)

To use HTTPS, configure SSL certificates by mounting the certificate directory into the JupyterHub container and filling in the following configuration:

```python
c.JupyterHub.ssl_cert = '/path/to/cert.crt'
c.JupyterHub.ssl_key = '/path/to/cert.key'
```

## Deployment

First, navigate to a directory dedicated to JupyterHub and create a `config` folder. Place your filled-out `jupyterhub_config.py` configuration file in this `config` directory.

Then run this command to start JupyterHub

```bash
docker run --name JupyterHub -d \
-v /var/run/docker.sock:/var/run/docker.sock \
-v $(pwd)/log:/var/log \
-v $(pwd)/data:/srv/jupyterhub \
-v $(pwd)/config:/etc/jupyterhub \
-v $(pwd)/cert:/cert \
-e USER_NOTEBOOK_DATA_DIR=/home/charlie/JupyterHub/UserNotebook \
-e JUPYTERHUB_URL=https://jupyterhub.example.com \
-p 8000:8000 \
registry.example.com/your-org/jupyter-docker/jupyterhub:latest; \
docker logs -f JupyterHub
```

Note that `/var/run/docker.sock` must be mounted; the others are optional. If you configured SSL in the configuration file, you need to provide a `/cert` directory in the container, or you'll get a startup error.

For environment variables, the main ones you need to set are:

* `USER_NOTEBOOK_DATA_DIR` determines where each user's working directory data is stored
* `JUPYTERHUB_URL` determines the URL used to access this JupyterHub, affecting authentication callbacks. If not using SSL/TLS certificates, remember to use `http://` instead of `https://`.

Finally, expose the default port 8000; you can adjust this in the configuration file if needed.

The final line `docker logs -f JupyterHub` lets you view startup logs. Once startup looks good, use `ctrl+c` to stop following the logs. The JupyterHub container will continue running.
