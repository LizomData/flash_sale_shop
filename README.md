# Flash Sale Shop

一个Vue 3 前端与 Spring Boot 后端的在线秒杀商城，支持登录/注册、秒杀下单、购物车结算、订单列表，以及管理员创建秒杀活动与商品管理。

## 功能概览
- 用户：注册/登录，浏览普通商品，参与秒杀，加入购物车与下单查看订单。
- 秒杀：限购校验、库存实时扣减、活动创建与查看。
- 管理后台（管理员账号）：创建秒杀活动、添加商品（仅内存存储，重启重置）。

## 技术栈
- 前端：Vue 3 + Vue CLI，原生 fetch 调用 REST，样式内联。
- 后端：Spring Boot 3.2，REST API + 简单内存存储，Jackson 序列化。

## 快速开始
```bash
cd flashsaleshop
npm run serve
```
开发代理已转发 `/api` 到 `http://localhost:8080`。

## 账户信息
- 默认管理员：手机号 `18800000000`，密码 `123456`（可创建秒杀与商品）
- 可在登录页选择“进入后台/商城”登录目标；普通用户注册后仅能访问商城。

## 常用脚本
- 前端：`npm run serve` 开发；`npm run build` 生产构建；`npm run lint` 代码检查。
- 后端：`./mvnw spring-boot:run` 运行；`./mvnw test` 测试；`./mvnw clean package` 打包。

## 接口简述
- `/api/auth/register`、`/api/auth/login`：注册/登录，返回 `token` 与用户信息。
- `/api/bootstrap`：获取用户、商品、秒杀、购物车、订单快照（需 Bearer token）。
- `/api/seckills/{id}/buy`、`/api/cart`、`/api/orders/checkout`：秒杀、加购与结算。
- `/api/admin/seckills`、`/api/admin/products`：管理员创建秒杀/商品。
