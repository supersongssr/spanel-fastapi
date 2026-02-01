import { useState } from "react"
import { cn } from "@/lib/utils"
import {
  User,
  Wallet,
  Smartphone,
  Check,
  Copy,
  RefreshCw,
  Bell,
  Calendar,
  Activity,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

// Mock 数据
const mockUserData = {
  userName: "test@example.com",
  class: 1,
  money: 128.50,
  onlineDevices: 3,
  maxDevices: 5,
  speedLimit: 100,
  classExpire: "2026-12-31 23:59:59",
  accountExpire: "2027-01-30 12:00:00",
  lastCheckin: "2026-01-29 08:30:00",
  totalTraffic: "107.37 GB",
  usedTraffic: "12.58 GB",
  unusedTraffic: "94.79 GB",
  todayUsed: "2.36 GB",
  lastUsed: "10.22 GB",
}

const mockSubscriptionUrl = "https://spanel.example.com/link/abc123def456?mu=2"

export default function Dashboard() {
  const [checkedIn, setCheckedIn] = useState(false)
  const [subscriptionUrl] = useState(mockSubscriptionUrl)

  const handleCheckin = () => {
    if (checkedIn) {
      toast.error("今日已签到，请明天再来！")
      return
    }
    setCheckedIn(true)
    toast.success("签到成功！获得 1.5GB 流量奖励 🎉")
  }

  const handleCopySubscription = () => {
    navigator.clipboard.writeText(subscriptionUrl)
    toast.success("订阅链接已复制到剪贴板！")
  }

  const handleResetSubscription = () => {
    toast.success("订阅链接已重置！请重新获取。")
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">用户中心</h1>
          <p className="text-gray-600 mt-1">欢迎回来，{mockUserData.userName}</p>
        </div>
        <Badge variant="success" className="text-base px-4 py-1">
          VIP {mockUserData.class}
        </Badge>
      </div>

      {/* 用户信息卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">账号等级</p>
                <p className="text-2xl font-bold text-primary-user">VIP {mockUserData.class}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-primary-user/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary-user" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">升级</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">余额</p>
                <p className="text-2xl font-bold text-green-600">¥{mockUserData.money}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">充值</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">在线设备</p>
                <p className="text-2xl font-bold text-blue-600">
                  {mockUserData.onlineDevices}/{mockUserData.maxDevices}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Smartphone className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">管理</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">端口速率</p>
                <p className="text-2xl font-bold text-purple-600">{mockUserData.speedLimit}M</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Activity className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4">
              <Badge variant="outline" className="text-xs">不限速</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速添加节点 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-6 w-6" />
              快速添加节点
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={handleResetSubscription}
              className="gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              重置订阅
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 订阅链接 */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">
              订阅地址
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={subscriptionUrl}
                className="flex-1 rounded-md border border-gray-300 bg-gray-50 px-4 py-2 text-sm"
              />
              <Button onClick={handleCopySubscription} className="gap-2">
                <Copy className="h-4 w-4" />
                复制
              </Button>
            </div>
          </div>

          {/* 软件下载 */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">客户端下载</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { name: "Windows", icon: "💻", url: "#" },
                { name: "Android", icon: "🤖", url: "#" },
                { name: "iOS", icon: "📱", url: "#" },
                { name: "Mac", icon: "🍎", url: "#" },
              ].map((app) => (
                <a
                  key={app.name}
                  href={app.url}
                  className="flex items-center gap-2 rounded-lg border border-gray-200 p-3 hover:border-primary-user hover:bg-primary-user/5 transition-all"
                >
                  <span className="text-2xl">{app.icon}</span>
                  <span className="text-sm font-medium">{app.name}</span>
                </a>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 账号使用情况 */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-6 w-6" />
              账号使用情况
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">等级过期时间</p>
                <p className="font-semibold">{mockUserData.classExpire}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">账号过期时间</p>
                <p className="font-semibold">{mockUserData.accountExpire}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">上次使用</p>
                <p className="font-semibold">2小时前</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">上次签到</p>
                <p className="font-semibold">{mockUserData.lastCheckin}</p>
              </div>
            </div>

            <div className="border-t pt-4">
              <Button
                onClick={handleCheckin}
                disabled={checkedIn}
                className={cn(
                  "w-full gap-2 btn-ripple",
                  checkedIn ? "bg-green-600 hover:bg-green-700" : "bg-primary-user hover:bg-primary-user-hover"
                )}
                size="lg"
              >
                <Check className="h-5 w-5" />
                {checkedIn ? "今日已签到" : "点击签到"}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 流量使用情况 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-6 w-6" />
              流量使用
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">今日已用</span>
                <span className="font-semibold text-red-600">{mockUserData.todayUsed}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="progress-bar bg-red-500" style={{ width: "12%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">过去已用</span>
                <span className="font-semibold text-orange-600">{mockUserData.lastUsed}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="progress-bar bg-orange-500" style={{ width: "42%" }} />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">剩余流量</span>
                <span className="font-semibold text-green-600">{mockUserData.unusedTraffic}</span>
              </div>
              <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                <div className="progress-bar bg-green-500" style={{ width: "46%" }} />
              </div>
            </div>

            <div className="pt-2 border-t text-center">
              <p className="text-xs text-gray-500">总流量: {mockUserData.totalTraffic}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 公告栏 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-6 w-6" />
            公告栏
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg bg-gradient-orange p-6 text-white">
            <p className="font-semibold mb-2">🎉 新年特惠活动开启！</p>
            <p className="text-sm text-white/90">
              尊敬的用户，为感谢您的支持，所有套餐8折优惠，限时3天！
              活动期间充值还能获得额外20%的流量奖励。不要错过哦！
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
