import { useState } from "react"
import { Link, useLocation, Outlet } from "react-router-dom"
import {
  Menu,
  X,
  Home,
  UserCircle,
  LogOut,
  ShoppingCart,
  Gift,
  Plane,
  MessageCircle,
  HelpCircle,
  FileText,
  Clock,
  Shield,
  Settings,
  Wallet,
  Megaphone,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"

const navigation = [
  {
    title: "我的",
    items: [
      { name: "用户面板", href: "/dashboard", icon: Home },
      { name: "邀请返利", href: "/dashboard/invite", icon: Gift },
    ],
  },
  {
    title: "商店",
    items: [
      { name: "捐赠充值", href: "/dashboard/topup", icon: Wallet },
      { name: "套餐购买", href: "/dashboard/shop", icon: ShoppingCart },
      { name: "购买记录", href: "/dashboard/purchases", icon: Clock },
    ],
  },
  {
    title: "使用",
    items: [
      { name: "节点列表", href: "/dashboard/nodes", icon: Plane },
      { name: "媒体解锁", href: "/dashboard/unlock", icon: Shield },
      { name: "技术支持", href: "/dashboard/tickets", icon: MessageCircle },
    ],
  },
  {
    title: "账户",
    items: [
      { name: "账户信息", href: "/dashboard/profile", icon: UserCircle },
      { name: "个人设定", href: "/dashboard/settings", icon: Settings },
      { name: "帮助文档", href: "/dashboard/docs", icon: HelpCircle },
      { name: "流量记录", href: "/dashboard/traffic", icon: FileText },
    ],
  },
]

export default function UserLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 顶部导航栏 */}
      <header className="sticky top-0 z-40 bg-gradient-orange shadow-md">
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
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-white/20 p-1.5">
                <Plane className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white hidden sm:block">
                sPanel
              </span>
            </Link>
          </div>

          {/* 右侧：用户菜单 */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:block text-right">
              <p className="text-sm font-medium text-white">test@example.com</p>
              <p className="text-xs text-white/80">VIP 1</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
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

        {/* 侧边栏 */}
        <aside
          className={cn(
            "fixed inset-y-0 left-0 z-50 w-72 transform bg-white shadow-xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex h-full flex-col">
            {/* 侧边栏头部 */}
            <div className="flex h-16 items-center justify-between border-b px-6 lg:hidden">
              <span className="text-lg font-bold text-gray-900">导航菜单</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* 导航菜单 */}
            <nav className="flex-1 overflow-y-auto p-4">
              <ul className="space-y-6">
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
                                  ? "bg-primary-user/10 text-primary-user shadow-sm"
                                  : "text-gray-700 hover:bg-gray-100"
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

            {/* 侧边栏底部 */}
            <div className="border-t p-4">
              <div className="rounded-lg bg-gradient-orange p-4 text-white">
                <div className="flex items-center gap-3 mb-2">
                  <Megaphone className="h-5 w-5" />
                  <span className="font-semibold">公告</span>
                </div>
                <p className="text-sm text-white/90">
                  新年特惠活动开启！所有套餐8折优惠，限时3天！
                </p>
              </div>
            </div>
          </div>
        </aside>

        {/* 主内容区域 */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
