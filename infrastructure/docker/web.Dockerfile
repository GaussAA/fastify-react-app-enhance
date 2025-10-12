FROM node:22-slim
WORKDIR /usr/src/app
COPY package*.json ./
# Use pnpm for workspace installs
RUN corepack enable && corepack prepare pnpm@8.9.0 --activate && pnpm install
COPY . .
CMD ["pnpm", "run", "dev"]
