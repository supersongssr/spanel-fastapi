import { useState } from "react"
import { Search, Wallet, Eye } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"

// Mock 充值记录数据
interface DepositLog {
  id: number
  trade_no: string
  user_id: number
  user_email: string
  amount: number
  method: string
  status: "success" | "pending" | "failed"
  created_at: string
  paid_at: string | null
}

const mockDeposits: DepositLog[] = [
  {
    id: 1,
    trade_no: "TXN20260201123456789",
    user_id: 2,
    user_email: "user1@example.com",
    amount: 99.00,
    method: "支付宝",
    status: "success",
    created_at: "2026-02-01T10:30:00",
    paid_at: "2026-02-01T10:31:00",
  },
  {
    id: 2,
    trade_no: "TXN20260201987654321",
    user_id: 3,
    user_email: "vip@example.com",
    amount: 288.00,
    method: "微信支付",
    status: "success",
    created_at: "2026-02-01T14:20:00",
    paid_at: "2026-02-01T14:22:00",
  },
  {
    id: 3,
    trade_no: "TXN20260202112233445",
    user_id: 4,
    user_email: "test@example.com",
    amount: 49.00,
    method: "支付宝",
    status: "pending",
    created_at: "2026-02-02T09:00:00",
    paid_at: null,
  },
  {
    id: 4,
    trade_no: "TXN20260130556677889",
    user_id: 5,
    user_email: "disabled@example.com",
    amount: 199.00,
    method: "微信支付",
    status: "failed",
    created_at: "2026-01-30T16:45:00",
    paid_at: null,
  },
  {
    id: 5,
    trade_no: "TXN20260202445566778",
    user_id: 2,
    user_email: "user1@example.com",
    amount: 128.00,
    method: "支付宝",
    status: "success",
    created_at: "2026-02-02T11:15:00",
    paid_at: "2026-02-02T11:16:00",
  },
]

export default function TransactionDeposit() {
  const [deposits] = useState<DepositLog[]>(mockDeposits)
  const [searchTerm, setSearchTerm] = useState("")

  // 过滤记录
  const filteredDeposits = deposits.filter(
    (deposit) =>
      deposit.trade_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      deposit.user_email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="success" className="gap-1.5">
            成功
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="warning" className="gap-1.5">
            处理中
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1.5">
            失败
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const formatDateTime = (dateStr: string | null) => {
    if (!dateStr) return "-"
    return new Date(dateStr).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">充值记录</h1>
          <p className="text-gray-600 mt-1">查看所有用户充值流水与支付状态</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总记录</p>
                <p className="text-2xl font-bold text-gray-900">{deposits.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">成功充值</p>
                <p className="text-2xl font-bold text-green-600">
                  {deposits.filter(d => d.status === "success").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总充值额</p>
                <p className="text-2xl font-bold text-red-600">
                  ¥{deposits
                    .filter(d => d.status === "success")
                    .reduce((sum, d) => sum + d.amount, 0)
                    .toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">待处理</p>
                <p className="text-2xl font-bold text-orange-600">
                  {deposits.filter(d => d.status === "pending").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Wallet className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 搜索栏 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type="text"
                placeholder="搜索交易号或用户邮箱..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 h-11"
              />
            </div>
            <Button className="bg-gradient-red hover:bg-primary-admin-hover gap-2 px-6">
              <Search className="h-5 w-5" />
              搜索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 充值记录表格 */}
      <Card>
        <CardHeader>
          <CardTitle>充值流水</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">交易号</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">用户</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">金额</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">支付方式</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">创建时间</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">支付时间</th>
                  <th className="text-right py-3 px-4 font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody>
                {filteredDeposits.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-gray-500">
                      暂无数据
                    </td>
                  </tr>
                ) : (
                  filteredDeposits.map((deposit) => (
                    <tr key={deposit.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 font-medium">{deposit.id}</td>
                      <td className="py-3 px-4 font-mono text-xs text-gray-600 max-w-[150px] truncate" title={deposit.trade_no}>
                        {deposit.trade_no}
                      </td>
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-xs text-gray-500">UID: {deposit.user_id}</p>
                          <p className="text-sm font-medium">{deposit.user_email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-semibold text-green-600">
                        ¥{deposit.amount.toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {deposit.method}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(deposit.status)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDateTime(deposit.created_at)}
                      </td>
                      <td className="py-3 px-4 text-gray-600">
                        {formatDateTime(deposit.paid_at)}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
