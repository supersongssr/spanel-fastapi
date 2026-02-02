import { useState } from "react"
import { Bell, Plus, Trash2, Edit2, Save, Shield } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Label } from "@/components/ui/Label"
import { Switch } from "@/components/ui/Switch"

// Mock 公告数据
interface Announcement {
  id: number
  title: string
  content: string
  is_active: boolean
  created_at: string
}

const mockAnnouncements: Announcement[] = [
  {
    id: 1,
    title: "新年特惠活动开启！",
    content: "尊敬的用户，为感谢您的支持，所有套餐8折优惠，限时3天！活动期间充值还能获得额外20%的流量奖励。",
    is_active: true,
    created_at: "2026-02-01T10:00:00",
  },
  {
    id: 2,
    title: "节点维护通知",
    content: "我们将于2026年2月5日凌晨2:00-4:00对香港节点进行维护，期间可能影响使用，请提前做好准备。",
    is_active: true,
    created_at: "2026-01-30T16:00:00",
  },
  {
    id: 3,
    title: "新增台湾节点",
    content: "台湾台北节点已上线，VIP 1 及以上用户可使用，欢迎体验！",
    is_active: false,
    created_at: "2026-01-25T09:00:00",
  },
]

export default function AdminSettings() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")

  // 系统开关状态
  const [systemSettings, setSystemSettings] = useState({
    allowRegister: true,
    requireEmailVerify: true,
    enableInvite: true,
    maintainMode: false,
  })

  const handleDelete = (id: number) => {
    setAnnouncements(announcements.filter(a => a.id !== id))
  }

  const handleToggleActive = (id: number) => {
    setAnnouncements(announcements.map(a =>
      a.id === id ? { ...a, is_active: !a.is_active } : a
    ))
  }

  const handleAddAnnouncement = () => {
    if (!newTitle.trim() || !newContent.trim()) return

    const newAnnouncement: Announcement = {
      id: Date.now(),
      title: newTitle,
      content: newContent,
      is_active: true,
      created_at: new Date().toISOString(),
    }

    setAnnouncements([newAnnouncement, ...announcements])
    setNewTitle("")
    setNewContent("")
    setShowNewForm(false)
  }

  const handleSaveSettings = () => {
    console.log("Saving settings:", systemSettings)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-600 mt-1">管理系统配置与公告发布</p>
        </div>
        <Button className="bg-gradient-red hover:bg-primary-admin-hover gap-2 shadow-lg" onClick={handleSaveSettings}>
          <Save className="h-5 w-5" />
          保存设置
        </Button>
      </div>

      {/* 系统开关 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary-admin" />
            系统开关
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex-1">
              <Label htmlFor="allowRegister" className="text-base font-medium">
                允许新用户注册
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                关闭后将禁止新用户注册，仅管理员可创建账户
              </p>
            </div>
            <Switch
              id="allowRegister"
              checked={systemSettings.allowRegister}
              onCheckedChange={(checked) =>
                setSystemSettings({ ...systemSettings, allowRegister: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex-1">
              <Label htmlFor="requireEmailVerify" className="text-base font-medium">
                强制邮箱验证
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                新用户注册后必须验证邮箱才能使用服务
              </p>
            </div>
            <Switch
              id="requireEmailVerify"
              checked={systemSettings.requireEmailVerify}
              onCheckedChange={(checked) =>
                setSystemSettings({ ...systemSettings, requireEmailVerify: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div className="flex-1">
              <Label htmlFor="enableInvite" className="text-base font-medium">
                启用邀请返利
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                用户邀请好友注册可获得佣金奖励
              </p>
            </div>
            <Switch
              id="enableInvite"
              checked={systemSettings.enableInvite}
              onCheckedChange={(checked) =>
                setSystemSettings({ ...systemSettings, enableInvite: checked })
              }
            />
          </div>

          <div className="flex items-center justify-between py-3">
            <div className="flex-1">
              <Label htmlFor="maintainMode" className="text-base font-medium text-red-600">
                维护模式
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                开启后除管理员外所有用户无法访问系统
              </p>
            </div>
            <Switch
              id="maintainMode"
              checked={systemSettings.maintainMode}
              onCheckedChange={(checked) =>
                setSystemSettings({ ...systemSettings, maintainMode: checked })
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* 公告管理 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-6 w-6 text-primary-admin" />
              公告管理
            </CardTitle>
            <Button
              className="bg-gradient-red hover:bg-primary-admin-hover gap-2"
              onClick={() => setShowNewForm(!showNewForm)}
            >
              <Plus className="h-5 w-5" />
              新增公告
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 新增公告表单 */}
          {showNewForm && (
            <div className="rounded-lg bg-red-50 border-2 border-red-200 p-6 space-y-4">
              <h3 className="font-semibold text-red-900">发布新公告</h3>
              <div className="space-y-2">
                <Label htmlFor="newTitle">公告标题</Label>
                <Input
                  id="newTitle"
                  placeholder="请输入公告标题..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="bg-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newContent">公告内容</Label>
                <Textarea
                  id="newContent"
                  placeholder="请输入公告内容..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  rows={4}
                  className="bg-white resize-none"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  className="bg-gradient-red hover:bg-primary-admin-hover gap-2"
                  onClick={handleAddAnnouncement}
                >
                  <Plus className="h-4 w-4" />
                  发布公告
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowNewForm(false)
                    setNewTitle("")
                    setNewContent("")
                  }}
                >
                  取消
                </Button>
              </div>
            </div>
          )}

          {/* 公告列表 */}
          <div className="space-y-3">
            {announcements.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>暂无公告</p>
              </div>
            ) : (
              announcements.map((announcement) => (
                <div
                  key={announcement.id}
                  className={`border rounded-lg p-5 transition-all ${
                    announcement.is_active
                      ? "bg-white border-gray-200 shadow-sm"
                      : "bg-gray-50 border-gray-200 opacity-75"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {announcement.title}
                        </h3>
                        {announcement.is_active ? (
                          <Badge variant="success" className="gap-1">
                            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
                            已发布
                          </Badge>
                        ) : (
                          <Badge variant="secondary">草稿</Badge>
                        )}
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {announcement.content}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>创建时间: {new Date(announcement.created_at).toLocaleString("zh-CN")}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(announcement.id)}
                      >
                        {announcement.is_active ? "下架" : "发布"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(announcement.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
