import { useState } from "react"
import { Plus, Edit, Trash2, ShieldAlert, Shield, Clock, Ban } from "lucide-react"
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

// Mock 审计规则数据
interface AuditRule {
  id: number
  name: string
  type: "traffic" | "login" | "payment" | "content"
  match_pattern: string
  action: "block" | "warn" | "log"
  is_active: boolean
  trigger_count: number
  created_at: string
}

const mockRules: AuditRule[] = [
  {
    id: 1,
    name: "异常流量检测",
    type: "traffic",
    match_pattern: "单日流量 > 100GB",
    action: "warn",
    is_active: true,
    trigger_count: 23,
    created_at: "2026-01-15T10:00:00",
  },
  {
    id: 2,
    name: "异地登录告警",
    type: "login",
    match_pattern: "IP 距离上次登录 > 2000km",
    action: "warn",
    is_active: true,
    trigger_count: 156,
    created_at: "2026-01-20T14:30:00",
  },
  {
    id: 3,
    name: "高频请求拦截",
    type: "content",
    match_pattern: "1分钟内请求 > 100次",
    action: "block",
    is_active: true,
    trigger_count: 45,
    created_at: "2026-01-25T09:15:00",
  },
  {
    id: 4,
    name: "支付异常监控",
    type: "payment",
    match_pattern: "单笔金额 > ¥1000",
    action: "log",
    is_active: false,
    trigger_count: 8,
    created_at: "2026-02-01T16:45:00",
  },
  {
    id: 5,
    name: "恶意IP封禁",
    type: "login",
    match_pattern: "IP 在黑名单中",
    action: "block",
    is_active: true,
    trigger_count: 312,
    created_at: "2026-01-10T08:00:00",
  },
]

export default function AuditRules() {
  const [rules] = useState<AuditRule[]>(mockRules)
  const [total] = useState(5)

  const getTypeBadge = (type: string) => {
    const typeMap = {
      traffic: { label: "流量", color: "bg-blue-100 text-blue-700" },
      login: { label: "登录", color: "bg-green-100 text-green-700" },
      payment: { label: "支付", color: "bg-purple-100 text-purple-700" },
      content: { label: "内容", color: "bg-orange-100 text-orange-700" },
    }
    const config = typeMap[type as keyof typeof typeMap] || typeMap.content
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const getActionBadge = (action: string) => {
    switch (action) {
      case "block":
        return (
          <Badge variant="destructive" className="gap-1.5">
            <Ban className="h-3 w-3" />
            拦截
          </Badge>
        )
      case "warn":
        return (
          <Badge variant="warning" className="gap-1.5">
            <ShieldAlert className="h-3 w-3" />
            警告
          </Badge>
        )
      case "log":
        return (
          <Badge variant="secondary" className="gap-1.5">
            <Shield className="h-3 w-3" />
            记录
          </Badge>
        )
      default:
        return <Badge variant="outline">{action}</Badge>
    }
  }

  const handleEdit = (ruleId: number) => {
    console.log("Edit rule:", ruleId)
  }

  const handleDelete = (ruleId: number) => {
    console.log("Delete rule:", ruleId)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">审计规则</h1>
          <p className="text-gray-600 mt-1">配置系统安全审计与风控规则</p>
        </div>
        <Button className="bg-gradient-red hover:bg-primary-admin-hover gap-2 shadow-lg">
          <Plus className="h-5 w-5" />
          新增规则
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总规则</p>
                <p className="text-2xl font-bold text-gray-900">{rules.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">启用中</p>
                <p className="text-2xl font-bold text-green-600">
                  {rules.filter(r => r.is_active).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Shield className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总触发次数</p>
                <p className="text-2xl font-bold text-orange-600">
                  {rules.reduce((sum, r) => sum + r.trigger_count, 0)}
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
                <p className="text-sm text-gray-600 mb-1">拦截规则</p>
                <p className="text-2xl font-bold text-red-600">
                  {rules.filter(r => r.action === "block").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Ban className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 审计规则列表 */}
      <Card>
        <CardHeader>
          <CardTitle>规则列表</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">ID</TableHead>
                  <TableHead>规则名称</TableHead>
                  <TableHead>类型</TableHead>
                  <TableHead>匹配条件</TableHead>
                  <TableHead>处理动作</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>触发次数</TableHead>
                  <TableHead>创建时间</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rules.map((rule) => (
                  <TableRow key={rule.id}>
                    <TableCell className="font-medium">#{rule.id}</TableCell>
                    <TableCell className="font-semibold">{rule.name}</TableCell>
                    <TableCell>{getTypeBadge(rule.type)}</TableCell>
                    <TableCell className="font-mono text-sm text-gray-600">
                      {rule.match_pattern}
                    </TableCell>
                    <TableCell>{getActionBadge(rule.action)}</TableCell>
                    <TableCell>
                      {rule.is_active ? (
                        <Badge variant="success">启用</Badge>
                      ) : (
                        <Badge variant="secondary">禁用</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-gray-900">{rule.trigger_count}</span>
                    </TableCell>
                    <TableCell className="text-sm text-gray-600">
                      {new Date(rule.created_at).toLocaleDateString("zh-CN")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                          onClick={() => handleEdit(rule.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(rule.id)}
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
                    显示 1-{rules.length} 条，共 {total} 条记录
                  </TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
