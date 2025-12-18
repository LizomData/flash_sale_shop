# Repository Guidelines

## 项目结构与模块组织
- `src/main.js`：应用入口，挂载 Vue 3 实例并加载全局样式。
- `src/App.vue`：根布局与路由出口容器。
- `src/components/`：通用组件（示例 `HelloWorld.vue`）；新增组件按领域分子目录管理。
- `src/assets/`：静态资源与共享样式；引用时使用相对路径避免打包遗漏。
- `public/`：静态模板与公开资源；构建输出位于 `dist/`。
- 配置文件：`vue.config.js`、`babel.config.js`、`jsconfig.json` 影响构建、转译与路径提示。

## 构建、测试与开发命令
- `npm run serve`：本地开发，开启热更新。
- `npm run build`：生产构建输出到 `dist/`，用于部署。
- `npm run lint`：使用 ESLint + eslint-plugin-vue 校验代码，可追加 `-- --fix` 自动修复。
- 当前未内置自动化测试命令；如新增测试，请在 PR 中补充对应脚本与运行结果。

## 代码风格与命名约定
- 默认 2 空格缩进，UTF-8 编码；单文件组件顺序保持 `<template>` → `<script>` → `<style scoped>`。
- 组件文件与导出使用 PascalCase（如 `FlashBanner.vue`），变量、refs、函数用 camelCase，样式类名用 kebab-case。
- 遵循 Vue 3 Essential 规则：先声明 props/emit 再使用，避免在模板中写复杂逻辑，保持计算属性纯粹。
- 提交前运行 `npm run lint -- --fix`，确保无未解决的 ESLint 警告。

## 测试指引
- 建议使用 Vue Test Utils + Jest/ Vitest 进行单元与快照测试；测试文件命名 `*.spec.js`，放置于 `tests/unit/` 或紧邻源文件。
- 覆盖关键交互、边界条件和格式化逻辑；针对组件的输入输出、事件触发与渲染结果编写用例。
- 在 PR 描述中附上主要测试命令与结果摘要，便于验证。

## 提交与 Pull Request 要求
- 提交信息使用祈使句，简述单一变更，如 `feat: 添加限时抢购倒计时组件`；避免一次提交混合多种修改。
- PR 需包含变更目的、核心修改点、手动验证步骤（涉及 UI 时附截图/录屏）、关联 issue/需求编号。
- 若变更依赖或配置，说明对部署/运行的影响与迁移步骤；确保 `package-lock.json` 与 `package.json` 同步。
- 在合并前确认通过 `npm run lint` 与必要的构建/测试任务。

## 环境与安全提示
- 推荐 Node 16+ 与 npm 7+；首次安装依赖使用 `npm ci` 保持锁文件一致，不修改 `dist/` 产物。
- 环境变量放置于 `.env.local`，避免提交敏感凭据；公共配置使用 `.env` 并审查其可公开性。
- 静态资源请压缩后再引入，避免过大 bundle；大常量或文案提取为独立模块，减少组件体积。
