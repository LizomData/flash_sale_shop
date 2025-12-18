# Flash Sale Shop ⚡️🛒

一个 Vue 3 前端 + Spring Boot 后端的在线秒杀商城，支持登录/注册、秒杀下单、购物车结算、订单列表，以及管理员创建秒杀活动与商品管理（内存数据，重启重置）。

## ✨ 功能概览
- 👤 用户：注册/登录，浏览普通商品，参与秒杀，加入购物车与下单查看订单
- ⏱️ 秒杀：限购校验、库存实时扣减、活动创建与查看
- 🛠️ 管理后台：创建秒杀活动、添加商品（仅内存存储）

## 🧰 技术栈
- 🎨 前端：Vue 3 + Vue CLI，原生 fetch 调用 REST，内联样式
- 🧩 后端：Spring Boot 3.2，REST API + 内存存储，Jackson 序列化

## 🚀 快速开始
1) 启动后端  
```bash
cd flashsaleshop_backend
./mvnw spring-boot:run
```
默认端口 `8080`。

2) 启动前端  
```bash
cd flashsaleshop
npm ci
npm run serve
```
开发代理已转发 `/api` 到 `http://localhost:8080`。

3) 访问终端提示的本地地址。

## 👑 账户信息
- 管理员：手机号 `18800000000`，密码 `123456`
- 登录页可选“进入后台/商城”目标；普通用户注册后仅能访问商城

## 📜 常用脚本
- 前端：`npm run serve`（开发） | `npm run build`（生产构建） | `npm run lint`（检查）
- 后端：`./mvnw spring-boot:run`（运行） | `./mvnw test`（测试） | `./mvnw clean package`（打包）

## 🔗 接口简述
- `/api/auth/register`、`/api/auth/login`：注册/登录，返回 `token` 与用户信息
- `/api/bootstrap`：获取用户、商品、秒杀、购物车、订单快照（需 Bearer token）
- `/api/seckills/{id}/buy`、`/api/cart`、`/api/orders/checkout`：秒杀、加购与结算
- `/api/admin/seckills`、`/api/admin/products`：管理员创建秒杀/商品

## 📝 部署提示
- 生产建议接入数据库与 JWT 鉴权，完善压测与安全策略
- 不要提交 `.env.local` 等敏感文件，静态资源与配置按环境调整
