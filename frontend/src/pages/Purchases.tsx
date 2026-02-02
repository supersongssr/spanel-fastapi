import { useState } from "react"
import {
  ShoppingCart,
  Calendar,
  CreditCard,
  Package,
  TrendingUp,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

// Mock 数据 - 购买统计
const mockPurchaseStats = {
  totalOrders: 12,
  totalAmount: 1258.50,
  thisMonthAmount: 299.99,
}

// Mock 数据 - 购买记录
const mockPurchases = [
  {
    id: "ORD202501281432",
    packageName: "年度尊享套餐",
    packageDetails: "1TB 流量 · VIP 2 · 365 天",
    amount: 299.99,
    status: "completed",
    paymentMethod: "balance",
    createdAt: "2025-01-28 14:32:00",
    completedAt: "2025-01-28 14:32:15",
  },
  {
    id: "ORD202501251015",
    packageName: "季度标准套餐",
    packageDetails: "300GB 流量 · VIP 1 · 90 天",
    amount: 49.99,
    status: "completed",
    paymentMethod: "alipay",
    createdAt: "2025-01-25 10:15:00",
    completedAt: "2025-01-25 10:15:22",
  },
  {
    id: "ORD202501200945",
    packageName: "月度体验套餐",
    packageDetails: "100GB 流量 · VIP 1 · 30 天",
    amount: 19.99,
    status: "completed",
    paymentMethod: "wechat",
    createdAt: "2025-01-20 09:45:00",
    completedAt: "2025-01-20 09:45:18",
  },
  {
    id: "ORD202501151630",
    packageName: "流量重置包",
    packageDetails: "额外 500GB 流量",
    amount: 39.99,
    status: "completed",
    paymentMethod: "balance",
    createdAt: "2025-01-15 16:30:00",
    completedAt: "2025-01-15 16:30:10",
  },
  {
    id: "ORD202501101240",
    packageName: "旗舰尊贵套餐",
    packageDetails: "3TB 流量 · VIP 3 · 365 天",
    amount: 499.99,
    status: "failed",
    paymentMethod: "alipay",
    createdAt: "2025-01-10 12:40:00",
    completedAt: null,
    failureReason: "支付超时",
  },
  {
    id: "ORD202501050855",
    packageName: "月度体验套餐",
    packageDetails: "100GB 流量 · VIP 1 · 30 天",
    amount: 19.99,
    status: "completed",
    paymentMethod: "balance",
    createdAt: "2025-01-05 08:55:00",
    completedAt: "2025-01-05 08:55:08",
  },
  {
    id: "ORD202412281820",
    packageName: "年度尊享套餐",
    packageDetails: "1TB 流量 · VIP 2 · 365 天",
    amount: 299.99,
    status: "completed",
    paymentMethod: "wechat",
    createdAt: "2024-12-28 18:20:00",
    completedAt: "2024-12-28 18:20:25",
  },
  {
    id: "ORD202412201410",
    packageName: "季度标准套餐",
    packageDetails: "300GB 流量 · VIP 1 · 90 天",
    amount: 49.99,
    status: "completed",
    paymentMethod: "alipay",
    createdAt: "2024-12-20 14:10:00",
    completedAt: "2024-12-20 14:10:16",
  },
]

type PurchaseStatus = "completed" | "pending" | "failed"
type PaymentMethod = "balance" | "alipay" | "wechat"

export default function Purchases() {
  const [selectedStatus, setSelectedStatus] = useState<PurchaseStatus | "all">("all")

  const getStatusBadge = (status: PurchaseStatus) => {
    switch (status) {
      case "completed":
        return <Badge variant="success">已完成</Badge>
      case "pending":
        return <Badge variant="default">处理中</Badge>
      case "failed":
        return <Badge variant="destructive">失败</Badge>
    }
  }

  const getPaymentMethodBadge = (method: PaymentMethod) => {
    const methods = {
      balance: { label: "余额支付", color: "bg-green-100 text-green-700" },
      alipay: { label: "支付宝", color: "bg-blue-100 text-blue-700" },
      wechat: { label: "微信支付", color: "bg-green-100 text-green-700" },
    }
    const { label, color } = methods[method]
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium ${color}`}>
        {label}
      </span>
    )
  }

  const filteredPurchases =
    selectedStatus === "all"
      ? mockPurchases
      : mockPurchases.filter((p) => p.status === selectedStatus)

  const totalFiltered = filteredPurchases.length

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">购买记录</h1>
        <p className="text-gray-600 mt-1">查看您的套餐购买历史和订单详情</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-material bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">总订单数</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {mockPurchaseStats.totalOrders}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-200 flex items-center justify-center">
                <ShoppingCart className="h-7 w-7 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-material bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">累计消费</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  ¥{mockPurchaseStats.totalAmount.toFixed(2)}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-green-200 flex items-center justify-center">
                <CreditCard className="h-7 w-7 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-material bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">本月消费</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                  ¥{mockPurchaseStats.thisMonthAmount.toFixed(2)}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-orange-200 flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 筛选和结果统计 */}
      <Card className="card-material">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>订单列表</CardTitle>
            <div className="flex gap-2">
              <Badge
                variant={selectedStatus === "all" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedStatus("all")}
              >
                全部 ({mockPurchases.length})
              </Badge>
              <Badge
                variant={selectedStatus === "completed" ? "success" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedStatus("completed")}
              >
                已完成 ({mockPurchases.filter((p) => p.status === "completed").length})
              </Badge>
              <Badge
                variant={selectedStatus === "failed" ? "destructive" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedStatus("failed")}
              >
                失败 ({mockPurchases.filter((p) => p.status === "failed").length})
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {totalFiltered > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">订单号</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">套餐信息</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">金额</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">支付方式</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">状态</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">创建时间</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPurchases.map((purchase) => (
                    <tr
                      key={purchase.id}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <span className="text-sm font-mono text-gray-900">
                          {purchase.id}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4 text-gray-500" />
                            <span className="text-sm font-medium text-gray-900">
                              {purchase.packageName}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500 mt-1 ml-6">
                            {purchase.packageDetails}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-semibold text-gray-900">
                          ¥{purchase.amount.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {getPaymentMethodBadge(purchase.paymentMethod as PaymentMethod)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(purchase.status as PurchaseStatus)}
                        {purchase.status === "failed" && purchase.failureReason && (
                          <p className="text-xs text-red-600 mt-1">
                            {purchase.failureReason}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{purchase.createdAt}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>暂无相关订单记录</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 购买提示 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-semibold">订单说明</p>
            <ul className="space-y-1 list-disc list-inside text-blue-800">
              <li>订单完成后套餐会立即激活，流量从激活时间开始计算</li>
              <li>支付失败不会扣款，您可以重新发起购买</li>
              <li>如有疑问请联系客服提交工单</li>
              <li>支付完成后请等待 1-3 分钟，系统会自动为您激活套餐</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
