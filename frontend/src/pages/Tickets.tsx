import { useState } from "react"
import {
  MessageCircle,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Calendar,
  FileText,
  Send,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Textarea } from "@/components/ui/Textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog"
import { toast } from "sonner"

// Mock 数据 - 工单统计
const mockTicketStats = {
  total: 15,
  open: 3,
  pending: 5,
  closed: 7,
}

// Mock 数据 - 工单列表
const mockTickets = [
  {
    id: 1001,
    title: "节点连接不稳定，频繁断线",
    content: "最近两天使用 JP-01 节点时，每隔几分钟就会断开连接，需要重新订阅。已经尝试重启客户端和更新订阅链接，问题依然存在。",
    status: "open",
    priority: "high",
    createdAt: "2025-01-28 14:32",
    updatedAt: "2025-01-28 16:45",
    replies: 2,
  },
  {
    id: 1002,
    title: "咨询企业套餐购买方式",
    content: "我们公司需要为 20 名员工购买 VPN 服务，请问是否有企业套餐优惠？具体如何购买和开具发票？",
    status: "pending",
    priority: "normal",
    createdAt: "2025-01-27 10:15",
    updatedAt: "2025-01-27 14:20",
    replies: 3,
  },
  {
    id: 1003,
    title: "流量统计异常",
    content: "我的账户显示流量已使用 80%，但实际使用应该只有 30% 左右。请帮忙核查流量统计是否正确。",
    status: "open",
    priority: "medium",
    createdAt: "2025-01-26 09:20",
    updatedAt: "2025-01-26 11:30",
    replies: 1,
  },
  {
    id: 1004,
    title: "无法访问 Netflix",
    content: "使用 US-CA-05 节点无法解锁 Netflix，提示代理检测。其他流媒体平台正常。",
    status: "closed",
    priority: "low",
    createdAt: "2025-01-25 16:40",
    updatedAt: "2025-01-26 10:15",
    replies: 4,
  },
  {
    id: 1005,
    title: "退款申请",
    content: "误操作购买了年度套餐，实际只需要月度套餐。希望能退款或改为月度套餐。",
    status: "closed",
    priority: "high",
    createdAt: "2025-01-24 13:55",
    updatedAt: "2025-01-25 09:30",
    replies: 2,
  },
]

type TicketStatus = "open" | "pending" | "closed"
type TicketPriority = "high" | "medium" | "normal" | "low"

export default function Tickets() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [ticketTitle, setTicketTitle] = useState("")
  const [ticketContent, setTicketContent] = useState("")

  const handleSubmit = () => {
    if (!ticketTitle.trim() || !ticketContent.trim()) {
      toast.error("请填写工单标题和内容")
      return
    }

    setSubmitting(true)

    // 模拟提交
    setTimeout(() => {
      setSubmitting(false)
      setDialogOpen(false)
      setTicketTitle("")
      setTicketContent("")
      toast.success("工单提交成功", {
        description: "我们的客服团队会尽快回复您",
      })
    }, 1500)
  }

  const getStatusBadge = (status: TicketStatus) => {
    switch (status) {
      case "open":
        return <Badge variant="destructive">待处理</Badge>
      case "pending":
        return <Badge variant="default">处理中</Badge>
      case "closed":
        return <Badge variant="success">已关闭</Badge>
    }
  }

  const getPriorityBadge = (priority: TicketPriority) => {
    const styles = {
      high: "bg-red-100 text-red-700 border-red-200",
      medium: "bg-orange-100 text-orange-700 border-orange-200",
      normal: "bg-blue-100 text-blue-700 border-blue-200",
      low: "bg-gray-100 text-gray-700 border-gray-200",
    }
    const labels = {
      high: "高",
      medium: "中",
      normal: "普通",
      low: "低",
    }
    return (
      <span className={`px-2 py-1 rounded text-xs font-medium border ${styles[priority]}`}>
        {labels[priority]}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">技术支持</h1>
          <p className="text-gray-600 mt-1">提交工单，获取专业技术支持</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="gap-2" size="lg">
          <Plus className="h-4 w-4" />
          发起工单
        </Button>
      </div>

      {/* 工单统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-material bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">总工单</p>
                <p className="text-3xl font-bold text-blue-900 mt-2">
                  {mockTicketStats.total}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-blue-200 flex items-center justify-center">
                <FileText className="h-7 w-7 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-material bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">待处理</p>
                <p className="text-3xl font-bold text-red-900 mt-2">
                  {mockTicketStats.open}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-red-200 flex items-center justify-center">
                <AlertCircle className="h-7 w-7 text-red-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-material bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">处理中</p>
                <p className="text-3xl font-bold text-orange-900 mt-2">
                  {mockTicketStats.pending}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-orange-200 flex items-center justify-center">
                <Clock className="h-7 w-7 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-material bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">已关闭</p>
                <p className="text-3xl font-bold text-green-900 mt-2">
                  {mockTicketStats.closed}
                </p>
              </div>
              <div className="h-14 w-14 rounded-full bg-green-200 flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 工单列表 */}
      <Card className="card-material">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-gray-700" />
            我的工单
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTickets.map((ticket) => (
              <div
                key={ticket.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        #{ticket.id} - {ticket.title}
                      </h3>
                      {getStatusBadge(ticket.status as TicketStatus)}
                      {getPriorityBadge(ticket.priority as TicketPriority)}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">{ticket.content}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-6 text-gray-500">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <span>创建于 {ticket.createdAt}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MessageCircle className="h-4 w-4" />
                      <span>{ticket.replies} 条回复</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    查看详情
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 创建工单对话框 */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>创建新工单</DialogTitle>
            <DialogDescription>
              请详细描述您遇到的问题，我们会尽快为您处理
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">工单标题</Label>
              <Input
                id="title"
                placeholder="简要描述问题"
                value={ticketTitle}
                onChange={(e) => setTicketTitle(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">详细描述</Label>
              <Textarea
                id="content"
                placeholder="请详细描述您遇到的问题，包括错误信息、复现步骤等"
                className="min-h-[150px]"
                value={ticketContent}
                onChange={(e) => setTicketContent(e.target.value)}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={submitting}
            >
              取消
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} className="gap-2">
              {submitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  提交中...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  提交工单
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 帮助提示 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-semibold">工单处理说明</p>
            <ul className="space-y-1 list-disc list-inside text-blue-800">
              <li>工单按优先级处理：高优先级工单将在 2 小时内回复</li>
              <li>普通工单通常在 24 小时内得到回复</li>
              <li>请提供详细的问题描述和截图，以便快速定位问题</li>
              <li>避免重复提交相同问题的工单</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
