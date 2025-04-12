# Use Node.js LTS as base image
FROM node:20-slim

# Create app directory
WORKDIR /app

# Install Playwright dependencies
RUN apt-get update && \
    apt-get install -y wget gnupg && \
    wget -q -O - https://dl-ssl.google.com/linux/linux_signing_key.pub | apt-key add - && \
    sh -c 'echo "deb [arch=amd64] http://dl.google.com/linux/chrome/deb/ stable main" >> /etc/apt/sources.list.d/google.list' && \
    apt-get update && \
    apt-get install -y \
      google-chrome-stable \
      fonts-freefont-ttf \
      fonts-noto-color-emoji \
      libgconf-2-4 \
      libxss1 \
      libnss3 \
      libnspr4 \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libgtk-3-0 \
      libxcomposite1 \
      libxdamage1 \
      libxfixes3 \
      libxrandr2 \
      libgbm1 \
      libxcursor1 \
      libpango-1.0-0 \
      libpangocairo-1.0-0 \
      libxi6 \
      libcups2 \
      libasound2 \
      libxtst6 \
      xvfb \
      xauth \
      --no-install-recommends && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install dependencies first (for better caching)
COPY package*.json ./
RUN npm ci

# Copy source code
COPY . .

# Build the TypeScript project
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the application
CMD ["node", "build/index.js"]
