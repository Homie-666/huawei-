# 任务管理看板

一个基于 Vue 3 + Vite 的纯前端任务看板，支持三列拖拽流转、星标与紧急标记、多主题切换、完成庆祝动画与本地持久化，无需后端即可直接使用。

## 功能特性

- **三列看板**：待办 → 进行中 → 已完成，支持任意列之间的双向拖拽，列内可精确插入到卡片之间
- **重要标记**：星标任务高亮底色，紧急任务红色描边与左侧色条，一眼区分优先级
- **分类管理**：新增任务时可填写分类，输入时自动补全历史分类
- **三套主题**：晴日 / 深夜 / 多彩，下拉菜单悬停即可实时预览，选择后写入本地
- **趣味反馈**：每次操作随机展示鼓励文案，Toast 悬停可暂停倒计时
- **完成庆祝**：任务拖入「已完成」时触发 Canvas 粒子动画，彩带 / 星星 / 爱心随机
- **自动持久化**：所有变更写入 localStorage，刷新、关闭浏览器均不丢失
- **响应式**：桌面端三列横排，窄屏自动纵向堆叠

## 技术栈

| 类别 | 技术 | 版本 |
|------|------|------|
| 框架 | Vue 3（Composition API + `script setup`） | ^3.4 |
| 构建 | Vite | ^5.4 |
| 测试 | Vitest + @vue/test-utils + jsdom | ^1.6 / ^2.4 / ^24 |
| 持久化 | localStorage（含脏数据降级） | 原生 |

## 快速开始

```bash
npm install
npm run dev        # 启动开发服务器，默认 http://localhost:8085
npm run build      # 生产构建，输出到 dist/
npm run test       # 运行 33 个单元与集成测试
```

Windows 用户也可直接双击 `scripts/start-dev.bat`，在弹出的独立命令行窗口中运行服务。

## 项目结构

```
task-kanban/
├── src/
│   ├── components/        # 8 个组件：看板列、任务卡片、导航栏、弹窗、Toast、庆祝动画等
│   ├── composables/       # useKanban 状态管理 / useTheme 主题 / useToast 提示 / useRipple 涟漪
│   ├── config/            # 三套主题色板、趣味文案库
│   ├── utils/             # storage 持久化、时间格式化、CSS 变量注入
│   └── styles/            # CSS 自定义属性与全局样式
├── tests/                 # 存储、卡片、看板列、弹窗、整页集成共 5 组测试
└── scripts/               # 一键启动脚本与依赖完整性自检
```

## 实现要点

- **状态集中在 `useKanban`**：组件只负责渲染与派发事件，状态变更、排序与落盘都由 composable 统一处理，避免多层 props 透传导致的状态不一致。
- **拖拽排序**：`dragover` 时遍历卡片的中线位置计算插入索引，并用一条插入指示线给出落点预览；拖动过程通过 `dataTransfer` 传递任务 ID。
- **换肤不重载**：主题只是一组 CSS 变量，通过 `document.documentElement.style.setProperty` 注入，切换时过渡平滑，且支持悬停预览后取消。
- **存储健壮性**：读取时逐字段校验并补默认值，JSON 损坏或隐私模式下直接降级为默认状态，不会白屏；重置看板写入空数组而非删除 key，避免刷新后示例数据复活。

## 数据模型

```ts
interface Task {
  id: string
  title: string
  description?: string
  category?: string
  columnId: 'todo' | 'doing' | 'done'
  starred: boolean
  urgent: boolean
  createdAt: number
}
```
