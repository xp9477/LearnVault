# 构建阶段
FROM node:20-alpine as builder

WORKDIR /app

# 复制 package.json 文件
COPY package*.json ./
COPY server/package*.json ./server/

# 安装依赖并构建
RUN npm ci && \
    cd server && npm ci && cd .. && \
    npm run build

# 运行阶段
FROM node:20-alpine

WORKDIR /app

# 安装生产环境依赖
COPY server/package*.json ./server/
RUN cd server && npm ci --only=production

# 复制构建产物
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server

# 创建必要的目录并设置权限
RUN mkdir -p server/uploads /data && \
    chown -R node:node /data . && \
    chmod -R 755 server/uploads

# 使用非 root 用户
USER node

# 设置环境变量
ENV NODE_ENV=production

# 暴露前端端口
EXPOSE 5173

# 启动命令
CMD ["node", "--loader", "ts-node/esm", "server/index.ts"]
