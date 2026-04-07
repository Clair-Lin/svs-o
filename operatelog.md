# 操作日志

## 2026-04-07（白名单搜索改为按钮触发）

- **`src/views/whitelist/WhitelistConfig.vue`**：搜索栏新增「查询」「重置」按钮；筛选逻辑由输入即筛选改为“点击查询后才生效”（引入 `appliedSearchIp/appliedSearchRemark` 作为已提交条件），并支持回车触发查询。

## 2026-04-07（侧栏系统管理图标修复）

- **`src/components/layout/Sidebar.vue`**：将「系统管理」菜单图标由 `Setting` 调整为 `Tools`，并在 `.el-sub-menu__title` 增加图标与文字颜色兜底（`color: #fff`），修复该菜单图标不显示问题。

## 2026-04-07（顶栏面包屑 · CA根证 / 证书管理示意图）

- **CA 根证**：去掉页面内重复 `el-breadcrumb`，仅保留顶栏（`Header`）面包屑；`CACert.vue` 用 `watchEffect` + `setPageBreadcrumbItems` 写入「签名验签服务 / CA根证管理 / 当前 Tab」；路由 `/cert/ca` 的 `meta` 改为 `dynamicBreadcrumb: true`。`src/views/cert/CACert.vue`、`src/router/index.js`。
- **证书管理**：对齐示意图——仅两 Tab「证书管理」「证书申请管理」；筛选为 **应用编号**、**应用证书名称** 与查询/重置；主按钮「导入加密证书」；表格十列：应用证书名称/主体DN、算法类型、版本号、证书分类、证书序列号、证书主体、证书状态、生效时间、到期时间、操作（查看）；默认空列表以呈现「暂无数据」；详情弹窗字段同步。移除页内面包屑（沿用顶栏三段路径）。`src/views/cert/CertManage.vue`。

## 2026-04-07（CA根证管理 · DN/有效期与黑名单）

- **`src/views/cert/CACert.vue`**：面包屑「签名验签服务 / CA根证管理 / 当前子页」；顶栏 `el-tabs`——**CA根证管理**（筛选：**DN**、**有效期**日期范围、查询/重置；导入根证书；列表不含已拉黑项；操作：查看、删除、加入黑名单；分页）；**黑名单管理**（导出、批量移出、多选表格、单行移出）。导入/详情弹窗；示例数据含一条已在黑名单的根证。

## 2026-04-07（证书管理 · DN/有效期与黑名单）

- **`src/views/cert/CertManage.vue`**：面包屑「签名验签服务 / 证书管理 / 当前子页」；顶栏 `el-tabs`——**证书管理**（筛选：证书编号、应用证书名称、**DN**、**有效期**（`daterange` + `value-format`）与查询/重置；「导入加密证书」；表格列对齐示意图：应用证书名称/密钥摘要、算法类型、颁发者、证书状态、生效/到期、操作；客户端筛选与分页）；**证书申请管理**（`el-empty` 占位）；**黑名单管理**（导出、批量移出黑名单、多选表格）。导入加密证书弹窗：证书名称、上传、证书保护密码、密钥访问口令；证书详情弹窗。

## 2026-04-07

- **白名单配置页增强**：`WhitelistConfig.vue` 与新建 `src/utils/whitelistIp.js`（IPv4/CIDR 校验、CIDR 转数值区间、与列表重叠检测；`ipToLong` 用乘法避免首段≥128 时位运算符号问题）。添加/编辑弹窗：类型「单个 IP / CIDR / IP 范围」动态表单项，备注、是否启用；表单校验 + 防抖重叠提示；展示当前条数/最大 1000。工具栏：批量删除、批量启用/禁用、批量导入（上传 txt/csv 或粘贴，每行 IP 或 CIDR）、导出 CSV（UTF-8 BOM）。列表：IP地址/段、类型、备注、状态开关、添加时间、最后修改人/时间；按 IP、备注筛选；客户端分页。删除确认文案含「删除后该 IP/网段将无法访问」；保存/批量/导入/行内启用开关后弹窗询问是否立即生效并说明热加载与重启建议。

- **白名单合并为单一界面**：侧栏「系统管理」下仅保留一项「白名单配置」`/system/whitelist`（去掉嵌套子菜单 `system-whitelist`）。新增 `WhitelistConfig.vue`：统一说明「访问 IP / P / 服务白名单」为同一策略（仅允许名单内应用服务器 IP 访问签名验签服务器）、连接白名单与密码机授权、本页支持添加/查看/删除（及编辑）；表格列「应用服务器 IP」；操作含查看弹窗、删除确认。删除 `IPWhitelist.vue`、`ServiceWhitelist.vue`。路由：`/system/whitelist` 为主；`/whitelist/ip`、`/whitelist/service`、`/system/whitelist/ip`、`/system/whitelist/service` 均重定向至 `/system/whitelist`。更新 `Sidebar.vue`、`src/router/index.js`。

- **白名单（系统管理下重新归类与界面）**：侧栏移除顶层「白名单配置」，在「系统管理」下增加嵌套子菜单「白名单配置」：`访问IP白名单（P）` → `/system/whitelist/ip`、`服务白名单` → `/system/whitelist/service`；`default-openeds` 增加 `system-whitelist`。路由：`/system/whitelist/ip`、`/system/whitelist/service`，原 `/whitelist/ip`、`/whitelist/service` 重定向到新路径；`meta.title` 同步。`IPWhitelist.vue`：面包屑「系统管理 / 白名单配置 / 访问IP白名单（P）」；标题与「功能说明」对齐 P 白名单、连接白名单/服务白名单配合说明；`el-alert` 与开关文案「启用P白名单」。`ServiceWhitelist.vue`：面包屑与功能说明对齐「白名单配置 / 连接白名单 / 授权认证」及添加查看删除；表格操作列「查看、编辑、删除」；弹窗支持查看（只读）、编辑、添加及删除确认。涉及 `Sidebar.vue`、`src/router/index.js`、`IPWhitelist.vue`、`ServiceWhitelist.vue`。

- **密钥管理界面（P1/P2 对齐）**：更新 `src/views/key/KeyManage.vue`。
  - **P1 列表页**：增加面包屑「签名验签服务 / 密钥管理」；筛选区为密钥 ID、密钥算法（含全部）、密钥用途（含全部）、添加时间范围及「查询」「重置」；主操作「生成密钥」「恢复密钥」；表格列为密钥索引、密钥 ID、密钥算法及用途（双行展示）、副本状态（含说明图标）、添加时间、操作（详情、备份、销毁、查看密钥访问口令）；分页按筛选结果总数切片展示。
  - **P2 详情弹窗**：标题「密钥详情」；键值行展示密钥 ID、密码算法及用途（`算法 | 用途`）、副本状态（绿色）、添加时间（毫秒时间戳，与参考示意一致）。
  - **创建密钥（方案 B：双 Tab）**：弹窗内 `el-tabs`——**常用**：密码算法、密钥用途（复选）、密钥长度、密钥访问口令；**GM/T 0019-2023**：应用接口句柄 `hAppHandle`、密钥容器名 `pucContainerName`、容器名 UTF-8 字节长度（只读，对应 uiContainerLen/uiContainerNameLen）、与常用联动的密码算法与密钥模长 `uiKeyBits`、`uiKeyUsage`（SM2/RSA 分支选项）、`uiExportFlag`。去掉原「0019 补充参数」折叠区。`src/constants/gmt0019.js` 改为导出 `SM2_KEY_USAGE_OPTIONS`、`RSA_KEY_USAGE_OPTIONS`、`EXPORT_FLAG_OPTIONS`。
- **撤销独立 0019 页**：删除 `src/views/key/KeyCreate0019.vue`，移除路由 `/key/create-0019` 及侧栏「0019创建密钥」。

## 2026-04-07（续）

- **密钥管理按 GM/T 0029 / 0019 分界面（方案 A）**：`/key/manage` 重定向至 `/key/manage/0029`；新增路由 `/key/manage/0029`（`KeyManage0029.vue`，GM/T 0029 产品样式：列表列 密钥索引/密钥ID/密钥算法/密钥用途/密钥长度/添加时间/操作；生成密钥为四字段弹窗）、`/key/manage/0019`（`KeyManage0019.vue`，原双 Tab 0019 逻辑）；删除原 `KeyManage.vue`。更新 `src/router/index.js`。
- **侧栏结构**：「签名验签服务」下增加嵌套子菜单「密钥管理」，其下两个子页面菜单项：`GM/T 0029`、`GM/T 0019-2023`（分别对应 `/key/manage/0029`、`/key/manage/0019`）；`el-menu` 设置 `default-openeds` 含 `sign-service`、`key-manage` 便于展开。更新 `src/components/layout/Sidebar.vue`。

## 2026-04-07（证书式顶栏 Tab）

- **密钥管理与证书管理一致的单页双 Tab**：新增 `src/views/key/KeyManage.vue`（`page-card` + 面包屑「签名验签服务 / 密钥管理 / 当前 Tab 名」+ 顶栏 `el-tabs`：`GM/T 0029`、`GM/T 0019-2023`）；内容分别为 `KeyManage0029Panel.vue`、`KeyManage0019Panel.vue`（无独立面包屑）。新增 `KeyManage0019Panel.vue`；删除整页 `KeyManage0029.vue`、`KeyManage0019.vue`。
- **路由**：`/key/manage` 指向 `KeyManage.vue`；`/key/manage/0029`、`/key/manage/0019` 仅 **redirect** 至 `/key/manage?tab=0029` 与 `/key/manage?tab=0019`（兼容旧链接）。`src/router/index.js`。
- **侧栏**：「签名验签服务」下恢复 **单菜单项**「密钥管理」`index="/key/manage"`；`default-openeds` 仅 `sign-service`。`src/components/layout/Sidebar.vue`；`/key/manage` 路径高亮统一为该项。

## 2026-04-07（密钥 Panel 弹窗与样式对齐）

- **0019 生成密钥**：去掉弹窗内「常用 | GM/T 0019」双 Tab，**仅保留 GM/T 0019-2023 单表单**（顶部说明 `el-alert` + hAppHandle / 容器名 / 容器名长度 / 算法 / 模长 / uiKeyUsage / 导出）；移除 `usage`、`password` 及对应校验。`src/views/key/KeyManage0019Panel.vue`。
- **0029 / 0019 样式统一**：两 Panel 根节点统一 `class="key-panel"`；生成密钥弹窗统一 **宽度 560px**、`label-width="120px"`；详情弹窗标签列统一 **120px**。`KeyManage0029Panel.vue`、`KeyManage0019Panel.vue`。

## 2026-04-07（0019 列表列拆分）

- **GM/T 0019 列表**：原「密钥算法及用途」合并列改为 **「密钥算法」**（`algorithmSpec`）、**「密钥用途」**（`usageLabel`）两列，宽度与 0029 侧列表风格一致（各 120px）。详情弹窗同步为两行展示算法与用途。`src/views/key/KeyManage0019Panel.vue`。

## 2026-04-07（密钥管理 Tab / 面包屑规范全称）

- **名词区分**：`KeyManage.vue` 增加 `tabCopy`，顶栏 Tab 为「GM/T 0029-2014 签名验签服务器」「GM/T 0019-2023 通用密码服务接口」；面包屑第三段为「GM/T 0029-2014 · 签名验签服务器技术规范」「GM/T 0019-2023 · 通用密码服务接口规范」。
- **提示文案**：0019 生成密钥 `el-alert` 与成功 `ElMessage`、0029 成功提示、`src/constants/gmt0019.js` 文件头注释、`src/router/index.js` 路由注释，与上述规范名称对齐。

## 2026-04-07（0019 生成密钥表单按标准枚举）

- **密钥类型**：原「密码算法 + 密钥模长」改为单一下拉 **密钥类型**，选项 `1：SM2`～`5：RSA4096`。**密钥长度**为只读，由类型映射比特长度（`KEY_TYPE_TO_BITS_0019`，占位 `uiKeyBits[in]`）。
- **密钥用途**：选项改为 `1：加密`、`2：签名`、`3：密钥交换`。
- **导出**：单选项文案改为「不可导出」「可导出」（仍为 `uiExportFlag` 0/1）。
- `src/constants/gmt0019.js` 导出 `KEY_TYPE_OPTIONS_0019`、`KEY_USAGE_OPTIONS_0019`、`KEY_TYPE_TO_BITS_0019`，移除原 `SM2_KEY_USAGE_OPTIONS` / `RSA_KEY_USAGE_OPTIONS`。`KeyManage0019Panel.vue` 表单与 `keyForm` 字段同步调整。
- **0019 下拉文案**：密钥用途展示为「加密」「签名」「密钥交换」；密钥类型为「SM2」「RSA1024」…「RSA4096」（无数字前缀）。修复 `KEY_TYPE_TO_BITS_0019` 类型→比特映射对象。

## 2026-04-07（FeatureList 界面）

- **监控总览（对齐 FeatureList 监控功能）**：`src/views/Dashboard.vue` 增加页头说明；分块标题「系统状态与资源」「业务统计」「网络监控」「SNMP 监控」「服务与连接」「告警」；设备信息增加**连接数**；新增业务指标网格（管理员访问、证书/用户/应用实体数量、并发连接、签名/验签、制作/解信封）；新增**网络接口状态**表；SNMP 卡片标题改为「SNMP 服务与采集指标」；示例时间改为 2026。
- **导航与路由标题**：侧栏与 `meta.title` 由「设备资源」改为「监控总览」。`Sidebar.vue`、`src/router/index.js`。
- **一键检测**：服务接口说明与进度文案对齐「获取服务器证书、签名、验签」；结果表核心三项 + 全部检测时附加加密/证书/管理接口；按检测类型汇总检测项数量。`src/views/Detect.vue`。
- **白名单文案**：IP 白名单、服务白名单页顶 `el-alert` 与 FeatureList 中访问控制描述一致。`IPWhitelist.vue`、`ServiceWhitelist.vue`。

## 2026-04-07（监控总览调整）

- **业务统计**：去掉「管理员访问次数」指标。`src/views/Dashboard.vue`
- **SNMP**：移除整段 SNMP 监控 UI 与 `snmpMetrics` 等数据；删除相关样式。
- **告警**：整块「系统告警」用 `showAlarmSection`（默认 `false`）控制，暂隐藏；需恢复时将 `showAlarmSection` 改为 `true`。
- **文案**：页头说明与 `router/index.js` 中监控路由注释去掉 SNMP 表述，与当前页面一致。

## 2026-04-07（监控总览 · 网络并入基本信息）

- **设备基本信息卡片**：按示意图改为「健康状态 + CPU 型号 + CPU 核数」行式展示；其下 **网络状态**（管理端口/服务端口 + 状态徽标）、**网口列表** 表（网口、IP、流量列内上下行 Mb/s）。移除独立「网络监控」分块与原 `networkInterfaces` 宽表。
- **数据**：`deviceBasic`、`networkPorts`、`nicTrafficList` 示例值与参考图一致（含 lo / eth0 流量）。`src/views/Dashboard.vue`；监控总览页头说明同步。

## 2026-04-07（监控总览 · 使用率环形图）

- **CPU / 内存 / 硬盘**：由半圆仪表盘改为 **ECharts 环形图**（`#1890ff` 已用 + `#f0f0f0` 底环）；CPU 卡片内居中展示；内存、硬盘为 **左侧环图 + 右侧**「已使用」「可用/全部」文案，示例数值与设备资源示意图一致（CPU 6.7%、内存 56.71% / 4.29G / 3.28G&7.57G、硬盘 13.44% / 8.22G / 52.97G&61.19G）。`src/views/Dashboard.vue`

## 2026-04-07（监控总览 · 服务状态精简）

- **服务状态表**：去掉「监控服务」「管理服务」两行，仅保留签名 / 加密 / 证书；`totalServiceConnections` 按三行 connections 汇总改为 42。`src/views/Dashboard.vue`

## 2026-04-07（一键检测 · 菜单与页面精简）

- **侧栏**：「一键检测」从顶层移至 **系统管理** 子菜单最后一项；`default-openeds` 增加 `system` 以便展开。`Sidebar.vue`
- **路由**：正式路径改为 `/system/detect`；原 `/detect` **redirect** 至 `/system/detect`。`src/router/index.js`
- **Detect 页**：服务接口仅保留证书/签名/验签三项，加密卡为描述列表；汇总按所选检测范围统计。`src/views/Detect.vue`

## 2026-04-07（一键检测 · 恢复分块）

- **分块检测**：恢复三块可选——**全部检测**、**服务接口检测**、**加密卡检测**；进度步骤随类型变化。（后续统计项与 UI 以「系统自检式布局」条为准。）`src/views/Detect.vue`

## 2026-04-07（一键检测 · 系统自检式布局）

- **布局对齐参考图**：面包屑「系统管理 / 一键检测」；`el-tabs` 首项「一键检测」+「业务自检」「服务探测」占位（disabled）。
- **工具区**：检测方式「全局检测 / 节点检测」（原型展示）；保留三块检测范围；**开始检测** + 全宽进度条（完成后 100%，成功/失败配色）。
- **统计卡**：整体状态、检测项总数、正常、警告、异常（五卡横排，响应式降级）。
- **分块结果**：检测对象标题行；`el-collapse` — **服务接口检测**（行式：图标 + 接口名 + 元数据 + 标签）、**加密卡检测**（连接/健康两项）、**检测汇总**（文字 + 完成时间）。
- **计数**：含加密卡时按 **连接 + 健康** 2 子项计入总数（全部模式共 5 项）。`src/views/Detect.vue`

## 2026-04-07（一键检测 · 去页签与汇总折叠）

- 去掉 `el-tabs` 及占位分页，仅保留 **一键检测** 页（面包屑 + 卡片标题）。
- **检测内容**：单行 `el-radio-button` — 全部检测 / 服务接口检测 / 加密卡检测（取代原「检测方式」+ 三卡片）。
- 保留顶部 **五卡统计**；删除底部 **检测汇总** `el-collapse-item`；完成时间改在统计卡下方一行展示。
- `src/views/Detect.vue`

## 2026-04-07（一键检测 · 切换内容清空结果）

- 切换「检测内容」单选项时 **清空** 统计卡、分块结果、进度与完成时间；若正在检测则 **清除定时器** 并结束检测中状态。`src/views/Detect.vue`

## 2026-04-07（0019 生成密钥 · 类型与长度简化）

- **密钥类型**仅 **SM2**、**RSA**；**密钥长度**为下拉，SM2 仅 **256**、RSA 仅 **2048**（`KEY_LENGTHS_BY_TYPE_0019`），切换类型时 `syncKeyLengthForType` 自动校正当前长度。
- 移除 **容器名长度**表单项及 `uiContainerLen` 计算属性。
- `gmt0019.js`：以 `KEY_LENGTHS_BY_TYPE_0019` 取代原 `KEY_TYPE_TO_BITS_0019` 与多档 RSA 类型枚举。
