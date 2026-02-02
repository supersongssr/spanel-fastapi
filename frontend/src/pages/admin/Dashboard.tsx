import {
  Users,
  Activity,
  DollarSign,
  Server,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Receipt,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

// Mock 数据
const adminStats = {
  totalUsers: 2847,
  onlineUsers: 892,
  todayIncome: 12850.50,
  monthIncome: 384250.00,
  totalNodes: 15,
  onlineNodes: 13,
  offlineNodes: 2,
  pendingTickets: 23,
  pendingWithdrawals: 8,
  userGrowth: 12.5,
  incomeGrowth: 23.8,
}

export default function AdminDashboard() {
  const statCards = [
    {
      title: "总用户数",
      value: adminStats.totalUsers.toLocaleString(),
      change: `+${adminStats.userGrowth}%`,
      changeType: "positive",
      icon: Users,
      color: "red",
      description: "较上周",
    },
    {
      title: "在线用户",
      value: adminStats.onlineUsers.toLocaleString(),
      change: "活跃",
      changeType: "neutral",
      icon: Activity,
      color: "red",
      description: "实时数据",
    },
    {
      title: "今日收入",
      value: `¥${adminStats.todayIncome.toLocaleString()}`,
      change: `+${adminStats.incomeGrowth}%`,
      changeType: "positive",
      icon: DollarSign,
      color: "red",
      description: "较昨日",
    },
    {
      title: "本月收入",
      value: `¥${Math.floor(adminStats.monthIncome).toLocaleString()}`,
      change: "+18.2%",
      changeType: "positive",
      icon: TrendingUp,
      color: "red",
      description: "较上月",
    },
    {
      title: "节点总数",
      value: adminStats.totalNodes.toString(),
      change: "稳定",
      changeType: "neutral",
      icon: Server,
      color: "red",
      description: "全部节点",
    },
    {
      title: "在线节点",
      value: adminStats.onlineNodes.toString(),
      change: "正常",
      changeType: "positive",
      icon: CheckCircle,
      color: "green",
      description: "运行良好",
    },
    {
      title: "异常节点",
      value: adminStats.offlineNodes.toString(),
      change: "需关注",
      changeType: "negative",
      icon: AlertTriangle,
      color: "red",
      description: "待处理",
    },
    {
      title: "待审工单",
      value: adminStats.pendingTickets.toString(),
      change: "待处理",
      changeType: "neutral",
      icon: Receipt,
      color: "red",
      description: "需及时回复",
    },
  ]

  const getIconBgColor = (color: string) => {
    if (color === "green") return "bg-green-100"
    return "bg-gradient-red"
  }

  const getIconColor = (color: string) => {
    if (color === "green") return "text-green-600"
    return "text-white"
  }

  const getChangeColor = (type: string) => {
    if (type === "positive") return "text-green-600"
    if (type === "negative") return "text-red-600"
    return "text-gray-600"
  }

  const getChangeIcon = (type: string) => {
    if (type === "positive") return <ArrowUpRight className="h-4 w-4" />
    if (type === "negative") return <ArrowDownRight className="h-4 w-4" />
    return null
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">管理仪表盘</h1>
          <p className="text-gray-600 mt-1">系统运行状态与业务数据总览</p>
        </div>
        <Badge variant="destructive" className="text-base px-4 py-1">
          管理员
        </Badge>
      </div>

      {/* 统计卡片网格 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <div className="flex items-center gap-1 mt-2">
                    {getChangeIcon(stat.changeType)}
                    <span className={`text-xs font-medium ${getChangeColor(stat.changeType)}`}>
                      {stat.change}
                    </span>
                    <span className="text-xs text-gray-500 ml-1">{stat.description}</span>
                  </div>
                </div>
                <div className={`h-14 w-14 rounded-full ${getIconBgColor(stat.color)} flex items-center justify-center shadow-md`}>
                  <stat.icon className={`h-7 w-7 ${getIconColor(stat.color)}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 快捷操作区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 最近订单 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-6 w-6 text-primary-admin" />
              最近订单
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { id: "#ORD-2026-0201", user: "user@example.com", amount: "¥99.00", status: "completed" },
                { id: "#ORD-2026-0202", user: "test@example.com", amount: "¥199.00", status: "pending" },
                { id: "#ORD-2026-0203", user: "vip@example.com", amount: "¥299.00", status: "completed" },
              ].map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium">{order.id}</p>
                    <p className="text-xs text-gray-500">{order.user}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{order.amount}</p>
                    <Badge
                      variant={order.status === "completed" ? "success" : "warning"}
                      className="text-xs"
                    >
                      {order.status === "completed" ? "已完成" : "待支付"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 系统状态 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-6 w-6 text-primary-admin" />
              系统状态
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">CPU 使用率</span>
                  <span className="font-semibold text-primary-admin">32%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-red rounded-full" style={{ width: "32%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">内存使用率</span>
                  <span className="font-semibold text-blue-600">58%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-blue-500 rounded-full" style={{ width: "58%" }} />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">磁盘使用率</span>
                  <span className="font-semibold text-green-600">45%</span>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-green-500 rounded-full" style={{ width: "45%" }} />
                </div>
              </div>

              <div className="pt-2 border-t text-xs text-gray-500">
                <div className="flex items-center justify-between">
                  <span>运行时间</span>
                  <span className="font-mono">15天 8小时 32分钟</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 待处理事项 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-primary-admin" />
            待处理事项
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-lg bg-red-50 border border-red-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-red-600 font-medium">提现审核</p>
                  <p className="text-2xl font-bold text-red-700 mt-1">
                    {adminStats.pendingWithdrawals}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-red-600" />
                </div>
              </div>
              <p className="text-xs text-red-500 mt-2">需尽快处理</p>
            </div>

            <div className="rounded-lg bg-orange-50 border border-orange-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-orange-600 font-medium">工单回复</p>
                  <p className="text-2xl font-bold text-orange-700 mt-1">
                    {adminStats.pendingTickets}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-orange-100 flex items-center justify-center">
                  <Receipt className="h-5 w-5 text-orange-600" />
                </div>
              </div>
              <p className="text-xs text-orange-500 mt-2">用户等待中</p>
            </div>

            <div className="rounded-lg bg-gray-50 border border-gray-200 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 font-medium">节点异常</p>
                  <p className="text-2xl font-bold text-gray-700 mt-1">
                    {adminStats.offlineNodes}
                  </p>
                </div>
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <Server className="h-5 w-5 text-gray-600" />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">需要检查</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
