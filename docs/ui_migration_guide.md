# 前端重构迁移指南

> 基于 PHP/Smarty 旧版 sPanel 到 React + TypeScript + Shadcn UI 的技术蓝图

**项目代号**: sPanel-FastAPI UI Migration
**审计日期**: 2026-01-30
**版本**: v0.0

---

## 📋 目录

1. [项目概览](#项目概览)
2. [路由映射表](#路由映射表)
3. [UI 组件映射](#ui-组件映射)
4. [导航结构分析](#导航结构分析)
5. [视觉设计规范](#视觉设计规范)
6. [数据交互逻辑](#数据交互逻辑)
7. [前端技术栈](#前端技术栈)
8. [实施路线图](#实施路线图)

---

## 🎯 项目概览

### 旧版架构分析

**技术栈**:
- 后端: Slim Framework (PHP) + Smarty 模板引擎
- 前端: Material Design Lite (MDL) + jQuery
- 数据库: MySQL
- 主题: material (基于 HTML5 UP Dimension)

**目录结构**:
```
/var/www/test-spanel.freessr.bid/
├── config/
│   └── routes.php           # 路由配置
├── resources/views/material/ # Smarty 模板
│   ├── indexold.tpl         # 首页
│   ├── user/                # 用户中心模板
│   │   ├── main.tpl         # 侧边栏导航
│   │   ├── index.tpl        # 用户面板
│   │   ├── node.tpl         # 节点列表
│   │   └── shop.tpl         # 商品购买
│   └── admin/               # 管理员模板
└── public/theme/material/   # 静态资源
    ├── css/
    └── js/
```

### 新版架构规划

**技术栈**:
- 后端: FastAPI (Python 3.11+)
- 前端: React 18 + TypeScript + Vite
- UI 库: Shadcn UI + Tailwind CSS + Lucide React
- 状态管理: TanStack Query (React Query) + Zustand
- 表单: React Hook Form + Zod
- 代码规范: ESLint + Prettier + Biome

---

## 🗺️ 路由映射表

### 公共路由 (Guest)

| 旧版路由 | 方法 | 控制器 | 新版 API 端点 | React 页面组件 | 说明 |
|---------|------|--------|--------------|---------------|------|
| `/` | GET | HomeController:indexold | - | `/` | 首页/落地页 |
| `/auth/login` | GET | AuthController:login | `/api/v0/auth/login` | `/login` | 登录页 |
| `/auth/register` | GET | AuthController:register | `/api/v0/auth/register` | `/register` | 注册页 |
| `/password/reset` | GET | PasswordController:reset | `/api/v0/password/reset` | `/reset-password` | 重置密码 |
| `/404` | GET | HomeController:page404 | - | `/404` | 404页面 |
| `/tos` | GET | HomeController:tos | - | `/tos` | 服务条款 |

### 用户中心路由 (User - 需认证)

| 旧版路由 | 方法 | 控制器 | 新版 API 端点 | React 页面组件 | 说明 |
|---------|------|--------|--------------|---------------|------|
| `/user` | GET | UserController:index | `/api/v0/user/info` | `/dashboard` | **用户仪表盘** |
| `/user/node` | GET | UserController:node | `/api/v0/user/nodes` | `/dashboard/nodes` | **节点列表** |
| `/user/shop` | GET | UserController:shop | `/api/v0/user/shop` | `/dashboard/shop` | **套餐购买** |
| `/user/bought` | GET | - | `/api/v0/user/purchases` | `/dashboard/purchases` | 购买记录 |
| `/user/profile` | GET | UserController:profile | `/api/v0/user/profile` | `/dashboard/profile` | 账户信息 |
| `/user/edit` | GET | UserController:edit | `/api/v0/user/settings` | `/dashboard/settings` | 个人设定 |
| `/user/invite` | GET | UserController:invite | `/api/v0/user/invite` | `/dashboard/invite` | 邀请返利 |
| `/user/ticket` | GET | UserController:ticket | `/api/v0/user/tickets` | `/dashboard/tickets` | 技术支持 |
| `/user/announcement` | GET | UserController:announcement | `/api/v0/user/announcements` | `/dashboard/docs` | 帮助文档 |
| `/user/trafficlog` | GET | UserController:trafficLog | `/api/v0/user/traffic` | `/dashboard/traffic` | 流量记录 |
| `/user/checkin` | POST | UserController:doCheckin | `/api/v0/user/checkin` | - | 签到API |
| `/user/code` | GET | UserController:code | `/api/v0/payment/methods` | `/dashboard/topup` | 充值中心 |
| `/user/buy` | POST | UserController:buy | `/api/v0/payment/purchase` | - | 购买API |
| `/user/logout` | GET | UserController:logout | `/api/v0/auth/logout` | - | 登出API |

### 管理员路由 (Admin - 需管理员权限)

| 旧版路由 | 方法 | 控制器 | 新版 API 端点 | React 页面组件 | 说明 |
|---------|------|--------|--------------|---------------|------|
| `/admin` | GET | AdminController:index | - | `/admin` | **管理概览** |
| `/admin/user` | GET | Admin\UserController:index | `/api/v0/admin/users` | `/admin/users` | **用户管理** |
| `/admin/node` | GET | Admin\NodeController:index | `/api/v0/admin/nodes` | `/admin/nodes` | **节点管理** |
| `/admin/shop` | GET | Admin\ShopController:index | `/api/v0/admin/shop` | `/admin/shop` | 商品管理 |
| `/admin/ticket` | GET | Admin\TicketController:index | `/api/v0/admin/tickets` | `/admin/tickets` | 工单管理 |
| `/admin/announcement` | GET | Admin\AnnController:index | `/api/v0/admin/announcements` | `/admin/announcements` | 公告管理 |
| `/admin/code` | GET | Admin\CodeController:index | `/api/v0/admin/codes` | `/admin/codes` | 充值码管理 |

### API 路由

| 旧版路由 | 新版 API 端点 | 说明 |
|---------|--------------|------|
| `/api/node` | `/api/v0/nodes` | 节点信息API |
| `/api/user/{id}` | `/api/v0/user/{id}` | 用户信息API |
| `/api/sublink` | `/api/v0/link/subscription` | 订阅链接API |
| `/link/{token}` | `/api/v0/link/{token}` | 链接内容API |

---

## 🎨 UI 组件映射

### 核心页面组件映射表

| 旧版模板 | 主要功能 | 新版 React 组件 | Shadcn 组件 | 状态管理 |
|---------|---------|----------------|------------|---------|
| **indexold.tpl** | 落地页 | `LandingPage.tsx` | - | - |
| **user/main.tpl** | 侧边栏布局 | `DashboardLayout.tsx` | `Sidebar`, `Sheet` | Zustand store |
| **user/index.tpl** | 用户仪表盘 | `UserDashboard.tsx` | `Card`, `Progress`, `Tabs` | React Query |
| **user/node.tpl** | 节点列表 | `NodeList.tsx` | `Card`, `Collapsible`, `Badge` | React Query |
| **user/shop.tpl** | 商品购买 | `ShopPage.tsx` | `Card`, `Dialog`, `Switch` | React Query |
| **auth/login.tpl** | 登录表单 | `LoginForm.tsx` | `Form`, `Input`, `Button` | React Hook Form |
| **admin/main.tpl** | 管理后台 | `AdminLayout.tsx` | `Sidebar`, `DropdownMenu` | Zustand store |

### 详细组件拆解

#### 1. 用户仪表盘 (`user/index.tpl`)

**核心 UI 元素**:
```smarty
<!-- 4个信息卡片 -->
- 帐号等级 (VIP等级) → <Card className="user-info">
- 余额 (账户余额) → <Card className="user-info">
- 在线设备数 (在线/限制) → <Card className="user-info">
- 端口速率 (Mbps/无限制) → <Card className="user-info">

<!-- 快速添加节点 -->
<Tabs> (Win, Android, iOS, Mac, Linux, Router)
  - 订阅地址输入框 + 复制按钮
  - 软件下载链接
  - 图文教程链接

<!-- 公告栏 -->
<Card> 公告内容 + 管理员联系方式

<!-- 账号使用情况 -->
- 等级过期时间
- 账号过期时间
- 上次使用时间
- 签到按钮 (带动画)

<!-- 流量使用情况 -->
<ProgressBar>
  - 今日已用 (红色)
  - 过去已用 (橙色)
  - 剩余流量 (绿色)
```

**新版组件结构**:
```tsx
// pages/dashboard/index.tsx
<UserDashboard>
  <UserInfoCards />        {/* 4个统计卡片 */}
  <QuickAddNode />         {/* 订阅地址复制 */}
  <AnnouncementCard />     {/* 公告栏 */}
  <AccountUsage />         {/* 账号使用情况 */}
  <TrafficProgress />      {/* 流量进度条 */}
</UserDashboard>
```

#### 2. 节点列表 (`user/node.tpl`)

**核心 UI 元素**:
```smarty
<!-- 节点分组 (手风琴) -->
<Collapsible id="cardgroup{$class}">
  - 公告消息 (class=0)
  - VIP 1 节点
  - VIP 2 节点
  ...

<!-- 节点卡片 -->
<NodeCard>
  - 节点名称 + ID
  - 协议类型 (Vmess/Vless/Trojan)
  - 流量统计 (总流量)
  - 在线人数
  - 倍率 (x1, x2, etc.)
  - 节点配置 (点击展开)

<!-- 节点配置详情 -->
<Dialog>
  - 地址, UUID, 端口, 加密方式
  - 传输协议 (ws, grpc, etc.)
  - TLS, SNI, ALPN 等配置
</Dialog>
```

**新版组件结构**:
```tsx
// pages/dashboard/nodes.tsx
<NodeList>
  <NodeGroup>
    <Collapsible>
      <NodeCard /> {/* 循环渲染 */}
    </Collapsible>
  </NodeGroup>
</NodeList>

// components/NodeCard.tsx
<NodeCard>
  <NodeHeader />
  <NodeStats />
  <NodeConfigDialog />
</NodeCard>
```

#### 3. 商品购买 (`user/shop.tpl`)

**核心 UI 元素**:
```smarty
<!-- UI切换开关 -->
<Switch>
  - 卡片视图
  - 表格视图

<!-- 商品卡片 -->
<ShopCard>
  - 商品名称
  - 价格 (¥)
  - 流量 / 时间
  - VIP等级
  - 设备限制
  - 速率限制
  - 购买按钮

<!-- 购买对话框 -->
<Dialog id="coupon_modal">
  - 优惠码输入

<Dialog id="order_modal">
  - 订单确认
  - 自动续费开关
```

**新版组件结构**:
```tsx
// pages/dashboard/shop.tsx
<ShopPage>
  <ViewToggle /> {/* 切换视图 */}
  <ShopGrid />   {/* 卡片视图 */}
  <ShopTable />  {/* 表格视图 */}
</ShopPage>

// components/ShopCard.tsx
<ShopCard>
  <ShopName />
  <ShopPrice />
  <ShopDetails />
  <BuyButton />
</ShopCard>
```

---

## 🧭 导航结构分析

### 侧边栏导航层级

#### 用户中心侧边栏 (`user/main.tpl`)

```
我的 (展开)
├─ 用户面板 (/user)
└─ 邀请返利 (/user/invite)

商店 (展开)
├─ 捐赠/充值 (/user/code) [条件显示]
├─ 套餐购买 (/user/shop)
└─ 购买记录 (/user/bought)

使用 (展开)
├─ 节点列表 (/user/node)
├─ 媒体解锁 (/user/nodeunlock)
└─ 技术支持 (/user/ticket)

账户 (展开)
├─ 账户信息 (/user/profile)
├─ 个人设定 (/user/edit)
├─ 帮助文档 (/user/announcement)
├─ 流量记录 (/user/trafficlog)
├─ 审计规则 (/user/detect)
└─ 审计记录 (/user/detect/log)

[条件显示]
├─ Telegram群组链接
└─ 返回管理员身份
```

**新版 React Router 配置**:
```tsx
// routes/dashboard.tsx
const dashboardRoutes = [
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      { index: true, element: <UserDashboard /> },
      { path: 'nodes', element: <NodeList /> },
      { path: 'shop', element: <ShopPage /> },
      { path: 'purchases', element: <PurchaseHistory /> },
      { path: 'profile', element: <UserProfile /> },
      { path: 'settings', element: <UserSettings /> },
      { path: 'invite', element: <InvitePage /> },
      { path: 'tickets', element: <TicketsPage /> },
      { path: 'docs', element: <DocsPage /> },
      { path: 'traffic', element: <TrafficLog /> },
    ]
  }
]
```

#### 管理员侧边栏 (`admin/main.tpl`)

```
我的 (展开)
├─ 系统概览 (/admin)
├─ 公告管理 (/admin/announcement)
├─ 工单管理 (/admin/ticket)
└─ 下发命令 (/admin/auto)

节点 (展开)
├─ 节点列表 (/admin/node)
├─ 节点调整 (/admin/nodectl)
├─ 流量记录 (/admin/trafficlog)
├─ 已封禁IP (/admin/block)
└─ 已解封IP (/admin/unblock)

用户 (展开)
├─ 用户列表 (/admin/user)
├─ 中转规则 (/admin/relay)
├─ 邀请与返利 (/admin/invite)
├─ 登录记录 (/admin/login)
└─ 在线IP (/admin/alive)

审计 (展开)
├─ 审计规则 (/admin/detect)
└─ 审计记录 (/admin/detect/log)

交易 (展开)
├─ 充值与捐赠记录 (/admin/code)
├─ 商品 (/admin/shop)
├─ 优惠码 (/admin/coupon)
├─ 购买记录 (/admin/bought)
├─ 充值记录 (/admin/yftOrder) [条件]
└─ 支付设置 (/admin/editConfig) [条件]
```

**新版 React Router 配置**:
```tsx
// routes/admin.tsx
const adminRoutes = [
  {
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <AdminOverview /> },
      { path: 'users', element: <AdminUsers /> },
      { path: 'nodes', element: <AdminNodes /> },
      { path: 'shop', element: <AdminShop /> },
      { path: 'tickets', element: <AdminTickets /> },
      { path: 'announcements', element: <AdminAnnouncements /> },
      { path: 'codes', element: <AdminCodes /> },
      // ... 其他管理路由
    ]
  }
]
```

---

## 🎨 视觉设计规范

### 旧版视觉风格分析

**主题色系**:
- **用户中心**: `page-orange` (#ff9800) - 橙色主题
- **管理员后台**: `page-red` (#f44336) - 红色主题
- **登录页**: `page-brand` (#2196f3) - 蓝色主题

**Material Design 标志**:
- Material Icons (Google Material Icons)
- Roboto 字体
- 波纹点击效果 (waves-attach)
- 浮动标签表单 (floating-label)
- 卡片阴影 (card-main)

**卡片样式规格**:
```css
.card {
  background: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.16), 0 2px 10px rgba(0,0,0,0.12);
}

.card-inner {
  padding: 20px;
}
```

**按钮颜色**:
- 主按钮: `.btn-brand` (主题色)
- 强调按钮: `.btn-brand-accent` (强调色)
- 扁平按钮: `.btn-flat` (无背景)

### 新版 Shadcn UI 迁移方案

**主题配置**:
```tsx
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        // 橙色主题 (用户中心)
        orange: {
          50: '#fff7ed',
          500: '#f97316', // 替代原版 #ff9800
          600: '#ea580c',
        },
        // 红色主题 (管理员)
        red: {
          500: '#ef4444', // 替代原版 #f44336
          600: '#dc2626',
        },
      },
      borderRadius: {
        lg: '0.5rem',     // 8px
        md: '0.375rem',   // 6px
        sm: '0.25rem',    // 4px
      },
    },
  },
}
```

**CSS 变量映射**:
```css
/* globals.css */
:root {
  /* 基础颜色 */
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;

  /* 主色调 - 橙色 (用户中心) */
  --primary: 25 95% 53%;      /* #ff9800 → hsl(25, 95%, 53%) */
  --primary-foreground: 0 0% 100%;

  /* 卡片阴影 - 替代原版 Material 阴影 */
  --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
  --shadow: 0 2px 5px rgba(0,0,0,0.16), 0 2px 10px rgba(0,0,0,0.12);
  --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
}

.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
}
```

### 响应式断点

旧版响应式类 (Bootstrap 风格):
- `col-xx-12` - 超小屏幕 (<480px)
- `col-xs-6` - 小屏幕 (≥480px)
- `col-sm-8` - 平板 (≥768px)
- `col-lg-3` - 桌面 (≥992px)

新版 Tailwind 断点:
```js
screens: {
  'sm': '640px',   // 替代 col-xs
  'md': '768px',   // 替代 col-sm
  'lg': '1024px',  // 替代 col-lg
  'xl': '1280px',
  '2xl': '1536px',
}
```

**组件示例 - 用户信息卡片**:
```tsx
// components/UserInfoCard.tsx
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function UserInfoCard({ title, value, icon, color }: UserInfoCardProps) {
  return (
    <Card className="p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-full bg-${color}-100`}>
          <LucideIcon name={icon} className={`w-6 h-6 text-${color}-600`} />
        </div>
      </div>
    </Card>
  )
}
```

### 图标迁移方案

**旧版**: Material Icons (Google Fonts)
```html
<i class="material-icons">account_circle</i>
```

**新版**: Lucide React
```tsx
import { UserCircle } from 'lucide-react'

<UserCircle className="w-6 h-6" />
```

**图标映射表**:
| Material Icon | Lucide Icon | 说明 |
|--------------|-------------|------|
| `account_circle` | `UserCircle` | 用户头像 |
| `menu` | `Menu` | 菜单图标 |
| `exit_to_app` | `LogOut` | 登出 |
| `shop` | `ShoppingCart` | 商店 |
| `airplanemode_active` | `Plane` | 节点 |
| `question_answer` | `MessageCircle` | 工单 |
| `announcement` | `Megaphone` | 公告 |
| `check` | `Check` | 签到 |
| `settings` | `Settings` | 设置 |
| `visibility` | `Eye` | 查看 |
| `notifications_active` | `Bell` | 通知 |
| `account_balance_wallet` | `Wallet` | 钱包 |
| `phonelink` | `Smartphone` | 设备 |
| `event` | `Calendar` | 时间 |
| `traffic` | `BarChart3` | 流量 |

---

## 💾 数据交互逻辑

### Smarty 模板数据填充分析

**服务端注入示例**:
```smarty
<!-- user/index.tpl -->
{$user->user_name}           <!-- 用户名 -->
{$user->class}               <!-- VIP等级 -->
{$user->money}               <!-- 余额 -->
{$user->enableTraffic()}     <!-- 总流量 -->
{$user->usedTraffic()}       <!-- 已用流量 -->
{$user->unusedTraffic()}     <!-- 剩余流量 -->
{$user->class_expire}        <!-- 等级过期时间 -->
{$user->expire_in}           <!-- 账号过期时间 -->

<!-- node.tpl -->
{foreach $nodes as $node}
  {$node['name']}            <!-- 节点名称 -->
  {$node['node_class']}      <!-- 节点等级 -->
  {$node->node_online}       <!-- 在线人数 -->
  {$node['traffic_rate']}    <!-- 流量倍率 -->
{/foreach}
```

### 新版 API 响应格式

**用户信息 API** (`GET /api/v0/user/info`):
```json
{
  "ret": 1,
  "msg": "成功",
  "data": {
    "user_id": 1,
    "user_name": "test@example.com",
    "class": 1,
    "money": 10.50,
    "node_speedlimit": 100,
    "node_connector": 5,
    "transfer_enable": 107374182400,
    "u": 5368709120,
    "d": 5368709120,
    "class_expire": "2026-12-31 23:59:59",
    "expire_in": "2027-01-30 12:00:00"
  }
}
```

**节点列表 API** (`GET /api/v0/user/nodes`):
```json
{
  "ret": 1,
  "msg": "成功",
  "data": {
    "nodes": [
      {
        "id": 1,
        "name": "香港 IPLC 01",
        "node_class": 1,
        "sort": 11,
        "node_online": 15,
        "node_bandwidth": 1073741824000,
        "traffic_rate": 1,
        "server": "hk1.example.com",
        "config": {
          "add": "hk1.example.com",
          "aid": 0,
          "port": 443,
          "scy": "auto",
          "net": "ws",
          "type": "none",
          "host": "hk1.example.com",
          "path": "/v2ray",
          "tls": "tls"
        }
      }
    ]
  }
}
```

### React Query 数据获取

**用户数据 Hook**:
```tsx
// hooks/useUserInfo.ts
import { useQuery } from '@tanstack/react-query'

export function useUserInfo() {
  return useQuery({
    queryKey: ['user', 'info'],
    queryFn: async () => {
      const res = await fetch('/api/v0/user/info', {
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      })
      if (!res.ok) throw new Error('Failed to fetch user info')
      return res.json()
    },
    staleTime: 1000 * 60 * 5, // 5分钟缓存
  })
}

// 组件使用
function UserDashboard() {
  const { data, isLoading, error } = useUserInfo()

  if (isLoading) return <LoadingSkeleton />
  if (error) return <ErrorMessage error={error} />

  return (
    <div>
      <h1>欢迎, {data.data.user_name}</h1>
      <VIPBadge level={data.data.class} />
      <BalanceCard amount={data.data.money} />
    </div>
  )
}
```

### 签到交互逻辑分析

**旧版 JavaScript** (`user/index.tpl` line 807-881):
```javascript
// 签到按钮点击
$("#checkin").click(function () {
    $.ajax({
        type: "POST",
        url: "/user/checkin",
        dataType: "json",
        data: {
            recaptcha: grecaptcha.getResponse()
        },
        success: function (data) {
            if (data.ret) {
                $("#checkin-msg").html(data.msg);
                $("#checkin-btn").html(checkedmsgGE);
                $("#result").modal();
                $("#msg").html(data.msg);
                $('#remain').html(data.traffic);  // 更新剩余流量
                $('.bar.remain.color').css('width', ...); // 更新进度条
            }
        }
    })
})

// 摇一摇签到
var myShakeEvent = new Shake({ threshold: 15 });
myShakeEvent.start();
window.addEventListener('shake', shakeEventDidOccur, false);
```

**新版实现**:
```tsx
// hooks/useCheckin.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

export function useCheckin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/v0/user/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })
      return res.json()
    },
    onSuccess: (data) => {
      if (data.ret) {
        toast.success(data.msg)
        // 刷新用户数据
        queryClient.invalidateQueries({ queryKey: ['user', 'info'] })
      } else {
        toast.error(data.msg)
      }
    },
  })
}

// 组件使用
import { useShake } from '@/hooks/useShake'

function CheckinButton() {
  const { mutate: checkin, isPending } = useCheckin()

  // 摇一摇签到
  useShake(() => {
    if (!isPending) checkin()
  }, { threshold: 15 })

  return (
    <Button
      onClick={() => checkin()}
      disabled={isPending}
      className="w-full"
    >
      {isPending ? '签到中...' : '点击签到'}
    </Button>
  )
}
```

### 节点订阅复制逻辑

**旧版** (`user/index.tpl` line 782-797):
```javascript
// 订阅链接复制
$(".copy-text").click(function () {
    $("#result").modal();
    $("#msg").html("已拷贝订阅链接，请您继续接下来的操作。");
});

// 重置订阅链接
$(".reset-link").click(function () {
    $("#result").modal();
    $("#msg").html("已重置您的订阅链接，请变更或添加您的订阅链接！");
    window.setTimeout("location.href='/user/url_reset'", {$config['jump_delay']});
});
```

**新版实现**:
```tsx
// components/SubscriptionInput.tsx
import { Copy, RefreshCw } from 'lucide-react'
import { copyToClipboard } from '@/utils/copy'
import { toast } from 'sonner'

export function SubscriptionInput({ subscriptionUrl }: Props) {
  const queryClient = useQueryClient()

  const handleCopy = async () => {
    await copyToClipboard(subscriptionUrl)
    toast.success('订阅链接已复制到剪贴板')
  }

  const handleReset = async () => {
    await fetch('/api/v0/user/subscription/reset', { method: 'POST' })
    toast.success('订阅链接已重置')
    queryClient.invalidateQueries({ queryKey: ['user', 'subscription'] })
  }

  return (
    <div className="flex gap-2">
      <Input value={subscriptionUrl} readOnly />
      <Button onClick={handleCopy} variant="outline">
        <Copy className="w-4 h-4" />
      </Button>
      <Button onClick={handleReset} variant="outline">
        <RefreshCw className="w-4 h-4" />
      </Button>
    </div>
  )
}
```

---

## 🛠️ 前端技术栈

### 核心依赖

```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-router-dom": "^6.20.0",
    "@tanstack/react-query": "^5.12.0",
    "zustand": "^4.4.7",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "axios": "^1.6.0",
    "sonner": "^1.2.0",
    "lucide-react": "^0.294.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.1.0",
    "class-variance-authority": "^0.7.0"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "typescript": "^5.3.0",
    "eslint": "^8.54.0",
    "prettier": "^3.1.0",
    "@biomejs/biome": "^1.4.0",
    "tailwindcss": "^3.3.0",
    "autoprefixer": "^10.4.0",
    "postcss": "^8.4.0"
  }
}
```

### Shadcn UI 组件清单

**基础组件**:
- `Button`, `Input`, `Label`, `Textarea`
- `Card`, `CardHeader`, `CardContent`, `CardFooter`
- `Dialog`, `Sheet`, `Popover`, `DropdownMenu`
- `Tabs`, `Collapsible`, `Accordion`
- `Progress`, `Badge`, `Avatar`
- `Table`, `Pagination`
- `Form`, `Select`, `Checkbox`, `Switch`, `Slider`

### 目录结构设计

```
frontend/
├── src/
│   ├── components/          # 可复用组件
│   │   ├── ui/             # Shadcn UI 组件
│   │   ├── layout/         # 布局组件
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   └── Sidebar.tsx
│   │   ├── dashboard/      # 仪表盘组件
│   │   │   ├── UserInfoCard.tsx
│   │   │   ├── NodeCard.tsx
│   │   │   ├── ShopCard.tsx
│   │   │   └── TrafficProgress.tsx
│   │   └── admin/          # 管理员组件
│   ├── pages/              # 页面组件
│   │   ├── index.tsx       # 落地页
│   │   ├── login.tsx       # 登录
│   │   ├── register.tsx    # 注册
│   │   ├── dashboard/      # 用户中心页面
│   │   └── admin/          # 管理后台页面
│   ├── hooks/              # 自定义 Hooks
│   │   ├── useUserInfo.ts
│   │   ├── useCheckin.ts
│   │   └── useShake.ts
│   ├── lib/                # 工具函数
│   │   ├── axios.ts
│   │   ├── query-client.ts
│   │   └── utils.ts
│   ├── store/              # Zustand 状态管理
│   │   └── auth-store.ts
│   ├── types/              # TypeScript 类型
│   │   └── api.d.ts
│   ├── routes/             # 路由配置
│   │   ├── index.tsx
│   │   ├── dashboard.tsx
│   │   └── admin.tsx
│   └── main.tsx            # 应用入口
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 📅 实施路线图

### Phase 1: 项目初始化 (Week 1)

- [x] 创建 Vite + React + TypeScript 项目
- [ ] 配置 Tailwind CSS + Shadcn UI
- [ ] 设置 ESLint + Prettier + Biome
- [ ] 配置 React Router v6
- [ ] 设置 TanStack Query + Zustand
- [ ] 创建基础布局组件

### Phase 2: 认证系统 (Week 2)

- [ ] 登录页面 (`/login`)
  - [ ] 表单验证 (React Hook Form + Zod)
  - [ ] 记住我功能
  - [ ] 错误处理
- [ ] 注册页面 (`/register`)
  - [ ] 邮箱验证
  - [ ] 密码强度检测
- [ ] 密码重置 (`/reset-password`)
- [ ] 认证状态管理 (Zustand)
- [ ] JWT Token 存储与刷新

### Phase 3: 用户仪表盘 (Week 3-4)

- [ ] 侧边栏布局
  - [ ] 响应式设计 (移动端抽屉)
  - [ ] 导航菜单高亮
  - [ ] 用户头像下拉菜单
- [ ] 用户信息卡片
  - [ ] VIP等级徽章
  - [ ] 余额显示
  - [ ] 在线设备数
  - [ ] 端口速率
- [ ] 快速添加节点
  - [ ] Tab切换 (Win/Android/iOS/Mac/Linux)
  - [ ] 订阅链接复制
  - [ ] 重置订阅链接
- [ ] 签到功能
  - [ ] 签到按钮
  - [ ] 摇一摇签到 (可选)
  - [ ] 签到动画
- [ ] 流量进度条
  - [ ] 今日已用 (红色)
  - [ ] 过去已用 (橙色)
  - [ ] 剩余流量 (绿色)

### Phase 4: 节点系统 (Week 5)

- [ ] 节点列表页面
  - [ ] 节点分组 (VIP等级)
  - [ ] 手风琴折叠
  - [ ] 节点卡片
  - [ ] 节点搜索/筛选
- [ ] 节点详情
  - [ ] 配置信息弹窗
  - [ ] 一键复制配置
  - [ ] 节点状态指示器
- [ ] 媒体解锁页面
- [ ] 实时节点在线人数

### Phase 5: 商店系统 (Week 6)

- [ ] 商品列表页面
  - [ ] 卡片/表格视图切换
  - [ ] 商品卡片设计
  - [ ] 价格标签
- [ ] 购买流程
  - [ ] 优惠码输入
  - [ ] 订单确认对话框
  - [ ] 自动续费开关
  - [ ] 支付集成
- [ ] 购买记录页面

### Phase 6: 管理后台 (Week 7-8)

- [ ] 管理员布局 (红色主题)
- [ ] 系统概览页面
  - [ ] 统计数据卡片
  - [ ] 图表组件 (可选)
- [ ] 用户管理
  - [ ] 用户列表 (DataTables)
  - [ ] 搜索/筛选
  - [ ] 编辑用户对话框
  - [ ] 封禁/解封操作
- [ ] 节点管理
  - [ ] 节点CRUD
  - [ ] 节点调整工具
- [ ] 商品管理
- [ ] 工单系统
- [ ] 公告管理

### Phase 7: 优化与部署 (Week 9)

- [ ] 性能优化
  - [ ] 代码分割 (React.lazy)
  - [ ] 图片懒加载
  - [ ] API响应缓存
- [ ] SEO优化
  - [ ] Meta标签
  - [ ] Open Graph
- [ ] 测试
  - [ ] 单元测试 (Vitest)
  - [ ] E2E测试 (Playwright)
- [ ] 构建与部署
  - [ ] Docker化
  - [ ] CI/CD配置

---

## 📊 优先级矩阵

| 功能模块 | 优先级 | 复杂度 | 工作量 | 依赖 |
|---------|-------|-------|--------|------|
| 认证系统 | P0 | 中 | 1周 | 无 |
| 用户仪表盘 | P0 | 高 | 2周 | 认证系统 |
| 节点列表 | P0 | 高 | 1周 | 用户仪表盘 |
| 商店系统 | P1 | 中 | 1周 | 用户仪表盘 |
| 管理后台 | P1 | 高 | 2周 | 认证系统 |
| 工单系统 | P2 | 中 | 1周 | 用户仪表盘 |
| 邀请系统 | P2 | 低 | 3天 | 用户仪表盘 |
| 流量记录 | P2 | 低 | 3天 | 用户仪表盘 |
| 审计系统 | P3 | 低 | 1周 | 管理后台 |

---

## 🔧 开发工具与规范

### 代码规范

**ESLint 配置**:
```json
{
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "prettier"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn"
  }
}
```

**Biome 配置** (替代 Prettier):
```json
{
  "formatter": {
    "indentStyle": "space",
    "lineWidth": 100
  },
  "linter": {
    "rules": {
      "style": {
        "useConst": "error"
      }
    }
  }
}
```

### Git 工作流

**分支命名**:
- `feature/dashboard-page` - 新功能
- `fix/login-auth` - Bug修复
- `refactor/sidebar-component` - 重构
- `docs/update-readme` - 文档

**提交规范**:
```
feat: 添加用户仪表盘页面
fix: 修复签到按钮点击无响应问题
refactor: 重构侧边栏组件逻辑
docs: 更新API文档
style: 格式化代码
test: 添加登录表单测试
chore: 更新依赖版本
```

---

## 📚 参考资料

### 设计资源

- [Material Design Guidelines](https://m3.material.io/)
- [Shadcn UI 文档](https://ui.shadcn.com/)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
- [Lucide Icons](https://lucide.dev/)

### 技术文档

- [React 18 文档](https://react.dev/)
- [React Router v6](https://reactrouter.com/)
- [TanStack Query](https://tanstack.com/query/latest)
- [React Hook Form](https://react-hook-form.com/)
- [Zustand](https://zustand-demo.pmnd.rs/)

### 旧版参考

- 旧版路由: `/var/www/test-spanel.freessr.bid/config/routes.php`
- 旧版模板: `/var/www/test-spanel.freessr.bid/resources/views/material/`
- 旧版静态资源: `/var/www/test-spanel.freessr.bid/public/theme/material/`

---

## 🎯 总结

本迁移指南提供了从 PHP/Smarty 旧版 sPanel 到 React + TypeScript + Shadcn UI 新版的完整技术蓝图，包括：

✅ **路由映射** - 完整的旧版到新版路由对照表
✅ **组件拆解** - 关键页面的组件映射方案
✅ **导航结构** - 侧边栏层级与路由配置
✅ **视觉规范** - 主题色、字体、阴影等设计规格
✅ **数据交互** - API 响应格式与 React Query 集成
✅ **技术栈选型** - 前端框架与工具链配置
✅ **实施路线** - 9周分阶段开发计划

**下一步行动**:
1. 搭建基础项目脚手架
2. 配置 Shadcn UI 主题 (橙色/红色)
3. 实现认证系统 (登录/注册)
4. 开发用户仪表盘核心功能
5. 迭代开发其他模块

---

**文档维护**: 本文档应随开发进度持续更新
**问题反馈**: 请在项目 Issues 中提出
**更新日期**: 2026-01-30
