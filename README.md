# nocobase-plugin-dingtalk

NocoBase 2.x 钉钉扫码登录插件（DingTalk scan-code login plugin）。

- 同时支持 **v1 界面**（`/admin/`、`/signin`）与 **v2 界面**（`/v/admin/`、`/v/signin`）两套客户端
- 兼容钉钉**新旧两代接口**：新版 OpenAPI v1.0（`api.dingtalk.com/v1.0/...`）+ 旧版 topapi（`oapi.dingtalk.com/topapi/...`）
- 功能：钉钉扫码登录（OAuth 2.0 授权码模式）、用户自动注册、多方式用户匹配（组织邮箱 / 个人邮箱 / 手机号）

> 本插件基于社区插件 [nocobase-plugins](https://github.com/ruanjf/nocobase-plugins) 的钉钉登录模块重新开发，全新适配 NocoBase 2.x 双客户端（v1 + v2）。

## 特性

| 特性 | 说明 |
| --- | --- |
| 钉钉扫码登录 | OAuth 2.0 授权码模式，扫码后自动完成登录 |
| v1 / v2 双客户端 | 登录页按钮与认证管理配置表单在 `/admin/` 与 `/v/admin/` 两套界面均可使用 |
| 钉钉新旧接口兼容 | 用户信息获取走新版 v1.0 OpenAPI，组织邮箱/手机号查询走旧版 topapi |
| 多方式用户匹配 | 支持按组织邮箱、个人邮箱（含域名白名单校验）、手机号匹配已有用户 |
| 自动注册 | 未匹配到用户时，可按配置自动创建 NocoBase 用户并绑定 |
| 多语言 | 内置 zh-CN / en-US 语言包 |
| 零自定义数据表 | 认证器配置存储在 NocoBase 内置 `authenticators` 表，无需额外建表 |

## 兼容性

| 插件版本 | NocoBase 版本 | 说明 |
| --- | --- | --- |
| 1.0.x | 2.x | v1 + v2 双客户端（本插件） |
| 0.2.x | 2.x | 仅 v1 客户端（社区原版适配版） |
| 0.1.x | 1.x | NocoBase 1.x 原始版 |

## 工作原理

```
┌────────────┐   ① 点击「钉钉」按钮    ┌────────────────┐
│ 登录页      │ ──────────────────────▶ │ getAuthUrl      │
│ (v1 / v2)  │ ◀────────────────────── │ (返回授权页URL)  │
└────────────┘   ② 浏览器跳转           └────────────────┘
       │
       ▼ ③ 跳转钉钉授权页 login.dingtalk.com
       │    用户扫码并同意授权
       ▼ ④ 钉钉回调 redirectAuth?code=xxx&authenticator=xxx
┌────────────────┐
│ redirectAuth    │ ⑤ code 换用户 token → 查询用户信息
│ (本插件服务端)   │ ⑥ unionId → userId（绑定标识）
└────────────────┘ ⑦ 匹配 users 表 / 自动注册 → 签发 token
       │
       ▼ ⑧ 重定向回登录页 ?authenticator=xxx&token=xxx（前端完成登录）
```

## 安装

### 方式一：tgz 离线安装

下载 `nocobase-plugin-dingtalk-1.0.0.tgz`，在 NocoBase 应用目录执行：

```bash
yarn add ./nocobase-plugin-dingtalk-1.0.0.tgz
yarn nocobase pm enable nocobase-plugin-dingtalk
```

### 方式二：workspace（create-nocobase-app / monorepo 模式）

将插件目录放入应用的 `packages/plugins/` 下，然后：

```bash
yarn install
yarn build nocobase-plugin-dingtalk
yarn pm enable nocobase-plugin-dingtalk
```

启用后重启应用（或 `yarn dev` 开发模式），登录页即会出现「钉钉」登录按钮（需要先在认证管理中完成配置）。

## 配置

### 1. 钉钉开放平台创建应用

1. 登录 [钉钉开放平台](https://open-dev.dingtalk.com) → 创建**企业内部应用**
2. 进入应用「凭证与基础信息」，获取 **AppKey** 与 **AppSecret**
3. 进入应用「登录与分享」→「扫码登录」，配置**回调域名**，并将**回调 URL** 填写为：
   ```
   https://你的域名/api/nocobase-plugin-dingtalk:redirectAuth
   ```
   > 本地开发可先配置 `http://localhost:13000/api/nocobase-plugin-dingtalk:redirectAuth`
4. 确认应用已开通通讯录权限（用户信息获取、手机号查询等），并将需要登录的成员加入应用可见范围

### 2. NocoBase 认证管理添加认证器

1. 进入 **设置 → 认证管理**（v2 界面路径：`/v/admin/settings/auth`）
2. 点击「添加认证器」，认证方式选择 **钉钉登录(扫码)**
3. 填写以下配置：

| 配置项 | 必填 | 说明 |
| --- | --- | --- |
| 用户不存在时自动注册 | 否 | 开启后，扫码用户未匹配到已有用户时自动创建 NocoBase 用户 |
| 用户匹配方式 | 是 | `组织邮箱` / `个人邮箱` / `手机号` |
| 邮箱域名（多个用逗号分隔） | 是 | 允许匹配的邮箱域名白名单，如 `example.com, corp.example.com` |
| 应用ID（AppKey） | 是 | 钉钉企业内部应用的 AppKey |
| 应用密钥（AppSecret） | 是 | 钉钉企业内部应用的 AppSecret |

> ⚠️ AppKey / AppSecret 属于敏感信息，请勿提交到代码仓库。

### 3. 用户匹配逻辑

钉钉扫码返回的用户信息会按「用户匹配方式」与 `users` 表关联：

| 匹配方式 | 匹配规则 | 校验 |
| --- | --- | --- |
| 组织邮箱 | `users.email` = 钉钉组织邮箱 | 邮箱后缀必须在白名单内，否则拒绝登录 |
| 个人邮箱 | `users.email` = 钉钉登录邮箱 | 邮箱后缀必须在白名单内，否则拒绝登录 |
| 手机号 | `users.phone` = 钉钉手机号 | 无 |

- **已匹配**：自动绑定（`usersAuthenticators` 记录钉钉 userId），后续扫码直接登录
- **未匹配**：开启「自动注册」时创建新用户并绑定；否则登录失败并提示
- 同一个 NocoBase 用户与钉钉 userId 的绑定关系是持久的，无需重复匹配

## FAQ

**Q：登录页没有出现钉钉按钮？**
A：确认插件已启用，且已在认证管理中创建了 **启用状态** 的钉钉认证器。

**Q：扫码后提示「邮箱域名不在允许范围内」？**
A：检查认证器配置中的「邮箱域名」，域名必须与用户邮箱后缀完全一致（多个用逗号分隔，不含空格）。

**Q：v2 界面（/v/admin/）登录页没按钮，但 v1 有？**
A：确认插件构建产物中包含 `client-v2.js`（v2 客户端入口）。本插件 1.0.0 起同时交付 v1 / v2 两个客户端入口，如使用旧版仅需重新构建安装。

**Q：回调地址如何配置才能通过代理 / HTTPS 访问？**
A：服务端会优先读取 `X-Forwarded-Proto` / `X-Forwarded-Host` 请求头，也可通过环境变量 `APP_URL` 显式指定外部访问地址。

## 开发

```bash
# 应用根目录（create-nocobase-app 模式）
yarn build nocobase-plugin-dingtalk
yarn pm enable nocobase-plugin-dingtalk
yarn dev
```

插件结构：

```
src/
├── index.ts                 # 服务端入口
├── server/
│   ├── plugin.ts            # 插件主类（注册 authType / 资源 / ACL）
│   ├── auth/DingTalkAuth.ts # 认证类（扫码登录核心流程）
│   ├── actions/dingTalkActions.ts # getAuthUrl / redirectAuth 回调
│   └── openapi/dingTalkApi.ts     # 钉钉 OpenAPI 封装（新旧接口兼容）
├── client/                  # v1 客户端（登录按钮 + 配置表单）
├── client-v2/               # v2 客户端（懒加载注册）
├── shared/                  # 共享常量
└── locale/                  # zh-CN / en-US
```

## License

MIT
