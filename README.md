<!-- ## 环境变量配置

1. 复制 `.env.example` 为 `.env`
2. 在 `.env` 文件中填入你的配置:
   - `QUARK_COOKIE`: "夸克网盘的 cookie" -->

## 使用 Docker 运行
docker run -d \
  --name learn-vault \
  -p 3000:3000 \
  -e QUARK_COOKIE="你的夸克网盘Cookie" \
  -e NODE_ENV=production \
  xp9477/learn-vault:latest