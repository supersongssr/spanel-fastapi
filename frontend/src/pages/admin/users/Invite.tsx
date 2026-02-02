import { useState } from "react"
import { Receipt, Plus, Gift, Users, DollarSign, Copy, Check } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

interface InviteCode {
  id: number
  code: string
  userId: number
  userEmail: string
  maxUses: number
  usedCount: number
  status: "active" | "expired" | "disabled"
  createdAt: string
  expiresAt?: string
}

interface RebateRecord {
  id: number
  inviterId: number
  inviterEmail: string
  inviteeId: number
  inviteeEmail: string
  amount: number
  type: "gift" | "percentage"
  status: "completed" | "pending"
  createdAt: string
}

const mockInviteCodes: InviteCode[] = [
  {
    id: 1,
    code: "WELCOME2024",
    userId: 1001,
    userEmail: "user@example.com",
    maxUses: 100,
    usedCount: 32,
    status: "active",
    createdAt: "2026-01-01T00:00:00",
  },
  {
    id: 2,
    code: "VIPONLY",
    userId: 1002,
    userEmail: "vip@example.com",
    maxUses: 10,
    usedCount: 10,
    status: "expired",
    createdAt: "2025-12-01T00:00:00",
  },
  {
    id: 3,
    code: "NEWUSER2024",
    userId: 1003,
    userEmail: "new@example.com",
    maxUses: 50,
    usedCount: 5,
    status: "active",
    createdAt: "2026-01-15T00:00:00",
  },
]

const mockRebateRecords: RebateRecord[] = [
  {
    id: 1,
    inviterId: 1001,
    inviterEmail: "user@example.com",
    inviteeId: 2001,
    inviteeEmail: "newuser1@example.com",
    amount: 5.00,
    type: "gift",
    status: "completed",
    createdAt: "2026-01-20T10:30:00",
  },
  {
    id: 2,
    inviterId: 1001,
    inviterEmail: "user@example.com",
    inviteeId: 2002,
    inviteeEmail: "newuser2@example.com",
    amount: 6.00,
    type: "gift",
    status: "completed",
    createdAt: "2026-01-21T14:15:00",
  },
  {
    id: 3,
    inviterId: 1002,
    inviterEmail: "vip@example.com",
    inviteeId: 2003,
    inviteeEmail: "newuser3@example.com",
    amount: 0.99,
    type: "percentage",
    status: "completed",
    createdAt: "2026-01-22T09:00:00",
  },
]

export default function UserInvite() {
  const [inviteCodes, setInviteCodes] = useState<InviteCode[]>(mockInviteCodes)
  const [rebateRecords] = useState<RebateRecord[]>(mockRebateRecords)
  const [showAddForm, setShowAddForm] = useState(false)

  // 添加邀请码表单
  const [addForm, setAddForm] = useState({
    userId: "",
    userEmail: "",
    num: 10,
  })

  // 复制状态
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  const handleAddInviteCodes = () => {
    if (!addForm.userEmail.trim()) {
      alert("请输入用户ID或邮箱")
      return
    }

    // 模拟添加邀请码
    const newCodes: InviteCode[] = Array.from({ length: addForm.num }, (_, i) => ({
      id: Date.now() + i,
      code: `CODE${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      userId: Number(addForm.userId) || 0,
      userEmail: addForm.userEmail,
      maxUses: 100,
      usedCount: 0,
      status: "active" as const,
      createdAt: new Date().toISOString(),
    }))

    setInviteCodes([...newCodes, ...inviteCodes])
    alert(`已成功为用户 ${addForm.userEmail} 生成 ${addForm.num} 个邀请码`)
    setAddForm({ userId: "", userEmail: "", num: 10 })
    setShowAddForm(false)
  }

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  const handleToggleStatus = (id: number) => {
    setInviteCodes(inviteCodes.map(code =>
      code.id === id
        ? {
            ...code,
            status: code.status === "active" ? "disabled" : "active"
          }
        : code
    ))
  }

  const handleDeleteCode = (id: number) => {
    if (confirm("确定要删除这个邀请码吗？")) {
      setInviteCodes(inviteCodes.filter(code => code.id !== id))
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="success">可用</Badge>
      case "expired":
        return <Badge variant="secondary">已过期</Badge>
      case "disabled":
        return <Badge variant="destructive">已禁用</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">邀请与返利</h1>
          <p className="text-gray-600 mt-1">管理邀请码与返利记录</p>
        </div>
        <Button
          className="bg-gradient-red hover:bg-primary-admin-hover gap-2"
          onClick={() => setShowAddForm(!showAddForm)}
        >
          <Plus className="h-5 w-5" />
          生成邀请码
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总邀请码数</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {inviteCodes.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <Gift className="h-6 w-6 text-primary-admin" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">活跃邀请码</p>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {inviteCodes.filter(c => c.status === "active").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总返利金额</p>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  ¥{rebateRecords.reduce((sum, r) => sum + r.amount, 0).toFixed(2)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-primary-admin" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">邀请人数</p>
                <p className="text-3xl font-bold text-blue-600 mt-2">
                  {rebateRecords.length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 添加邀请码表单 */}
      {showAddForm && (
        <Card className="border-2 border-red-200">
          <CardHeader>
            <CardTitle className="text-red-900">生成邀请码</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-800">
                公共邀请码功能已废弃，如需开放注册请在系统设置中将注册模式设置为"开放注册"
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="userId">用户ID或邮箱</Label>
              <Input
                id="userId"
                placeholder="请输入用户的ID或完整邮箱"
                value={addForm.userEmail}
                onChange={(e) => setAddForm({ ...addForm, userEmail: e.target.value })}
              />
              <p className="text-xs text-gray-500">填写用户的ID，或者用户的完整邮箱</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="num">邀请码数量</Label>
              <Input
                id="num"
                type="number"
                min="1"
                max="1000"
                value={addForm.num}
                onChange={(e) => setAddForm({ ...addForm, num: Number(e.target.value) })}
              />
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleAddInviteCodes}
                className="bg-gradient-red hover:bg-primary-admin-hover gap-2"
              >
                <Plus className="h-4 w-4" />
                生成邀请码
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowAddForm(false)
                  setAddForm({ userId: "", userEmail: "", num: 10 })
                }}
              >
                取消
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 邀请码列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-6 w-6 text-primary-admin" />
            邀请码列表
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {inviteCodes.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Gift className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>暂无邀请码</p>
              </div>
            ) : (
              inviteCodes.map((code) => (
                <div
                  key={code.id}
                  className={`border rounded-lg p-5 transition-all ${
                    code.status === "active"
                      ? "bg-white border-gray-200 shadow-sm"
                      : "bg-gray-50 border-gray-200 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-xl font-mono font-bold text-gray-900">
                          {code.code}
                        </h3>
                        {getStatusBadge(code.status)}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCopyCode(code.code)}
                          className="h-7 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          {copiedCode === code.code ? (
                            <>
                              <Check className="h-3 w-3 mr-1" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="h-3 w-3 mr-1" />
                              复制
                            </>
                          )}
                        </Button>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">所属用户：</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {code.userEmail} (ID: {code.userId})
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">使用次数：</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {code.usedCount} / {code.maxUses}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">创建时间：</span>
                          <span className="text-gray-900 ml-2">
                            {new Date(code.createdAt).toLocaleString("zh-CN")}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">状态：</span>
                          <span className="ml-2">
                            {code.usedCount >= code.maxUses ? (
                              <Badge variant="secondary">已用完</Badge>
                            ) : code.status === "active" ? (
                            <Badge variant="success">可用</Badge>
                          ) : (
                            getStatusBadge(code.status)
                          )}
                          </span>
                        </div>
                      </div>

                      {/* 进度条 */}
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-gradient-red h-2 rounded-full transition-all"
                          style={{
                            width: `${Math.min((code.usedCount / code.maxUses) * 100, 100)}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleStatus(code.id)}
                        disabled={code.usedCount >= code.maxUses}
                      >
                        {code.status === "active" ? "禁用" : "启用"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDeleteCode(code.id)}
                      >
                        <Gift className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* 返利记录 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-6 w-6 text-primary-admin" />
            返利记录
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {rebateRecords.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Receipt className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>暂无返利记录</p>
              </div>
            ) : (
              rebateRecords.map((record) => (
                <div
                  key={record.id}
                  className="border border-gray-200 rounded-lg p-5 bg-white hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          返利记录 #{record.id}
                        </h3>
                        {record.status === "completed" ? (
                          <Badge variant="success">已完成</Badge>
                        ) : (
                          <Badge variant="secondary">处理中</Badge>
                        )}
                        <Badge variant={record.type === "gift" ? "default" : "outline"}>
                          {record.type === "gift" ? "固定奖励" : "百分比返利"}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">邀请人：</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {record.inviterEmail} (ID: {record.inviterId})
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">被邀请人：</span>
                          <span className="font-medium text-gray-900 ml-2">
                            {record.inviteeEmail} (ID: {record.inviteeId})
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">返利金额：</span>
                          <span className="text-2xl font-bold text-red-600 ml-2">
                            ¥{record.amount.toFixed(2)}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">创建时间：</span>
                          <span className="text-gray-900 ml-2">
                            {new Date(record.createdAt).toLocaleString("zh-CN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
