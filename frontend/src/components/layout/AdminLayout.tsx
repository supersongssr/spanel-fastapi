import { useState } from "react"
import { Link, useLocation, Outlet } from "react-router-dom"
import {
  Menu,
  X,
  LayoutDashboard,
  Server,
  Users,
  Receipt,
  ShieldCheck,
  ShieldAlert,
  Ticket,
  Settings,
  LogOut,
  UserCircle,
  AlertCircle,
  Terminal,
  Sliders,
  Activity,
  Repeat,
  History,
  Globe,
  Gavel,
  FileText,
  Wallet,
  ShoppingBag,
  Percent,
  ShoppingCart,
  Megaphone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

const navigation = [
  {
    title: "管理",
    items: [
      { name: "仪表盘", href: "/admin", icon: LayoutDashboard },
      { name: "公告管理", href: "/admin/announcements", icon: Megaphone },
      { name: "工单管理", href: "/admin/tickets", icon: Ticket },
      { name: "下发命令", href: "/admin/commands", icon: Terminal },
    ],
  },
  {
    title: "节点",
    items: [
      { name: "节点列表", href: "/admin/nodes", icon: Server },
      { name: "节点调整", href: "/admin/nodes/adjustment", icon: Sliders },
      { name: "流量记录", href: "/admin/nodes/traffic", icon: Activity },
      { name: "已封禁 IP", href: "/admin/nodes/banned", icon: ShieldAlert },
      { name: "已解封 IP", href: "/admin/nodes/unbanned", icon: ShieldCheck },
    ],
  },
  {
    title: "用户",
    items: [
      { name: "用户列表", href: "/admin/users", icon: Users },
      { name: "中转规则", href: "/admin/users/relay", icon: Repeat },
      { name: "邀请与返利", href: "/admin/users/invite", icon: Receipt },
      { name: "登录记录", href: "/admin/users/login-history", icon: History },
      { name: "在线 IP", href: "/admin/users/online-ip", icon: Globe },
    ],
  },
  {
    title: "审计",
    items: [
      { name: "审计规则", href: "/admin/audit/rules", icon: Gavel },
      { name: "审计记录", href: "/admin/audit/logs", icon: FileText },
    ],
  },
  {
    title: "交易",
    items: [
      { name: "充值记录", href: "/admin/transactions/deposit", icon: Wallet },
      { name: "商品管理", href: "/admin/transactions/products", icon: ShoppingBag },
      { name: "优惠码", href: "/admin/transactions/coupons", icon: Percent },
      { name: "购买记录", href: "/admin/transactions/orders", icon: ShoppingCart },
    ],
  },
  {
    title: "系统",
    items: [
      { name: "系统设置", href: "/admin/settings", icon: Settings },
    ],
  },
]

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 - 红色主题 */}
      <header className="sticky top-0 z-40 bg-gradient-red shadow-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* 左侧：菜单按钮 + Logo */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden text-white hover:bg-white/20"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
            <Link to="/admin" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/20 p-1.5">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold text-white leading-tight">
                  sPanel
                </span>
                <span className="text-[10px] text-white/80 -mt-1">ADMIN</span>
              </div>
            </Link>
          </div>

          {/* 右侧：管理员菜单 */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">Administrator</p>
              <p className="text-xs text-white/80">Super Admin</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center ring-2 ring-white/30">
              <UserCircle className="h-6 w-6 text-white" />
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              title="登出"
            >
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 侧边栏遮罩（移动端） */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* 侧边栏 - 红色高亮主题 */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            {/* 侧边栏头部 */}
            <div className="flex h-16 items-center justify-between border-b px-6 lg:hidden">
              <span className="text-lg font-bold text-gray-900">管理菜单</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* 导航菜单 */}
            <nav className="flex-1 overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-gray-300 hover:scrollbar-thumb-gray-400 scrollbar-track-gray-100">
              <ul className="space-y-5">
                {navigation.map((section) => (
                  <li key={section.title}>
                    <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                      {section.title}
                    </p>
                    <ul className="space-y-1">
                      {section.items.map((item) => {
                        const isActive = location.pathname === item.href
                        return (
                          <li key={item.name}>
                            <Link
                              to={item.href}
                              onClick={() => setSidebarOpen(false)}
                              className={cn(
                                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                isActive
                                  ? "bg-primary-admin/10 text-primary-admin shadow-sm border-l-4 border-primary-admin"
                                  : "text-gray-700 hover:bg-gray-100 hover:border-l-4 hover:border-primary-admin/50"
                              )}
                            >
                              <item.icon className="h-5 w-5" />
                              <span>{item.name}</span>
                            </Link>
                          </li>
                        )
                      })}
                    </ul>
                  </li>
                ))}
              </ul>
            </nav>

            {/* 侧边栏底部 - 红色警告信息 */}
            <div className="border-t p-4">
              <div className="rounded-lg bg-gradient-red p-4 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-semibold">系统状态</span>
                </div>
                <div className="space-y-1.5 text-sm text-white/90">
                  <div className="flex items-center justify-between">
                    <span>负载</span>
                    <span className="font-mono">32%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>版本</span>
                    <span className="font-mono">v2.1.0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
