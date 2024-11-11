FROM node:20-alpine

WORKDIR /app

# 复制 package.json
COPY package*.json ./
COPY server/package*.json ./server/

# 安装依赖
RUN npm install && \
    cd server && npm install

# 复制源代码
COPY . .

# 创建必要的目录
RUN mkdir -p server/uploads && \
    mkdir -p /data && \
    chown -R node:node /data && \
    chown -R node:node .

USER node

EXPOSE 3000

# 设置数据库路径环境变量
ENV DB_PATH=/data/database.sqlite

CMD ["npm", "run", "server"]
