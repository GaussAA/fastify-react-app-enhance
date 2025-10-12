FROM node:22-slim
WORKDIR /usr/src/app
COPY package*.json ./
# Use corepack to ensure pnpm is available and use pnpm to install production deps
RUN corepack enable && corepack prepare pnpm@8.9.0 --activate && pnpm install --prod
COPY . .
CMD ["node", "dist/server.js"]
