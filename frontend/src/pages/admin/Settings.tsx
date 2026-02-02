import { useState } from "react"
import { Bell, Plus, Trash2, Edit2, Save, Mail, CreditCard, Users, Settings as SettingsIcon, Globe, Database } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { Label } from "@/components/ui/Label"
import { Switch } from "@/components/ui/Switch"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"

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
]

export default function AdminSettings() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(mockAnnouncements)
  const [showNewForm, setShowNewForm] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newContent, setNewContent] = useState("")

  // 基础设置
  const [basicSettings, setBasicSettings] = useState({
    appName: "sPanel-FastAPI",
    baseUrl: "https://test-spanel-fastapi.freessr.bid",
    subUrl: "https://test-spanel-fastapi.freessr.bid",
    adminContact1: "QQ：123456",
    adminContact2: "TG群：https://t.me/xxx",
    adminContact3: "邮箱：admin@example.com",
  })

  // 注册设置
  const [registerSettings, setRegisterSettings] = useState({
    register_mode: "open", // open, close, invite
    enable_email_verify: true,
    defaultTraffic: 10,
    user_class_default: 0,
    user_money_default: 0,
    user_expire_in_default: 30,
    user_class_expire_default: 24,
    random_group: "1,2,3,4",
    invite_get_money: 0,
    invite_gift_money: 5,
    invite_price: -1,
    custom_invite_price: 1,
  })

  // 邮件设置
  const [emailSettings, setEmailSettings] = useState({
    mailDriver: "smtp",
    smtp_host: "smtp.mailgun.org",
    smtp_port: "465",
    smtp_username: "postmaster@example.com",
    smtp_password: "",
    smtp_sender: "postmaster@example.com",
    smtp_ssl: true,
  })

  // 支付设置
  const [paymentSettings, setPaymentSettings] = useState({
    payment_system: "none", // none, codepay, f2fpay, etc.
    f2fpay_app_id: "",
    f2fpay_p_id: "",
    alipay_public_key: "",
    merchant_private_key: "",
    codepay_id: "",
    codepay_key: "",
    amount: "2,23,233,2333",
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

  const handleSaveAll = () => {
    console.log("Saving all settings:", {
      basic: basicSettings,
      register: registerSettings,
      email: emailSettings,
      payment: paymentSettings,
    })
    alert("设置已保存！")
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">系统设置</h1>
          <p className="text-gray-600 mt-1">管理系统配置与参数</p>
        </div>
        <Button className="bg-gradient-red hover:bg-primary-admin-hover gap-2 shadow-lg" onClick={handleSaveAll}>
          <Save className="h-5 w-5" />
          保存所有设置
        </Button>
      </div>

      <Tabs defaultValue="basic" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="basic" className="gap-2">
            <Globe className="h-4 w-4" />
            站点设置
          </TabsTrigger>
          <TabsTrigger value="register" className="gap-2">
            <Users className="h-4 w-4" />
            注册访问
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-2">
            <Mail className="h-4 w-4" />
            邮件设置
          </TabsTrigger>
          <TabsTrigger value="payment" className="gap-2">
            <CreditCard className="h-4 w-4" />
            支付设置
          </TabsTrigger>
          <TabsTrigger value="announcement" className="gap-2">
            <Bell className="h-4 w-4" />
            公告管理
          </TabsTrigger>
          <TabsTrigger value="advanced" className="gap-2">
            <SettingsIcon className="h-4 w-4" />
            高级设置
          </TabsTrigger>
        </TabsList>

        {/* 站点设置 Tab */}
        <TabsContent value="basic">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-6 w-6 text-primary-admin" />
                站点基本信息
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="appName">站点名称</Label>
                <Input
                  id="appName"
                  value={basicSettings.appName}
                  onChange={(e) => setBasicSettings({ ...basicSettings, appName: e.target.value })}
                  placeholder="请输入站点名称"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="baseUrl">站点URL</Label>
                <Input
                  id="baseUrl"
                  value={basicSettings.baseUrl}
                  onChange={(e) => setBasicSettings({ ...basicSettings, baseUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="subUrl">订阅URL</Label>
                <Input
                  id="subUrl"
                  value={basicSettings.subUrl}
                  onChange={(e) => setBasicSettings({ ...basicSettings, subUrl: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminContact1">管理员联系方式 1</Label>
                <Input
                  id="adminContact1"
                  value={basicSettings.adminContact1}
                  onChange={(e) => setBasicSettings({ ...basicSettings, adminContact1: e.target.value })}
                  placeholder="QQ：123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminContact2">管理员联系方式 2</Label>
                <Input
                  id="adminContact2"
                  value={basicSettings.adminContact2}
                  onChange={(e) => setBasicSettings({ ...basicSettings, adminContact2: e.target.value })}
                  placeholder="TG群：https://t.me/xxx"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="adminContact3">管理员联系方式 3</Label>
                <Input
                  id="adminContact3"
                  value={basicSettings.adminContact3}
                  onChange={(e) => setBasicSettings({ ...basicSettings, adminContact3: e.target.value })}
                  placeholder="邮箱：admin@example.com"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 注册与访问设置 Tab */}
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-6 w-6 text-primary-admin" />
                注册与访问控制
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="register_mode">注册模式</Label>
                <select
                  id="register_mode"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 disabled:cursor-not-allowed disabled:opacity-50"
                  value={registerSettings.register_mode}
                  onChange={(e) => setRegisterSettings({ ...registerSettings, register_mode: e.target.value })}
                >
                  <option value="open">开放注册</option>
                  <option value="invite">仅限邀请码</option>
                  <option value="close">关闭注册</option>
                </select>
                <p className="text-xs text-gray-500">选择开放注册、仅限邀请码或关闭注册</p>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex-1">
                  <Label htmlFor="enable_email_verify" className="text-base font-medium">
                    启用邮箱验证
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    新用户注册后必须验证邮箱才能使用服务
                  </p>
                </div>
                <Switch
                  id="enable_email_verify"
                  checked={registerSettings.enable_email_verify}
                  onCheckedChange={(checked) =>
                    setRegisterSettings({ ...registerSettings, enable_email_verify: checked })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="defaultTraffic">初始流量 (GB)</Label>
                <Input
                  id="defaultTraffic"
                  type="number"
                  value={registerSettings.defaultTraffic}
                  onChange={(e) => setRegisterSettings({ ...registerSettings, defaultTraffic: Number(e.target.value) })}
                  placeholder="10"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_class_default">初始等级</Label>
                <Input
                  id="user_class_default"
                  type="number"
                  value={registerSettings.user_class_default}
                  onChange={(e) => setRegisterSettings({ ...registerSettings, user_class_default: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_money_default">初始余额</Label>
                <Input
                  id="user_money_default"
                  type="number"
                  step="0.01"
                  value={registerSettings.user_money_default}
                  onChange={(e) => setRegisterSettings({ ...registerSettings, user_money_default: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="user_expire_in_default">账户过期时间 (天)</Label>
                <Input
                  id="user_expire_in_default"
                  type="number"
                  value={registerSettings.user_expire_in_default}
                  onChange={(e) => setRegisterSettings({ ...registerSettings, user_expire_in_default: Number(e.target.value) })}
                  placeholder="30"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="random_group">随机分组 (逗号分隔)</Label>
                <Input
                  id="random_group"
                  value={registerSettings.random_group}
                  onChange={(e) => setRegisterSettings({ ...registerSettings, random_group: e.target.value })}
                  placeholder="1,2,3,4"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="text-lg">邀请与返利设置</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="invite_get_money">被邀请人奖励金额</Label>
                <Input
                  id="invite_get_money"
                  type="number"
                  step="0.01"
                  value={registerSettings.invite_get_money}
                  onChange={(e) => setRegisterSettings({ ...registerSettings, invite_get_money: Number(e.target.value) })}
                  placeholder="0"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite_gift_money">邀请人奖励金额</Label>
                <Input
                  id="invite_gift_money"
                  type="number"
                  step="0.01"
                  value={registerSettings.invite_gift_money}
                  onChange={(e) => setRegisterSettings({ ...registerSettings, invite_gift_money: Number(e.target.value) })}
                  placeholder="5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="invite_price">邀请码价格 (&lt;0 为不开放)</Label>
                <Input
                  id="invite_price"
                  type="number"
                  step="0.01"
                  value={registerSettings.invite_price}
                  onChange={(e) => setRegisterSettings({ ...registerSettings, invite_price: Number(e.target.value) })}
                  placeholder="-1"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="custom_invite_price">定制邀请码价格</Label>
                <Input
                  id="custom_invite_price"
                  type="number"
                  step="0.01"
                  value={registerSettings.custom_invite_price}
                  onChange={(e) => setRegisterSettings({ ...registerSettings, custom_invite_price: Number(e.target.value) })}
                  placeholder="1"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 邮件设置 Tab */}
        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-6 w-6 text-primary-admin" />
                SMTP 邮件服务配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="mailDriver">邮件驱动</Label>
                <select
                  id="mailDriver"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
                  value={emailSettings.mailDriver}
                  onChange={(e) => setEmailSettings({ ...emailSettings, mailDriver: e.target.value })}
                >
                  <option value="smtp">SMTP</option>
                  <option value="mailgun">Mailgun</option>
                  <option value="sendgrid">SendGrid</option>
                  <option value="none">不发送</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_host">SMTP 服务器</Label>
                <Input
                  id="smtp_host"
                  value={emailSettings.smtp_host}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtp_host: e.target.value })}
                  placeholder="smtp.mailgun.org"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_port">SMTP 端口</Label>
                <Input
                  id="smtp_port"
                  value={emailSettings.smtp_port}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtp_port: e.target.value })}
                  placeholder="465"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_username">SMTP 用户名</Label>
                <Input
                  id="smtp_username"
                  value={emailSettings.smtp_username}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtp_username: e.target.value })}
                  placeholder="postmaster@example.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_password">SMTP 密码</Label>
                <Input
                  id="smtp_password"
                  type="password"
                  value={emailSettings.smtp_password}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtp_password: e.target.value })}
                  placeholder="••••••••"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="smtp_sender">发件人地址</Label>
                <Input
                  id="smtp_sender"
                  value={emailSettings.smtp_sender}
                  onChange={(e) => setEmailSettings({ ...emailSettings, smtp_sender: e.target.value })}
                  placeholder="noreply@example.com"
                />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <Label htmlFor="smtp_ssl" className="text-base font-medium">
                    启用 SSL/TLS
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    使用加密连接发送邮件
                  </p>
                </div>
                <Switch
                  id="smtp_ssl"
                  checked={emailSettings.smtp_ssl}
                  onCheckedChange={(checked) =>
                    setEmailSettings({ ...emailSettings, smtp_ssl: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 支付设置 Tab */}
        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6 text-primary-admin" />
                支付网关配置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="payment_system">支付系统</Label>
                <select
                  id="payment_system"
                  className="flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950"
                  value={paymentSettings.payment_system}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, payment_system: e.target.value })}
                >
                  <option value="none">未启用</option>
                  <option value="codepay">码支付</option>
                  <option value="f2fpay">支付宝F2F</option>
                  <option value="yftpay">YFT支付</option>
                  <option value="trimepay">TrimePay</option>
                  <option value="paymentwall">PaymentWall</option>
                </select>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  ⚠️ 注意：请确保在下方填写正确的支付网关密钥信息，错误的配置将导致用户无法充值。
                </p>
              </div>

              {paymentSettings.payment_system === "f2fpay" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="f2fpay_app_id">应用ID</Label>
                    <Input
                      id="f2fpay_app_id"
                      value={paymentSettings.f2fpay_app_id}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, f2fpay_app_id: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="f2fpay_p_id">PID</Label>
                    <Input
                      id="f2fpay_p_id"
                      value={paymentSettings.f2fpay_p_id}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, f2fpay_p_id: e.target.value })}
                    />
                  </div>
                </>
              )}

              {paymentSettings.payment_system === "codepay" && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="codepay_id">码支付ID</Label>
                    <Input
                      id="codepay_id"
                      value={paymentSettings.codepay_id}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, codepay_id: e.target.value })}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="codepay_key">码支付密钥</Label>
                    <Input
                      id="codepay_key"
                      type="password"
                      value={paymentSettings.codepay_key}
                      onChange={(e) => setPaymentSettings({ ...paymentSettings, codepay_key: e.target.value })}
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="amount">充值金额选项 (逗号分隔)</Label>
                <Input
                  id="amount"
                  value={paymentSettings.amount}
                  onChange={(e) => setPaymentSettings({ ...paymentSettings, amount: e.target.value })}
                  placeholder="2,23,233,2333"
                />
                <p className="text-xs text-gray-500">用户可选择的充值金额</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 公告管理 Tab */}
        <TabsContent value="announcement">
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
        </TabsContent>

        {/* 高级设置 Tab */}
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-6 w-6 text-primary-admin" />
                高级系统设置
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ 危险区域：以下设置涉及系统核心功能，请谨慎修改！
                </p>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex-1">
                  <Label className="text-base font-medium text-red-600">
                    维护模式
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    开启后除管理员外所有用户无法访问系统
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    启用用户注销
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    允许用户主动注销账户
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    购买时重置流量
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    用户购买套餐后是否自动重置已用流量
                  </p>
                </div>
                <Switch />
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    显示捐赠
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    在前台显示捐赠信息
                  </p>
                </div>
                <Switch defaultChecked />
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    启用工单系统
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    允许用户提交工单
                  </p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
