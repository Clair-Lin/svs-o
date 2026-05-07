# SVS 电子签章服务器 — 签名验签系统

> 版本 1.7.1 · 前端原型项目

## 1. 项目简介

SVS（Signature Verification System）电子签章服务器是一套面向政务、金融等行业的**签名验签系统**，提供基于国密算法（SM2/SM3/SM4）和 RSA 算法的数字签名、验签、加解密等密码服务。本仓库为该系统的**前端界面原型**，使用 Vue 3 构建，主要用于产品界面演示与交互验证。

---

## 2. 技术栈

| 类别       | 技术                          | 版本     |
| ---------- | ----------------------------- | -------- |
| 框架       | Vue 3 (Composition API)       | ^3.4.0   |
| 构建工具   | Vite                          | ^5.0.0   |
| UI 组件库  | Element Plus                  | ^2.5.0   |
| 图标       | Element Plus Icons Vue        | ^2.3.1   |
| 图表       | ECharts                       | ^5.4.3   |
| 状态管理   | Pinia                         | ^2.1.7   |
| 路由       | Vue Router (Hash 模式)        | ^4.2.5   |
| 样式       | SCSS                          | ^1.69.0  |
| 包管理     | npm (ES Module)               | -        |

---

## 3. 项目结构

```
src/
├── main.js                          # 应用入口
├── App.vue                          # 根组件（Header + Sidebar + RouterView）
│
├── components/
│   └── layout/
│       ├── Header.vue               # 顶部栏：折叠按钮、面包屑、系统标题、用户菜单
│       └── Sidebar.vue              # 侧边栏导航（可折叠）
│
├── composables/
│   └── pageBreadcrumb.js            # 面包屑状态管理（支持路由 meta 与页面动态写入）
│
├── constants/
│   └── gmt0019.js                   # GM/T 0019-2023 规范常量（密钥类型、用途、长度等）
│
├── router/
│   └── index.js                     # 路由配置（Hash 模式，含面包屑 meta）
│
├── stores/                          # Pinia 状态仓库（预留）
│
├── styles/
│   ├── variables.scss               # SCSS 设计变量（颜色、尺寸、字体、间距）
│   └── global.scss                  # 全局样式与工具类
│
├── utils/
│   └── whitelistIp.js               # IPv4 白名单校验（格式验证、CIDR 解析、区间重叠检测）
│
└── views/
    ├── Dashboard.vue                # 监控总览
    ├── Detect.vue                   # 一键检测
    ├── Application.vue              # 应用管理
    ├── cert/
    │   ├── CertManage.vue           # 应用证书管理
    │   ├── UserCert.vue             # 用户证书管理
    │   ├── CACert.vue               # CA 根证管理
    │   └── CACertChain.vue          # CA 证书链详情
    ├── key/
    │   ├── KeyManage.vue            # 密钥管理主页面（Tab 切换）
    │   ├── KeyManage0029Panel.vue   # GM/T 0029-2014 密钥面板
    │   ├── KeyManage0019Panel.vue   # GM/T 0019-2023 密钥面板
    │   └── KeyManageSecurityModals.vue  # 密钥操作安全认证弹窗
    ├── whitelist/
    │   └── WhitelistConfig.vue      # 白名单配置（IP 白名单）
    └── system/
        ├── SystemInfo.vue           # 系统信息
        ├── NetworkConfig.vue        # 网络配置
        ├── PoolConfig.vue           # 连接池配置
        ├── AdminManage.vue          # 管理员管理
        ├── Permission.vue           # 权限管理
        └── NTPConfig.vue            # NTP 时间源管理
```

---

## 4. 功能模块

### 4.1 监控总览 (`/dashboard`)

系统运行状态与资源监控的统一展示页面：

- **设备基本信息**：健康状态、CPU 型号、CPU 核数
- **网络状态**：管理端口/服务端口状态、网口列表及上下行流量
- **资源使用率**：CPU、内存、硬盘使用率（ECharts 环形图）
- **业务统计**：管理员访问次数、证书数量、用户数量、签名/验签业务量等

### 4.2 密钥管理 (`/key/manage`)

支持双标准密钥管理，通过 Tab 切换：

| Tab | 标准 | 说明 |
|-----|------|------|
| 签名验签服务器密钥 | GM/T 0029-2014 | 签名验签服务器技术规范密钥管理 |
| 通用密码服务接口密钥 | GM/T 0019-2023 | 通用密码服务接口规范密钥管理 |

**GM/T 0019-2023 密钥管理**功能：

- 密钥类型选择（SM2 / RSA）
- 密钥用途设置（签名、密钥交换协议、加密）
- 密钥长度配置（SM2: 256bit，RSA: 2048bit）
- 容器证书关联
- 安全认证弹窗（敏感操作需二次确认）

### 4.3 证书管理

| 页面 | 路由 | 说明 |
|------|------|------|
| 应用证书管理 | `/cert/manage` | 按应用编号/名称搜索，导入加密证书，查看证书详情 |
| 用户证书管理 | `/cert/user` | 用户级证书的查看与管理 |
| CA 根证管理 | `/cert/ca` | CA 名称/DN 搜索、有效期筛选、证书链查看 |
| CA 证书链 | `/cert/ca/chain/:id` | 查看 CA 根证完整证书链 |

### 4.4 白名单配置 (`/system/whitelist`)

应用访问 IP 白名单管理：

- **IP 格式支持**：单个 IP（如 `192.168.1.1`）、CIDR（如 `10.0.0.0/24`）、通配符（如 `192.168.1.*`）
- **区间重叠检测**：新增/编辑时自动检测与已有条目的 IP 区间重叠
- **批量操作**：支持多选批量删除
- **前端校验工具**：`utils/whitelistIp.js` 提供 IPv4 格式验证、CIDR 解析、IP 长整型转换等

### 4.5 一键检测 (`/system/detect`)

系统自检工具，支持三种检测模式：

- **全部检测**：服务接口检测 + 加密卡检测
- **服务接口检测**：获取服务器证书、签名接口、验签接口测试
- **加密卡检测**：硬件加密卡状态检测

检测前需上传 CA 根证和用户证书，检测结果支持导出报告。

### 4.6 系统管理

| 页面 | 路由 | 说明 |
|------|------|------|
| 系统信息 | `/system/info` | 设备型号、序列号、固件版本、硬件配置、网络信息 |
| 网络配置 | `/system/network` | 管理IP、子网掩码、网关、DNS 等 |
| 连接池配置 | `/system/pool` | 连接池参数设置 |
| 管理员管理 | `/system/admin` | 管理员账号管理 |
| 权限管理 | `/system/permission` | 权限分配与控制 |
| NTP 时间源管理 | `/system/ntp` | NTP 服务器配置 |

---

## 5. 路由设计

采用 **Hash 模式** 路由，所有路由定义在 `src/router/index.js`。

### 路由一览

| 路径 | 名称 | 页面 | 说明 |
|------|------|------|------|
| `/` | - | - | 重定向至 `/dashboard` |
| `/dashboard` | Dashboard | 监控总览 | 系统状态与资源监控 |
| `/key/manage` | KeyManage | 密钥管理 | 支持 `?tab=0019` 或 `?tab=0029` 切换 |
| `/cert/manage` | CertManage | 证书管理 | 应用证书搜索与管理 |
| `/cert/user` | UserCert | 用户证书管理 | 用户级证书管理 |
| `/cert/ca` | CACert | CA 根证管理 | CA 证书列表与搜索 |
| `/cert/ca/chain/:id` | CACertChain | CA 证书链 | 证书链详情页 |
| `/system/whitelist` | WhitelistConfig | 白名单配置 | IP 白名单访问控制 |
| `/system/detect` | Detect | 一键检测 | 服务接口与加密卡检测 |
| `/system/info` | SystemInfo | 系统信息 | 设备与网络信息 |
| `/system/network` | NetworkConfig | 网络配置 | 网络参数设置 |
| `/system/pool` | PoolConfig | 连接池配置 | 连接池参数 |
| `/system/admin` | AdminManage | 管理员管理 | 管理员账号 |
| `/system/permission` | Permission | 权限管理 | 权限分配 |
| `/system/ntp` | NTPConfig | NTP 时间源管理 | NTP 配置 |

### 面包屑机制

- 路由 `meta.breadcrumb` 定义静态面包屑路径
- `meta.dynamicBreadcrumb: true` 标记由页面（如密钥管理、证书管理的 Tab 切换）动态设置面包屑
- 通过 `composables/pageBreadcrumb.js` 中的 `setPageBreadcrumbItems()` 和 `applyBreadcrumbFromRoute()` 统一管理

---

## 6. 设计规范

定义在 `src/styles/variables.scss`：

### 颜色方案

| 变量 | 值 | 用途 |
|------|-----|------|
| `$primary-color` | `rgb(40, 122, 199)` | 主色调（按钮、链接、选中态） |
| `$success-color` | `#52c41a` | 成功状态 |
| `$warning-color` | `#faad14` | 警告状态 |
| `$danger-color` | `#ff4d4f` | 危险/错误状态 |
| `$sidebar-bg` | `#001529` | 侧边栏背景（深色） |
| `$content-bg` | `#f0f2f5` | 内容区背景（浅灰） |

### 布局尺寸

| 属性 | 值 |
|------|-----|
| 侧边栏宽度 | 200px（折叠 64px） |
| 顶部栏高度 | 50px |
| 圆角 | 2px |
| 字体 | Microsoft YaHei, Arial, sans-serif |
| 正文字号 | 14px |

---

## 7. 开发与构建

### 环境要求

- Node.js >= 16
- npm

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

启动后自动打开浏览器，开发服务器运行在 `http://localhost:3000`。

### 生产构建

```bash
npm run build
```

### 预览构建产物

```bash
npm run preview
```

---

## 8. 核心功能特性（完整列表）

### 有界面功能（T）

| 序号 | 功能 | 描述 | 优先级 |
|------|------|------|--------|
| 1 | GM/T 0019 密钥界面 | 0019 创建密钥界面 | P0 |
| 2 | 监控功能 | 系统状态、资源、SNMP 监控统一展示 | P0 |
| 3 | 白名单配置 | IP 白名单访问控制 | P0 |
| 4 | 一键检测 | 服务接口检测、加密卡检测 | P1 |
| 5 | 证书管理 | 按 DN/有效期搜索、黑名单管理 | P1 |
| 6 | zip 证书导入 | 支持 zip 格式导入 | P1 |

### 后台服务功能（F）

| 序号 | 功能 | 描述 | 优先级 |
|------|------|------|--------|
| 1 | XML 签名验签 | 支持封皮、封内、分离签名验签 | P0 |
| 2 | PDF 签名验签 | PDF 签名、验签、图章签名、多重签名 | P1 |
| 3 | 大文件签名验签 | 支持 2GB 以上大文件 | P0 |
| 4 | 加解密功能 | 对称/非对称加解密 | P0 |
| 5 | 部署模式 | 双机热备、负载均衡 | P1 |
| 6 | 818Key 适配 | USB Key 设备适配 | P0 |

---

## 9. 当前项目状态

- **阶段**：前端 UI/UX 原型演示
- **前端**：已实现所有核心功能界面，使用模拟数据
- **后端集成**：暂未实现（所有数据为前端 Mock）
- **当前开发分支**：`SVS_1.8.0`
