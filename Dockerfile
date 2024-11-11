FROM node:20-alpine

WORKDIR /app

# 复制所有源代码
COPY . .

# 安装依赖并构建
RUN npm install && \
    cd server && npm install && \
    cd .. && npm run build

# 创建上传目录
RUN mkdir -p server/uploads && \
    chown -R node:node server/uploads

USER node

EXPOSE 3000

CMD ["npm", "run", "prod"]
