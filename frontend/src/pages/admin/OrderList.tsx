import { useState } from "react"
import { Receipt, Search, Eye, CheckCircle, XCircle, Clock } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table"

// Mock 订单数据
interface Order {
  id: number
  order_no: string
  user_id: number
  user_email: string
  product_name: string
  amount: number
  payment_method: string
  status: "completed" | "pending" | "failed" | "refunded"
  created_at: string
  paid_at: string | null
}

const mockOrders: Order[] = [
  {
    id: 1,
    order_no: "ORD-20260201-001",
    user_id: 2,
    user_email: "user1@example.com",
    product_name: "VIP 1 套餐 - 月付",
    amount: 99.00,
    payment_method: "支付宝",
    status: "completed",
    created_at: "2026-02-01T10:30:00",
    paid_at: "2026-02-01T10:31:00",
  },
  {
    id: 2,
    order_no: "ORD-20260201-002",
    user_id: 3,
    user_email: "vip@example.com",
    product_name: "VIP 2 套餐 - 年付",
    amount: 1188.00,
    payment_method: "微信支付",
    status: "completed",
    created_at: "2026-02-01T14:20:00",
    paid_at: "2026-02-01T14:22:00",
  },
  {
    id: 3,
    order_no: "ORD-20260202-003",
    user_id: 4,
    user_email: "test@example.com",
    product_name: "VIP 1 套餐 - 月付",
    amount: 99.00,
    payment_method: "支付宝",
    status: "pending",
    created_at: "2026-02-02T09:00:00",
    paid_at: null,
  },
  {
    id: 4,
    order_no: "ORD-20260130-004",
    user_id: 5,
    user_email: "disabled@example.com",
    product_name: "VIP 1 套餐 - 月付",
    amount: 99.00,
    payment_method: "支付宝",
    status: "failed",
    created_at: "2026-01-30T16:45:00",
    paid_at: null,
  },
  {
    id: 5,
    order_no: "ORD-20260128-005",
    user_id: 2,
    user_email: "user1@example.com",
    product_name: "VIP 3 套餐 - 季付",
    amount: 268.00,
    payment_method: "微信支付",
    status: "refunded",
    created_at: "2026-01-28T11:30:00",
    paid_at: "2026-01-28T11:32:00",
  },
  {
    id: 6,
    order_no: "ORD-20260201-006",
    user_id: 3,
    user_email: "vip@example.com",
    product_name: "流量充值包 100GB",
    amount: 49.00,
    payment_method: "支付宝",
    status: "completed",
    created_at: "2026-02-01T18:00:00",
    paid_at: "2026-02-01T18:01:00",
  },
]

export default function AdminOrderList() {
  const [orders] = useState<Order[]>(mockOrders)
  const [searchTerm, setSearchTerm] = useState("")
  const [total] = useState(6)

  // 过滤订单
  const filteredOrders = orders.filter(
    (order) =>
      order.order_no.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.product_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="success" className="gap-1.5">
            <CheckCircle className="h-3 w-3" />
            已完成
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="warning" className="gap-1.5">
            <Clock className="h-3 w-3" />
            待支付
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1.5">
            <XCircle className="h-3 w-3" />
            失败
          </Badge>
        )
      case "refunded":
        return (
          <Badge variant="secondary" className="gap-1.5">
            <span className="text-xs">已退款</span>
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

  const handleView = (orderId: number) => {
    console.log("View order:", orderId)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">订单审计</h1>
          <p className="text-gray-600 mt-1">全站订单流水记录与审计</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总订单</p>
                <p className="text-2xl font-bold text-gray-900">{orders.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Receipt className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">已完成</p>
                <p className="text-2xl font-bold text-green-600">
                  {orders.filter(o => o.status === "completed").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">待支付</p>
                <p className="text-2xl font-bold text-orange-600">
                  {orders.filter(o => o.status === "pending").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总收入</p>
                <p className="text-2xl font-bold text-red-600">
                  ¥{orders
                    .filter(o => o.status === "completed")
                    .reduce((sum, o) => sum + o.amount, 0)
                    .toFixed(0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-xl">💰</span>
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
                placeholder="搜索订单号、邮箱或商品名称..."
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

      {/* 订单列表表格 - 紧凑布局 */}
      <Card>
        <CardHeader>
          <CardTitle>订单列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>订单号</TableHead>
                <TableHead>商品</TableHead>
                <TableHead>用户</TableHead>
                <TableHead>金额</TableHead>
                <TableHead>支付方式</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>支付时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium text-xs">{order.id}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {order.order_no}
                    </TableCell>
                    <TableCell className="text-sm max-w-[150px]">
                      <div className="truncate" title={order.product_name}>
                        {order.product_name}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">
                      <div>
                        <p className="text-xs text-gray-500">UID: {order.user_id}</p>
                        <p className="truncate max-w-[120px]" title={order.user_email}>
                          {order.user_email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="font-semibold text-sm">
                      ¥{order.amount.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {order.payment_method}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(order.status)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {formatDateTime(order.created_at)}
                    </TableCell>
                    <TableCell className="text-xs text-gray-600">
                      {formatDateTime(order.paid_at)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleView(order.id)}
                        title="查看详情"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={10} className="text-center text-sm text-gray-500">
                  显示 1-{filteredOrders.length} 条，共 {total} 条记录
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
