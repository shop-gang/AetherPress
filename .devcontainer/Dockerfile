# .devcontainer/Dockerfile

# 1. Start from the official Microsoft Dev Container image for Node.js.
# This image includes Node.js, npm, and other common development tools.
# The ":22-bullseye" tag specifies Node.js 22 on the Debian Bullseye OS.
# This line directly corresponds to the "image" property from your original devcontainer.json.
FROM mcr.microsoft.com/devcontainers/javascript-node:22-bullseye

# 2. [Optional] Add any custom OS-level dependencies here.
# For example, if you needed to install another tool via apt-get, you would do it here.
# The "ARG" lines are a best practice for dev containers to avoid unnecessary rebuilds.
#
# ARG INSTALL_ZSH="false"
# RUN if [ "${INSTALL_ZSH}" = "true" ]; then \
#     apt-get update && export DEBIAN_FRONTEND=noninteractive && apt-get -y install zsh; \
#   fi

RUN apt-get update && apt-get install -y \
    sqlite3 \
    postgresql-client \
    curl \
    jq \
    git \
    python3 \
    python3-pip \
    vim \
    htop \
    net-tools \
    dnsutils \
    postgresql-client-common \
    postgresql-client \
    tree \
    # Chrome dependencies for Puppeteer
    libnspr4 \
    libnss3 \
    libexpat1 \
    libfontconfig1 \
    libuuid1 \
    libgbm1 \
    libxcb1 \
    libxkbcommon0 \
    libx11-6 \
    libx11-xcb1 \
    libxcb-dri3-0 \
    libdrm2 \
    libxshmfence1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxtst6 \
    libasound2 \
    && rm -rf /var/lib/apt/lists/*

# Install Google Chrome Stable
RUN curl -fsSL https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google-linux-signing-key.gpg \
    && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google-linux-signing-key.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google-chrome.list \
    && apt-get update \
    && apt-get install -y google-chrome-stable \
    && rm -rf /var/lib/apt/lists/*

# 3. Install global npm packages
RUN su node -c "npm install -g \
    typescript@5.2.2 \
    nodemon@3.0.1 \
    concurrently@8.2.1 \
    prettier@3.0.3 \
    eslint@8.48.0 \
    npm-check-updates@16.14.4 \
    typescript-language-server@3.3.2"

# 4. Install Python packages
RUN pip3 install --no-cache-dir \
    pytest \
    pylint \
    black \
    httpie

# This Dockerfile is intentionally simple because the base image is very capable.
# You only need to add lines here if you want to customize the container's
# operating system or install global tools beyond what the base image provides.