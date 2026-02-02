import { useState } from "react"
import { MessageCircle, Edit, Trash2, Reply, Clock, CheckCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table"

// Mock 工单数据
interface Ticket {
  id: number
  user_id: number
  user_email: string
  title: string
  status: "open" | "pending" | "closed"
  priority: "low" | "medium" | "high"
  reply_count: number
  created_at: string
  updated_at: string
}

const mockTickets: Ticket[] = [
  {
    id: 1,
    user_id: 2,
    user_email: "user1@example.com",
    title: "节点连接不稳定，频繁断线",
    status: "open",
    priority: "high",
    reply_count: 3,
    created_at: "2026-02-01T10:30:00",
    updated_at: "2026-02-02T08:15:00",
  },
  {
    id: 2,
    user_id: 3,
    user_email: "vip@example.com",
    title: "流量统计不准确，请核查",
    status: "pending",
    priority: "medium",
    reply_count: 5,
    created_at: "2026-01-30T14:20:00",
    updated_at: "2026-02-01T16:45:00",
  },
  {
    id: 3,
    user_id: 4,
    user_email: "test@example.com",
    title: "申请退款，无法使用服务",
    status: "open",
    priority: "high",
    reply_count: 1,
    created_at: "2026-02-02T09:00:00",
    updated_at: "2026-02-02T09:00:00",
  },
  {
    id: 4,
    user_id: 5,
    user_email: "disabled@example.com",
    title: "账户被误封，请求解封",
    status: "closed",
    priority: "low",
    reply_count: 8,
    created_at: "2026-01-25T11:30:00",
    updated_at: "2026-01-28T10:20:00",
  },
  {
    id: 5,
    user_id: 2,
    user_email: "user1@example.com",
    title: "建议增加新加坡节点",
    status: "pending",
    priority: "low",
    reply_count: 2,
    created_at: "2026-01-28T15:45:00",
    updated_at: "2026-01-29T09:30:00",
  },
]

export default function AdminTicketList() {
  const [tickets] = useState<Ticket[]>(mockTickets)
  const [total] = useState(5)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return (
          <Badge variant="destructive" className="gap-1.5">
            <AlertCircle className="h-3 w-3" />
            待处理
          </Badge>
        )
      case "pending":
        return (
          <Badge variant="warning" className="gap-1.5">
            <Clock className="h-3 w-3" />
            处理中
          </Badge>
        )
      case "closed":
        return (
          <Badge variant="success" className="gap-1.5">
            <CheckCircle className="h-3 w-3" />
            已关闭
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "high":
        return <Badge variant="destructive" className="text-xs">高</Badge>
      case "medium":
        return <Badge variant="warning" className="text-xs">中</Badge>
      case "low":
        return <Badge variant="secondary" className="text-xs">低</Badge>
      default:
        return <Badge variant="outline">{priority}</Badge>
    }
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString("zh-CN", {
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const handleReply = (ticketId: number) => {
    console.log("Reply to ticket:", ticketId)
  }

  const handleEdit = (ticketId: number) => {
    console.log("Edit ticket:", ticketId)
  }

  const handleDelete = (ticketId: number) => {
    console.log("Delete ticket:", ticketId)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">工单管理</h1>
          <p className="text-gray-600 mt-1">处理用户提交的技术问题和咨询</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总工单</p>
                <p className="text-2xl font-bold text-gray-900">{tickets.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageCircle className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">待处理</p>
                <p className="text-2xl font-bold text-red-600">
                  {tickets.filter(t => t.status === "open").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">处理中</p>
                <p className="text-2xl font-bold text-orange-600">
                  {tickets.filter(t => t.status === "pending").length}
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
                <p className="text-sm text-gray-600 mb-1">高优先级</p>
                <p className="text-2xl font-bold text-purple-600">
                  {tickets.filter(t => t.priority === "high").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-2xl">🔥</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 工单列表表格 */}
      <Card>
        <CardHeader>
          <CardTitle>工单列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>标题</TableHead>
                <TableHead>发起人</TableHead>
                <TableHead>优先级</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>回复数</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead>最后更新</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tickets.map((ticket) => (
                <TableRow key={ticket.id}>
                  <TableCell className="font-medium">#{ticket.id}</TableCell>
                  <TableCell className="font-semibold max-w-[300px]">
                    <div className="truncate" title={ticket.title}>
                      {ticket.title}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-mono text-xs text-gray-600">UID: {ticket.user_id}</p>
                      <p className="text-sm text-gray-900">{ticket.user_email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(ticket.priority)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(ticket.status)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4 text-gray-400" />
                      <span className="font-semibold text-gray-900">{ticket.reply_count}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(ticket.created_at)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {formatDate(ticket.updated_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                        onClick={() => handleReply(ticket.id)}
                        title="回复"
                      >
                        <Reply className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEdit(ticket.id)}
                        title="编辑"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(ticket.id)}
                        title="删除"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={9} className="text-center text-sm text-gray-500">
                  显示 1-{tickets.length} 条，共 {total} 条记录
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
