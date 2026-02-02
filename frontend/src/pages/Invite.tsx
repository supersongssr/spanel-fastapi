import { useState } from "react"
import {
  Users,
  DollarSign,
  TrendingUp,
  Copy,
  Check,
  Calendar,
  Mail,
  Wallet,
  Gift,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

// Mock 数据 - 邀请统计
const mockInviteStats = {
  totalInvitees: 23,
  totalCommission: 458.50,
  pendingCommission: 89.00,
  commissionRate: 20, // 20% 返利
}

// Mock 数据 - 已邀请用户列表
const mockInvitees = [
  {
    id: 1,
    email: "user***@example.com",
    regDate: "2025-01-15",
    status: "active",
    commission: 39.99,
  },
  {
    id: 2,
    email: "abc***@gmail.com",
    regDate: "2025-01-18",
    status: "active",
    commission: 79.99,
  },
  {
    id: 3,
    email: "test***@qq.com",
    regDate: "2025-01-20",
    status: "pending",
    commission: 0,
  },
  {
    id: 4,
    email: "new***@outlook.com",
    regDate: "2025-01-22",
    status: "active",
    commission: 159.99,
  },
  {
    id: 5,
    email: "vip***@163.com",
    regDate: "2025-01-25",
    status: "active",
    commission: 49.99,
  },
]

// Mock 数据 - 佣金流水记录
const mockCommissionHistory = [
  {
    id: 1,
    type: "invite",
    description: "用户 user***@example.com 购买套餐",
    amount: 39.99,
    status: "confirmed",
    date: "2025-01-15 14:32",
  },
  {
    id: 2,
    type: "invite",
    description: "用户 abc***@gmail.com 购买套餐",
    amount: 79.99,
    status: "confirmed",
    date: "2025-01-18 09:15",
  },
  {
    id: 3,
    type: "withdraw",
    description: "提现到支付宝",
    amount: -200.00,
    status: "confirmed",
    date: "2025-01-20 16:45",
  },
  {
    id: 4,
    type: "invite",
    description: "用户 new***@outlook.com 购买套餐",
    amount: 159.99,
    status: "pending",
    date: "2025-01-22 11:20",
  },
  {
    id: 5,
    type: "bonus",
    description: "邀请达人奖励",
    amount: 50.00,
    status: "confirmed",
    date: "2025-01-23 00:00",
  },
]

export default function Invite() {
  const [copied, setCopied] = useState(false)
  const inviteCode = "REF2025" // Mock 邀请码
  const inviteLink = `https://example.com/register?aff=${inviteCode}`

  const handleCopy = () => {
    navigator.clipboard.writeText(inviteLink)
    setCopied(true)
    toast.success("邀请链接已复制到剪贴板")
    setTimeout(() => setCopied(false), 2000)
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">邀请返利</h1>
        <p className="text-gray-600 mt-1">邀请好友注册购买，获得丰厚佣金奖励</p>
      </div>

      {/* 佣金仪表盘 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* 累计佣金 */}
        <Card className="card-material bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">累计佣金</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  ¥{mockInviteStats.totalCommission.toFixed(2)}
                </p>
                <p className="text-xs text-green-700 mt-1">已提现 ¥200.00</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-green-200 flex items-center justify-center">
                <Wallet className="h-7 w-7 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 待确认佣金 */}
        <Card className="card-material bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">待确认佣金</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                  ¥{mockInviteStats.pendingCommission.toFixed(2)}
                </p>
                <p className="text-xs text-orange-700 mt-1">预计 7 天内到账</p>
              </div>
              <div className="h-14 w-14 rounded-full bg-orange-200 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 邀请人数 */}
        <Card className="card-material bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">成功邀请</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {mockInviteStats.totalInvitees}
                  <span className="text-lg font-normal text-blue-700 ml-1">人</span>
                </p>
                <p className="text-xs text-blue-700 mt-1">
                  返利率 {mockInviteStats.commissionRate}%
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-200 flex items-center justify-center">
                <Users className="h-7 w-7 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 邀请链接卡片 */}
      <Card className="card-material border-2 border-primary-user shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-primary-user" />
            您的专属邀请链接
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            分享此链接给好友，他们注册并购买套餐后，您将获得 <span className="font-bold text-primary-user">20%</span> 佣金返利！
          </p>

          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                readOnly
                value={inviteLink}
                className="w-full h-12 px-4 pr-24 bg-gray-50 border border-gray-300 rounded-lg text-sm font-mono text-gray-700 focus:outline-none focus:ring-2 focus:ring-primary-user"
              />
              <Button
                onClick={handleCopy}
                className="absolute right-2 top-1/2 -translate-y-1/2 gap-2"
                size="sm"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4" />
                    已复制
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4" />
                    复制链接
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-6 text-sm text-gray-600 pt-2">
            <div className="flex items-center gap-2">
              <Badge variant="success" className="gap-1">
                <DollarSign className="h-3 w-3" />
                佣金比例 20%
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="default" className="gap-1">
                <Calendar className="h-3 w-3" />
                7 天结算周期
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 已邀请用户列表 */}
      <Card className="card-material">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-gray-700" />
            已邀请用户
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">用户邮箱</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">注册时间</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">状态</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">贡献佣金</th>
                </tr>
              </thead>
              <tbody>
                {mockInvitees.map((invitee) => (
                  <tr key={invitee.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-full bg-gradient-orange flex items-center justify-center">
                          <Mail className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-sm text-gray-900 font-medium">{invitee.email}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">{formatDate(invitee.regDate)}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={invitee.status === "active" ? "success" : "secondary"}
                      >
                        {invitee.status === "active" ? "已激活" : "待确认"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className={`text-sm font-semibold ${
                        invitee.commission > 0 ? "text-green-600" : "text-gray-400"
                      }`}>
                        {invitee.commission > 0 ? `+¥${invitee.commission.toFixed(2)}` : "--"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 佣金流水记录 */}
      <Card className="card-material">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-gray-700" />
            佣金流水记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">时间</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">类型</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">描述</th>
                  <th className="text-right py-3 px-4 text-sm font-semibold text-gray-700">金额</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-gray-700">状态</th>
                </tr>
              </thead>
              <tbody>
                {mockCommissionHistory.map((record) => (
                  <tr key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 text-sm text-gray-600">{record.date}</td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          record.type === "invite"
                            ? "success"
                            : record.type === "withdraw"
                            ? "destructive"
                            : "default"
                        }
                      >
                        {record.type === "invite" && "邀请返利"}
                        {record.type === "withdraw" && "提现"}
                        {record.type === "bonus" && "奖励"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-700">{record.description}</td>
                    <td className={`py-3 px-4 text-right text-sm font-semibold ${
                      record.amount > 0 ? "text-green-600" : "text-red-600"
                    }`}>
                      {record.amount > 0 ? "+" : ""}¥{Math.abs(record.amount).toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={record.status === "confirmed" ? "success" : "secondary"}>
                        {record.status === "confirmed" ? "已确认" : "待确认"}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 底部提示 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-semibold">邀请规则说明</p>
            <ul className="space-y-1 list-disc list-inside text-blue-800">
              <li>新用户通过您的邀请链接注册并完成首次购买，您将获得订单金额 20% 的佣金</li>
              <li>佣金在用户购买成功后 7 天内处于"待确认"状态，确认后可提现</li>
              <li>累计邀请 10 人以上，额外获得 ¥50 奖励；邀请 50 人以上，奖励 ¥200</li>
              <li>禁止作弊行为，一经发现将冻结账户并扣除所有佣金</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
