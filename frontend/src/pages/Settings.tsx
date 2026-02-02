import { useState } from "react"
import {
  Shield,
  Key,
  Link as LinkIcon,
  RefreshCw,
  Bell,
  Mail,
  Send,
  Eye,
  EyeOff,
  Save,
  Check,
  User,
  Lock,
  Smartphone,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Switch } from "@/components/ui/Switch"
import { toast } from "sonner"

// Mock 用户数据
const mockUserData = {
  username: "demo_user",
  email: "user@example.com",
  uuid: "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  method: "aes-256-gcm",
  protocol: "v2ray",
  obfs: "tls",
  subUrl: "https://example.com/sub/a1b2c3d4-e5f6-7890-abcd",
  telegramId: "",
  emailNotify: true,
  tgNotify: false,
  dailyReport: true,
}

export default function Settings() {
  // 安全设置状态
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [changingPassword, setChangingPassword] = useState(false)

  // 连接信息状态
  const [resettingSub, setResettingSub] = useState(false)

  // 通知设置状态
  const [telegramId, setTelegramId] = useState(mockUserData.telegramId)
  const [emailNotify, setEmailNotify] = useState(mockUserData.emailNotify)
  const [tgNotify, setTgNotify] = useState(mockUserData.tgNotify)
  const [dailyReport, setDailyReport] = useState(mockUserData.dailyReport)
  const [savingNotify, setSavingNotify] = useState(false)

  // 处理密码修改
  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("请填写所有密码字段")
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error("新密码和确认密码不匹配")
      return
    }

    if (newPassword.length < 8) {
      toast.error("新密码长度至少为 8 位")
      return
    }

    setChangingPassword(true)

    // 模拟 API 调用
    setTimeout(() => {
      setChangingPassword(false)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      toast.success("密码修改成功", {
        description: "请使用新密码重新登录",
      })
    }, 1500)
  }

  // 处理订阅重置
  const handleResetSubscription = () => {
    if (!confirm("确定要重置订阅链接吗？这将生成新的 UUID。")) {
      return
    }

    setResettingSub(true)

    // 模拟 API 调用
    setTimeout(() => {
      setResettingSub(false)
      toast.success("订阅链接已重置", {
        description: "请更新所有设备的订阅配置",
      })
    }, 1500)
  }

  // 处理通知设置保存
  const handleSaveNotification = () => {
    setSavingNotify(true)

    // 模拟 API 调用
    setTimeout(() => {
      setSavingNotify(false)
      toast.success("通知设置已保存")
    }, 1000)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">个人设定</h1>
        <p className="text-gray-600 mt-1">管理您的账户安全、连接和通知偏好</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：主要设置区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 安全设置 */}
          <Card className="card-material">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-user" />
                安全设置
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">当前密码</Label>
                  <div className="relative">
                    <Input
                      id="current-password"
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="请输入当前密码"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new-password">新密码</Label>
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码（至少 8 位）"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">确认新密码</Label>
                  <Input
                    id="confirm-password"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button
                    type="submit"
                    disabled={changingPassword}
                    className="gap-2"
                  >
                    {changingPassword ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        处理中...
                      </>
                    ) : (
                      <>
                        <Key className="h-4 w-4" />
                        修改密码
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setCurrentPassword("")
                      setNewPassword("")
                      setConfirmPassword("")
                    }}
                  >
                    重置
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 连接信息 */}
          <Card className="card-material">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-blue-600" />
                连接信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* UUID */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-gray-600" />
                  UUID
                </Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={mockUserData.uuid}
                    className="font-mono text-sm bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(mockUserData.uuid)
                      toast.success("UUID 已复制")
                    }}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 加密方式 */}
              <div className="space-y-2">
                <Label>加密方式</Label>
                <Input
                  readOnly
                  value={mockUserData.method}
                  className="bg-gray-50"
                />
              </div>

              {/* 协议 */}
              <div className="space-y-2">
                <Label>传输协议</Label>
                <Input
                  readOnly
                  value={mockUserData.protocol}
                  className="bg-gray-50"
                />
              </div>

              {/* 混淆 */}
              <div className="space-y-2">
                <Label>混淆方式</Label>
                <Input
                  readOnly
                  value={mockUserData.obfs}
                  className="bg-gray-50"
                />
              </div>

              {/* 订阅链接 */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <LinkIcon className="h-4 w-4 text-gray-600" />
                  订阅链接
                </Label>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={mockUserData.subUrl}
                    className="font-mono text-sm bg-gray-50"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => {
                      navigator.clipboard.writeText(mockUserData.subUrl)
                      toast.success("订阅链接已复制")
                    }}
                  >
                    <LinkIcon className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* 重置订阅按钮 */}
              <div className="pt-4 border-t border-gray-200">
                <Button
                  variant="destructive"
                  onClick={handleResetSubscription}
                  disabled={resettingSub}
                  className="gap-2"
                >
                  {resettingSub ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      重置中...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="h-4 w-4" />
                      重置订阅链接
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 mt-2">
                  重置后将生成新的 UUID，所有设备需要更新订阅配置
                </p>
              </div>
            </CardContent>
          </Card>

          {/* 通知设置 */}
          <Card className="card-material">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-purple-600" />
                通知设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Telegram 绑定 */}
              <div className="space-y-3">
                <Label className="flex items-center gap-2">
                  <Send className="h-4 w-4 text-blue-500" />
                  Telegram ID
                </Label>
                <div className="flex gap-3">
                  <Input
                    value={telegramId}
                    onChange={(e) => setTelegramId(e.target.value)}
                    placeholder="输入您的 Telegram ID（例如：@username）"
                  />
                  <Button variant="outline">
                    <Send className="h-4 w-4 mr-2" />
                    绑定
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  绑定后可接收 Telegram 通知，需要在 Telegram 中关注 @yourbot
                </p>
              </div>

              <div className="border-t border-gray-200 pt-4 space-y-4">
                {/* 邮件通知开关 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">邮件通知</p>
                      <p className="text-sm text-gray-600">接收重要通知到邮箱</p>
                    </div>
                  </div>
                  <Switch
                    checked={emailNotify}
                    onCheckedChange={setEmailNotify}
                  />
                </div>

                {/* Telegram 通知开关 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Send className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Telegram 通知</p>
                      <p className="text-sm text-gray-600">接收重要通知到 Telegram</p>
                    </div>
                  </div>
                  <Switch
                    checked={tgNotify}
                    onCheckedChange={setTgNotify}
                  />
                </div>

                {/* 每日报告开关 */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                      <Bell className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">每日流量报告</p>
                      <p className="text-sm text-gray-600">每天接收流量使用情况</p>
                    </div>
                  </div>
                  <Switch
                    checked={dailyReport}
                    onCheckedChange={setDailyReport}
                  />
                </div>
              </div>

              {/* 保存按钮 */}
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={handleSaveNotification}
                  disabled={savingNotify}
                  className="gap-2"
                >
                  {savingNotify ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      保存中...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      保存设置
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：账户信息卡片 */}
        <div className="space-y-6">
          {/* 账户概览 */}
          <Card className="card-material bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-orange-900">
                <User className="h-5 w-5" />
                账户信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-orange-700 mb-1">用户名</p>
                <p className="font-semibold text-orange-900">{mockUserData.username}</p>
              </div>
              <div>
                <p className="text-xs text-orange-700 mb-1">邮箱</p>
                <p className="font-semibold text-orange-900">{mockUserData.email}</p>
              </div>
              <div className="pt-2 border-t border-orange-200">
                <Badge variant="success" className="gap-1">
                  <Check className="h-3 w-3" />
                  账户正常
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* 安全提示 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="space-y-3 text-sm text-blue-900">
                <p className="font-semibold flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  安全建议
                </p>
                <ul className="space-y-2 text-blue-800">
                  <li>• 定期更换密码，使用强密码</li>
                  <li>• 不要与他人分享订阅链接</li>
                  <li>• 开启通知及时接收账户动态</li>
                  <li>• 如发现异常请立即修改密码</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
