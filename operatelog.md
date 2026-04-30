# 操作日志

## 2026-04-30（密钥管理 · 0019 导入容器与绑定证书三步流程）

- **`src/views/key/KeyManage0019Panel.vue`**：按新要求将“上传证书”改为“关联应用证书”流程；列表与详情中的入口按钮统一为 **关联证书**。
- **`src/views/key/KeyManage0019Panel.vue`**：新增「**关联已有应用证书**」弹窗（表格列：应用证书名称/ID、算法、颁发者、证书序列号、申请日期、到期时间），支持单选后确认回填到绑定流程。
- **`src/views/key/KeyManage0019Panel.vue`**：绑定弹窗第一步改为“关联证书”按钮，不再出现本地上传控件；第二步预览与匹配校验改为基于已关联应用证书信息。
- **`package.json` / `package-lock.json`**：移除 `jsrsasign`（当前改为关联证书，不再做本地文件解析）。
- **`src/views/key/KeyManage0019Panel.vue`**：工具栏按钮由「恢复密钥」改为 **导入容器**，提示文案同步为容器导入语义。
- **`src/views/key/KeyManage0019Panel.vue`**：列表操作新增 **绑定证书/更换证书**（按绑定状态动态文案）；绑定证书列改为显示已绑定证书 CN（未绑定显示「未绑定」）。
- **`src/views/key/KeyManage0019Panel.vue`**：新增“绑定证书”弹窗三步交互（选证书文件 → 解析预览 → 确认绑定），支持 `.cer/.pem/.der` 选择、用途单选（签名/加密，按容器密钥对能力置灰）、解析后展示主体/颁发者/序列号/有效期/公钥算法/用途，并给出算法一致性与用途匹配校验提示（不阻断确认）。
- **`src/views/key/KeyManage0019Panel.vue`**：确认绑定成功后更新该容器绑定证书信息，失败时在弹窗内显示错误信息并保持弹窗不关闭（原型通过文件名包含 `fail` 触发失败演示）。
- **`src/views/key/KeyManage0019Panel.vue`**：密钥详情弹窗增加 **证书信息** 区域，展示签名/加密两套证书的 CN、颁发者、有效期及操作（查看、更换/绑定），与列表快捷入口互补。

## 2026-04-30（密钥管理 · 0019 容器管理界面按图调整）

- **`src/views/key/KeyManage0019Panel.vue`**：保持页签标题不变，仅调整「通用密码服务接口密钥」内容为容器管理形态；列表列改为 **容器名 / 算法 / 用途 / 绑定证书 / 添加时间 / 操作**，操作保留 **详情 / 备份 / 销毁**。
- **`src/views/key/KeyManage0019Panel.vue`**：生成弹窗改为 **生成容器**，字段对齐示意逻辑：**容器名（唯一）/ 密码算法 / 密钥用途 / PIN**；提示文案改为容器生成成功。
- **`src/views/key/KeyManage0019Panel.vue`**：详情弹窗改为展示 **容器名 / 密码算法 / 密钥用途 / 公钥内容 / 绑定证书 / 添加时间**，并补充示例数据中的绑定证书状态与公钥内容展示。

## 2026-04-21（密钥管理 · 备份 UKEY / 销毁与查看口令二次认证）

- **`src/views/key/KeyManageSecurityModals.vue`**（新）：备份流程弹窗「请选择UKEY」— 先展示「控件检测中...」，检测完成后选择 UKEY 再确定；销毁先 `ElMessageBox`「温馨提示 / 确定要销毁此密钥吗？」再打开「二次认证」管理密码；查看密钥访问口令直接走「二次认证」，通过后展示口令（均为原型演示）。
- **`src/views/key/keyManageSecurityKey.js`**（新）：导出 `KEY_MANAGE_SECURITY_KEY` 供父级 `provide`、子面板 `inject`。
- **`src/views/key/KeyManage.vue`**：挂载 `KeyManageSecurityModals` 并向子面板注入组件实例引用；移除未使用的 `computed` 导入。
- **`src/views/key/KeyManage0029Panel.vue`**、**`src/views/key/KeyManage0019Panel.vue`**：备份 / 销毁 / 查看口令改为调用注入的安全弹窗方法。

## 2026-04-14（监控总览 · 证书数量悬浮明细）

- **`src/views/Dashboard.vue`**：数据统计区「证书数量」增加信息图标悬浮提示，展示证书细分数量：**根证书 24 张**、**签名证书 72 张**、**用户证书 60 张**。
- **`src/views/Dashboard.vue`**：固定统计项支持按项配置 `detailLines` 明细并在有明细时显示 tooltip，其他统计项保持原展示不变。

## 2026-04-14（监控总览 · 跨月提示交互）

- **`src/views/Dashboard.vue`**：移除业务筛选区“当前口径：自然月统计（按日仅支持月内）”文案，不再在界面常驻显示该提示。
- **`src/views/Dashboard.vue`**：日期区间取消禁选跨月日期，改为在用户选择跨月区间时弹出错误提示 **「暂不支持跨月查询」**，并回退到当前月份合法区间。

## 2026-04-14（监控总览 · 业务单位展示调整）

- **`src/views/Dashboard.vue`**：业务数据卡片将单位从底部独立行调整为挂在业务名称右侧（如「签名业务 次」），单位字体大小保持不变。
- **`src/views/Dashboard.vue`**：单位文案由动态括号说明（如 `次（今日）`、`次（3天合计）`）统一为 `次`，去除括号内附加内容。

## 2026-04-14（监控总览 · 业务筛选二次精简）

- **`src/views/Dashboard.vue`**：按反馈将快捷项精简为 **今日 / 昨日 / 本月**；移除原“统计口径/统计维度”切换控件，仅保留快捷操作。
- **`src/views/Dashboard.vue`**：筛选控件保留 **月份下拉** 与 **日期区间**；月份变化时自动将日期区间重置为该月范围（当月为月初至今日）。
- **`src/views/Dashboard.vue`**：日期区间继续限制为所选月份内，跨月选择自动回退到当前月份合法区间，保证“不跨月”规则。

## 2026-04-14（监控总览 · 业务统计时间筛选口径）

- **`src/views/Dashboard.vue`**：业务数据筛选区改为「统计口径 + 统计维度 + 快捷筛选」结构；新增 **自然月（不跨月）** 口径说明、维度切换（按月 / 按日（月内））及对应快捷项（按月：本月/上月/近3个月/近6个月；按日：本月至今/本月前7天/本月前15天）。
- **`src/views/Dashboard.vue`**：按日模式新增「月份 + 日期区间」联动，日期选择限制在所选月份内，避免跨月统计；按月模式支持 `monthrange`。
- **`src/views/Dashboard.vue`**：统计计算统一基于 `bizEffectiveRange`，按月维度自动换算为起止月的自然日区间，保证示例数据缩放与单位文案一致。

## 2026-04-09（CA根证管理 · 列表列名）

- **`src/views/cert/CACert.vue`**：列表列标题由「CA证书主题（DN）」改为 **「CA证书（DN）」**。

## 2026-04-09（CA根证管理 · CA 证书链独立页与推送 GitHub）

- **`src/views/cert/CACertChain.vue`**（新）：**返回**、标题「CA-证书链」、表格列（证书 SN、证书 DN、签发者 DN、证书生效/失效时间、算法类型）。从列表进入时通过 `history.state.caCertRow` 携带当前行；直接打开 URL 时用与列表一致的 `FALLBACK_CA_ROWS`。内置 id=1 与参考示意图一致的 SN/时间（DN 仍取自当前行）；id=2/3 为两层链演示，id=4 为 ML-DSA 单根；其余/新增行为单根自签样式并由 `certLabel`、有效期等推导。
- **`src/views/cert/CACert.vue`**：点击 **CA证书** 链式按钮跳转 `CACertChain`（`router.push` + `state`），移除原「CA根证详情」弹窗。
- **`src/router/index.js`**：新增 `/cert/ca/chain/:id`（`CACertChain`），顶栏面包屑为「签名验签服务 / CA根证管理 / CA-证书链」，其中「CA根证管理」可点回列表。
- **`docs/界面功能说明.md`**：标题改为「SVS签名验签1.8.0 原型」；文档范围句略作精简。
- **`src/views/Dashboard.vue`**：去除误加的 UTF-8 BOM（与 `main` 内容一致，不纳入本次功能 diff）。

## 2026-04-09（一键检测 · 证书前置说明与异常提示）

- **`src/views/Detect.vue`**：在「检测方式」上方增加 **warning** 前置说明：检测前需上传 **CA 根证**、**用户证书**，并说明证书问题将提示重新上传。证书相关接口异常时，结果区顶部 **error** 提示「未检测到证书，请重新上传。」；明细行在异常项下追加同文案。新增 `isCertRelatedServiceRow`、`buildServiceResultsForRun`、`DEMO_SIMULATE_CERT_MISSING`（默认 `false` 全正常；置 `true` 时原型模拟证书缺失以预览提示）。
- **`docs/界面功能说明.md`**：「五、一键检测」补充前置提示与证书类异常说明，并注明 `DEMO_SIMULATE_CERT_MISSING` 演示开关。

## 2026-04-09（文档 · 界面功能说明）

- **新增** `docs/界面功能说明.md`：按路由与页面实现汇总**全部界面**的功能说明；含侧栏可见性与 URL 对照、重定向与已删除路由说明，以及监控总览、应用/密钥/证书/CA、系统各子页与白名单、一键检测等章节。
- **`docs/界面功能说明.md` 改写**：改为**按功能域**组织（运行监控、密钥生命周期、证书与信任、访问控制、对接应用、运行环境、账号权限、健康检查等），弱化路径/侧栏/路由表；文末保留简短原型预期说明。
- **`docs/界面功能说明.md` 再改**：明确**仅原型、仅侧栏已开放菜单**（设备资源、密钥管理、CA根证、白名单、一键检测）；删除对已隐藏入口（应用/证书/用户证书/系统信息等）的功能说明；补充菜单与章节对照表与附言。

## 2026-04-09（密钥管理 · 0019 是否可导出为「是/否」）

- **`src/constants/gmt0019.js`**：`EXPORT_FLAG_OPTIONS` 文案由「不可导出/可导出」改为 **「否 / 是」**（`uiExportFlag` 仍为 0/1）。
- **`src/views/key/KeyManage0019Panel.vue`**：列表与详情示例 `exportableLabel` 改为 **「是」「否」**；生成密钥表单项标签改为 **是否可导出**，校验提示同步。

## 2026-04-09（CA根证管理 · DN 搜索与示例数据）

- **`src/views/cert/CACert.vue`**：筛选区增加 **DN** 输入，与 CA 名称、有效期一并参与「查询」。**DN 模糊查询**：`dnFuzzyMatch` 对 `certLabel` 做小写、去空白后比对；支持空格/中英文逗号/顿号拆成多关键字，**全部子串命中** 即保留（顺序不限）。占位与输入框宽度略加宽。列表默认数据为示意图四条并补全生效/过期；**CA证书** 链式详情；**操作** 含上传下级证书/CRL/OCSP/删除；底部分页与 `pagedList` 行为同前。

## 2026-04-09（系统管理 · 移除服务管理界面）

- **`src/router/index.js`**：删除 `/system/service`（服务管理）路由。
- **`src/components/layout/Sidebar.vue`**：系统管理子菜单移除「服务管理」项。
- **`src/views/system/Permission.vue`**：权限树「系统管理」下移除「服务管理」节点；超级管理员默认勾选去掉对应 id `33`。
- **删除** `src/views/system/ServiceManage.vue`。

## 2026-04-09（监控总览 · 设备资源区布局）

- **`src/views/Dashboard.vue`**：「系统状态与资源」区仅调整布局与尺寸——**第一行** 为两列网格：**设备基本信息** 与 **网络状态**（独立卡片，原内嵌网络块提升为同级卡片）；**第二行** 三列并排：**CPU 使用率**、**内存使用率**、**硬盘使用率**。新增 `.card-grid--device-row`、`.card-grid--usage-row`、`.network-status-card`、`.usage-rate-card` 及紧凑环形图相关样式，文案与数据绑定不变。

## 2026-04-08（Git · 推送至 GitHub）

- 已将本地 `main` 推送到 `https://github.com/Clair-Lin/svs18.git`（含原型各页面与 operatelog 等提交）。

## 2026-04-08（一键检测 · 服务接口增加云签名四类检测）

- **`src/views/Detect.vue`**：服务接口检测列表增加 **获取随机数**（`/cloud_sign_svs/cert/generateRandom`）、**导出证书**（`/cloud_sign_svs/cert/ExportCert`）、**数据签名**（`/cloud_sign_svs/cert/SignData`）、**数据验签**（`/cloud_sign_svs/cert/VerifySignedData`）；与现有三项共用占位主机 `https://192.168.1.100:443` 拼接完整 URL；`STEPS_SERVICE`、`STEPS_ALL` 进度与状态文案同步为 7 项服务接口（含上述四类）+ 完成/加密卡/汇总。

## 2026-04-08（白名单配置 · 按示意图精简，无启用禁用）

- **`src/views/whitelist/WhitelistConfig.vue`**：界面与示意图对齐——工具栏仅 **新增**、**删除**（多选批量）；表格列 **IP白名单**、**操作**（行内删除）；去掉全局/行内 **启用禁用**、筛选、查看编辑、备注与时间列、配额行与「立即生效」确认链。新增弹窗标题 **新增IP白名单**，必填多行输入，占位与说明文案支持英文逗号分隔及 `*`、`/xx`（1~32）网段；一次提交可解析多条并做与列表及批次内重叠校验。示例数据改为三条 `segment` 结构。
- **`src/utils/whitelistIp.js`**：新增 `wildcardIpv4ToRange`、`segmentToRange`、`isValidWhitelistSegment`、`parseCommaSeparatedSegments`；`cidrToRange` 支持 `allowPrefixZero`，白名单场景 CIDR 前缀限制为 **1~32**；`rowToNumericRange` / `displayIpSegment` / `parseImportLine` 支持 `segment` 字段及 `*` 网段解析。

## 2026-04-08（CA根证管理 · 有效期筛选与生效/过期列）

- **`src/views/cert/CACert.vue`**：筛选区增加 **有效期**（日期范围）；表格增加 **生效时间**、**过期时间** 列；查询按 CA 名称 + 证书有效期与区间 **交集** 过滤；添加表单必填 **生效/过期** 日期；详情展示对应字段。

## 2026-04-08（CA根证管理 · 按示意图精简）

- **`src/views/cert/CACert.vue`**：去掉 **黑名单管理** Tab 及全部黑名单逻辑；页面改为 **CA名称** 筛选（占位「请输入CA名称」）+ **查询/重置**、**添加**；表格列 **CA名称 / CA描述 / CA证书 / 操作**（查看、删除）；默认无数据展示 **暂无数据**；添加弹窗含 CA 名称、描述、证书文件选择；详情弹窗同步字段。
- **`src/router/index.js`**：`/cert/ca` 使用静态面包屑「签名验签服务 / CA根证管理」，移除 `dynamicBreadcrumb`。

## 2026-04-08（密钥管理 · 通用密码服务接口 · 移除副本状态）

- **`src/views/key/KeyManage0019Panel.vue`**：列表与密钥详情中删除 **副本状态**；去掉示例数据中的 `replicaCurrent` / `replicaTotal` 及 `QuestionFilled`、相关样式。

## 2026-04-08（密钥管理 · 通用密码服务接口 · 口令与用途与导出列）

- **`src/constants/gmt0019.js`**：密钥用途拆分为 **`KEY_USAGE_OPTIONS_SM2_0019`**（签名、密钥交换协议、加密）与 **`KEY_USAGE_OPTIONS_RSA_0019`**（签名、密钥交换（加密））；移除原统一列表 `KEY_USAGE_OPTIONS_0019`。
- **`src/views/key/KeyManage0019Panel.vue`**：生成密钥表单增加与签名验签服务器一致的 **密钥访问口令**（必填、6–32 字符）；密钥用途随 **SM2 / RSA** 切换选项；列表增加 **是否可导出** 列；筛选「密钥用途」与示例数据、详情弹窗同步；详情中「添加时间」改为展示可读时间字符串。

## 2026-04-08（密钥管理 · 签名验签服务器 · 密钥用途按算法限制）

- **`src/views/key/KeyManage0029Panel.vue`**：**SM2 / RSA** 下「密钥用途」可同时选 **签名验签**、**加密解密**；**SM4 / 3DES / AES** 下 **签名验签** 禁用且切换为该算法时自动将用途设为仅 **加密解密**。

## 2026-04-08（密钥管理 · 签名验签服务器算法与密钥长度）

- **`src/views/key/KeyManage0029Panel.vue`**：「密码算法」筛选与「生成密钥」中「密钥算法」含 **SM2 / RSA / SM4 / 3DES / AES**；`KEY_SIZES_BY_ALGORITHM` 固定为 **SM2→256**、**RSA→2048**、**SM4→128**、**3DES→112**、**AES→128**；切换算法时自动将密钥长度设为对应值。

## 2026-04-08（监控总览 · 制作解信封无悬浮明细）

- **`src/views/Dashboard.vue`**：**制作信封**、**解信封** 不再配置 `detail`、无 **P1/P7 悬浮内容**，且不展示信息图标；仅 **签名业务 / 验签业务** 保留两列悬浮明细。

## 2026-04-08（监控总览 · 悬浮按签名/验签业务裁剪）

- **`src/views/Dashboard.vue`**：悬浮明细按业务类型裁剪：`签名业务` 仅显示 `P1/P7 签名成功/失败`；`验签业务` 仅显示 `P1/P7 验签成功/失败`；其余业务仍展示完整两列明细。

## 2026-04-08（监控总览 · 业务数据悬浮改为P1/P7两列）

- **`src/views/Dashboard.vue`**：业务数据提示框内容改为两列展示：左列 `P1` 四项（签名成功/失败、验签成功/失败），右列 `P7` 四项（签名成功/失败、验签成功/失败）；新增 `.biz-detail-tooltip-grid` 双列布局样式。

## 2026-04-08（监控总览 · 业务数据增加总和）

- **`src/views/Dashboard.vue`**：业务数据每项在“成功、失败”之外新增“**总和（成功+失败）**”一行；同时把“成功总数/失败总数”文案恢复为“成功/失败”。

## 2026-04-08（监控总览 · 业务数据悬浮细项与对齐）

- **`src/views/Dashboard.vue`**：业务数据每项的悬浮内容改为 8 个明细：`P1 签名成功/失败`、`P1 验签成功/失败`、`P7 签名成功/失败`、`P7 验签成功/失败`；使用 `el-tooltip` 内容插槽按行展示。
- **`src/views/Dashboard.vue`**：业务数据卡改为 `成功总数 / 失败总数` 文案；成功失败数据文本改为左对齐，同时通过固定内容宽度 + 自动外边距保持整体视觉居中。

## 2026-04-08（监控总览 · 业务统计改版与服务连接移除）

- **`src/views/Dashboard.vue`**：删除「**服务与连接**」整块（模板、`serviceList` 数据与 `.service-status` 样式）。
- **`src/views/Dashboard.vue`**：业务统计「数据统计」去掉 **用户数量** 指标。
- **`src/views/Dashboard.vue`**：业务数据改为每项 **成功/失败** 双统计；新增悬浮提示图标（`InfoFilled` + `el-tooltip`），展示 **P1 / P7 / 多包** 细分信息；示例数据按时间区间缩放后分别展示成功与失败次数。

## 2026-04-08（一键检测 · 加密卡检测隐藏详情）

- **`src/views/Detect.vue`**：`加密卡检测` 分类行不再展示 `metaLines` 详细信息，仅保留检测项名称与状态结果。

## 2026-04-08（一键检测 · 加密卡检测单项化）

- **`src/views/Detect.vue`**：加密卡检测由「连接 + 健康」两项调整为单项 **加密卡状态**（是否连接正常）；结果明细仅保留该单项，汇总卡中的检测项总数/正常/异常按新口径统计。

## 2026-04-08（一键检测 · 结果区卡片对齐示意图）

- **`src/views/Detect.vue`**：有结果时于 **检查结果** 卡内展示 **五张汇总卡**（整体状态、检测项总数、正常/警告/异常）；**完成时间** 下增加 **检测对象** 灰条（左 `targetLabel`、右 `x/y 正常` 配色）；下方 **服务接口检测 / 加密卡检测** 为 **分类独立折叠**（标题 + `N项` 角标 + 右侧箭头）；明细行 **左圆标、中名称+多行灰字（接口地址/响应时间等）、右状态色字**；移除原单层大折叠与 `el-tag` 行样式；删除未用 **`SuccessFilled`** 引用。

## 2026-04-08（一键检测 · 范围对齐服务接口+加密卡）

- **`src/views/Detect.vue`**：一键检测定位为 **服务接口检测** 与 **加密卡检测**；结果分类中移除 **许可证授权**、**基础设施服务**；汇总条去掉 **节点总数/正常/告警/异常** 四卡，仅保留 **整体状态**；`summary` 不再写入节点字段；注释与样式类说明同步（无多节点维度）。

## 2026-04-08（一键检测 · 去掉节点标题行）

- **`src/views/Detect.vue`**：检查结果 **节点大卡** 头部去掉 **显示器图标** 与 **「未命名节点 (IP)」** 文案；删除仅用于该展示的 `nodeDisplayName`、`resultTargetLabel` 及对应样式；移除未再使用的 **`Monitor`** 图标引用。

## 2026-04-08（监控总览 · 业务统计时间维度）

- **`src/views/Dashboard.vue`**：业务统计拆为 **固定项**（证书/用户/应用实体/并发连接）**单行横向指标**（参考示意图：上标签、下数值、竖线分隔）；中间 **时间维度** 工具栏（今天/昨天/近7天/近30天 + 日期区间）仅作用于下方 **「时间范围内」** 卡片；该卡片内 **签名/验签/制作信封/解信封** 为随筛选变化的示例数据（按日基准 × 区间天数，绿/蓝数值样式）；**无**「密码机运行概况」模块；挂载默认「今天」。

## 2026-04-08（监控总览 · 业务统计昨日与日期宽度）

- **`src/views/Dashboard.vue`**：**昨日** 单日区间使用 **yesterdayScale** 与今日区分示例量；单位 **次（今日）/ 次（昨日）/ 次（所选日）/ 多天合计**；日期区间 **`size="small"`**，宽度 **220px**。

## 2026-04-08（监控总览 · 时间维度并入时间范围内卡片）

- **`src/views/Dashboard.vue`**：**时间维度** 工具栏移入 **「时间范围内」** `page-card` 内（标题下、指标条上）；**`biz-time-toolbar--embedded`** 去掉独立卡片边框与阴影，底部分隔线与下方统计行衔接。

## 2026-04-08（0019 生成密钥 · 去掉应用接口句柄）

- **`src/views/key/KeyManage0019Panel.vue`**：删除 **应用接口句柄**（`hAppHandle`）表单项、`keyForm` 字段、校验规则及打开弹窗时的重置赋值。

## 2026-04-08（密钥管理 · 搜索栏布局）

- **`src/views/key/KeyManage0029Panel.vue`**、**`src/views/key/KeyManage0019Panel.vue`**：搜索区改为 **白底工具栏**（`key-search-toolbar`）；条件项 **左侧文案标签**（密钥ID、**密码算法**、密钥用途、添加时间）+ 控件横向排列；下拉默认文案 **「全部」**；**添加时间** 区间分隔符改为 **「-」**；**查询 / 重置** 与条件同排；样式使用 **`variables.scss`** 间距与边框变量。

## 2026-04-08（一键检测 · 汇总条位置与导出按钮）

- **`src/views/Detect.vue`**：**五张汇总卡**移至 **一键检测卡片** 与 **检查结果卡片** 之间的 **`detect-stat-strip`**（透明、无底板样式）；**导出报告** 仅在已有 **`summary`**（已出检查结果）时 **`v-if` 显示**。

## 2026-04-08（一键检测 · 检查结果样式参考图）

- **`src/views/Detect.vue`**：检查结果区参考示意图——**工具栏**「检查结果」+ **导出报告**（`Download` 图标、原型提示）；**五张汇总卡**（整体状态 / 节点总数 / 正常·告警·异常节点，`个` 后缀、白底浅阴影）；**节点结果大卡**（可折叠头部：箭头、`Monitor`、未命名节点+IP、四色圆点汇总、`inspectItemStats` 与分类项数一致、状态 `el-tag`；异常时红框）；**分类列表**（`（N项）` 标题、左侧状态 `el-tag`+名称+灰色说明）；**全部检测** 下增加示意分类「基础设施服务」MySQL/Redis；许可证授权为样式占位项。

## 2026-04-08（一键检测 · 检查结果独立模块）

- **`src/views/Detect.vue`**：**检查结果** 单独使用第二个 **`page-card`**（`results-module`），与上方「一键检测」操作区分块；根节点 `.detect` 使用纵向间距串联两卡；原 `results-block__title` 改为卡片标题「检查结果」。

## 2026-04-08（一键检测 · 去掉系统自检页签）

- **`src/views/Detect.vue`**：移除顶部 **`el-tabs`「系统自检」** 页签栏，检测配置与结果区直接置于「一键检测」标题下；删除 `activeTab` 与 `.detect-tabs` 样式。

## 2026-04-08（一键检测 · 检测方式三项）

- **`src/views/Detect.vue`**：分段控件改为 **检测方式：** — **全部检测**、**服务接口检测**、**加密卡检测**；`detectType` 为 `all` / `service` / `card`，恢复对应进度步骤与结果（仅服务 / 仅加密卡 / 全部）；空闲提示与检测对象文案随类型切换。

## 2026-04-08（一键检测 · 检查方式工具栏示意图）

- **`src/views/Detect.vue`**：检查方式区域改为**单行工具栏**——左侧「检查方式：」+ **分段单选**（仍含全局 / 节点 / 本机三项），右侧 **「开始检查」**；**白底**、标签为常规字重灰色；去掉浅灰卡片包边与底部蓝色装饰条，与最新示意图一致。

## 2026-04-08（一键检测 · 检查方式仅名称）

- **`src/views/Detect.vue`**：检查方式三个模块 **仅保留简短名称**（全局检查 / 节点检查 / 本机自检），去掉模块内说明文案；空闲提示与检测对象示例文案同步缩短。

## 2026-04-08（一键检测 · 检查方式三模块）

- **`src/views/Detect.vue`**：「检查方式」改为 **三个可选模块卡片**（**全局检查** / **节点检查** / **本机自检**），点击切换选中态；切换时清空未提交结果；未开始检查时 **`el-alert` 文案**随所选方式变化；汇总结果中 **检测对象** 展示对应 `targetLabel`（与本次检查模式一致）。

## 2026-04-08（一键检测 · 启动前样式与单页签）

- **`src/views/Detect.vue`**：顶部使用 **`el-tabs` 且仅保留「系统自检」一个页签**；配置区文案为「检查方式：」+ 固定展示 **「全局检查」**（去掉原「检测内容」多选），右侧 **「开始检查」**；**「检查结果」** 区块在未开始时展示与示意图一致的 **`el-alert` 说明**；进度条仅在检查中或已有结果时显示；检查流程固定为全局全量（原「全部检测」逻辑），移除未使用的 `VideoPlay` 图标与 `STEPS_SERVICE` / `STEPS_CARD`。

## 2026-04-08（白名单 · 仅单个 IPv4）

- **`src/views/whitelist/WhitelistConfig.vue`**：白名单条目类型限定为**单个 IPv4**；移除添加/编辑表单中的类型选择与 CIDR、IP 范围表单项；列表去掉「类型」列，列名与筛选文案改为「IP 地址」；查看弹窗同步；示例数据改为三条单 IP；编辑时若遇历史非 `single` 条目则清空 IP 并提示改为单 IP；删除确认文案改为「IP」；导出 CSV 去掉「类型」列。
- **`src/utils/whitelistIp.js`**：`parseImportLine` 仅接受单行 IPv4，含 `/` 的 CIDR 行返回明确错误提示。

## 2026-04-07（全项目 Vue 标签扫描）

- 已检索全部 `*.vue` 中 **`scoped">` 错误写法**（`scoped` 后多写双引号）：`src/` 下均已为合法 `<style lang="scss" scoped>`；仅 **`SV1.8.0/src/views/system/AdminManage.vue`** 副本曾含该笔误，已改为与主工程一致。
- 已核对 `src/` 内共 20 个 Vue 文件的 `<style` 起始行，无同类畸形闭合。
- 本地执行 **`npm run build`** 通过，用于确认生产构建下 SFC 解析无报错。

## 2026-04-07（AdminManage · style 标签笔误）

- **`src/views/system/AdminManage.vue`**：修正 `<style lang="scss" scoped">` 中 `scoped` 后多余的双引号，改为合法标签 `<style lang="scss" scoped>`，消除生产构建时 Vue 模板解析报错（`Attribute name cannot contain`）。

## 2026-04-07（Netlify 构建 · AdminManage 模板）

- **`src/views/system/AdminManage.vue`**：将 `:type` / `:class` / `:disabled` 中内联的中文字符串比较改为 `roleTagType`、`statusRowClass`、`isSuperAdmin` 辅助函数及 `ROLE_SUPER`、`STATUS_OK` 常量，避免模板属性值内嵌引号在部分环境下触发 Vue 模板解析报错。

## 2026-04-07（删除仓库中 GMT 0019 PDF）

- 从仓库移除 `GMT+0019-2023+通用密码服务接口规范DI.pdf`（Git 跟踪文件删除），用于清理 GitHub 仓库中的该文档文件。

## 2026-04-07（Git 初始化与 GitHub 远程）

- 新增 **`.gitignore`**（忽略 `node_modules/`、`dist/`、日志与常见编辑器目录等）。
- 在项目根目录执行 **`git init`**，首次提交 `chore: initial commit - SVS 1.7.1 prototype (Vue 3 + Vite)`，并添加远程 **`origin`** → `https://github.com/Clair-Lin/svs18.git`。
- 当前环境向 GitHub **推送失败**（连接超时 / 无法交互输入账号），需在可访问 GitHub 的本机完成登录后执行：`git push -u origin main`。

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
