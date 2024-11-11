# 构建阶段
FROM node:20-alpine as builder

# 添加构建依赖
RUN apk add --no-cache python3 make g++ git

WORKDIR /app

# 设置 npm 配置
RUN npm config set registry https://registry.npmmirror.com

# 分别复制并安装主项目和服务器的依赖
COPY package*.json ./
RUN npm ci

COPY server/package*.json ./server/
RUN cd server && npm ci && cd ..

# 复制其余源代码
COPY . .

# 构建
RUN npm run build

# 运行阶段
FROM node:20-alpine

# 添加运行时依赖
RUN apk add --no-cache python3 make g++

WORKDIR /app

# 复制 package.json 文件
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/server/package*.json ./server/

# 安装生产依赖
RUN npm config set registry https://registry.npmmirror.com && \
    cd server && npm ci --only=production && cd ..

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
