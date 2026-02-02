import { useState } from "react"
import { Search, Edit, Trash2, MoreVertical, Mail, Crown } from "lucide-react"
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

// Mock 用户数据
interface User {
  id: number
  email: string
  user_name: string
  is_admin: number
  is_enabled: number
  class_level: number
  money: number
  transfer_enable: number
  total_used: number
  reg_date: string
  expire_in: string | null
}

const mockUsers: User[] = [
  {
    id: 1,
    email: "admin@example.com",
    user_name: "Administrator",
    is_admin: 1,
    is_enabled: 1,
    class_level: 99,
    money: 9999.00,
    transfer_enable: 107374182400, // 100GB
    total_used: 53687091200, // 50GB
    reg_date: "2024-01-01T00:00:00",
    expire_in: null,
  },
  {
    id: 2,
    email: "user1@example.com",
    user_name: "user1",
    is_admin: 0,
    is_enabled: 1,
    class_level: 1,
    money: 128.50,
    transfer_enable: 107374182400, // 100GB
    total_used: 42949672960, // 40GB
    reg_date: "2024-06-15T10:30:00",
    expire_in: "2025-12-31T23:59:59",
  },
  {
    id: 3,
    email: "vip@example.com",
    user_name: "vipuser",
    is_admin: 0,
    is_enabled: 1,
    class_level: 2,
    money: 588.00,
    transfer_enable: 214748364800, // 200GB
    total_used: 161061273600, // 150GB
    reg_date: "2024-03-20T14:22:00",
    expire_in: "2025-06-30T23:59:59",
  },
  {
    id: 4,
    email: "test@example.com",
    user_name: "testuser",
    is_admin: 0,
    is_enabled: 1,
    class_level: 0,
    money: 25.00,
    transfer_enable: 53687091200, // 50GB
    total_used: 5368709120, // 5GB
    reg_date: "2024-10-05T09:15:00",
    expire_in: "2025-01-15T23:59:59",
  },
  {
    id: 5,
    email: "disabled@example.com",
    user_name: "blockeduser",
    is_admin: 0,
    is_enabled: 0,
    class_level: 1,
    money: 0.00,
    transfer_enable: 107374182400, // 100GB
    total_used: 0,
    reg_date: "2024-08-10T16:45:00",
    expire_in: "2024-12-31T23:59:59",
  },
]

export default function AdminUserList() {
  const [users] = useState<User[]>(mockUsers)
  const [searchTerm, setSearchTerm] = useState("")
  const [total] = useState(5)

  // 过滤用户
  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.user_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // 字节转 GB
  const bytesToGB = (bytes: number) => (bytes / 1073741824).toFixed(2)

  // 计算流量使用百分比
  const getTrafficPercent = (used: number, total: number) => {
    if (total === 0) return 0
    return Math.min((used / total) * 100, 100)
  }

  // 获取流量进度条颜色
  const getTrafficColor = (percent: number) => {
    if (percent >= 90) return "bg-red-500"
    if (percent >= 70) return "bg-orange-500"
    if (percent >= 50) return "bg-yellow-500"
    return "bg-green-500"
  }

  // 格式化日期
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "永久"
    return new Date(dateStr).toLocaleDateString("zh-CN")
  }

  const handleEdit = (userId: number) => {
    console.log("Edit user:", userId)
  }

  const handleDelete = (userId: number) => {
    console.log("Delete user:", userId)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和搜索 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">用户管理</h1>
          <p className="text-gray-600 mt-1">管理系统中的所有用户账户</p>
        </div>
        <Button className="bg-gradient-red hover:bg-primary-admin-hover gap-2 shadow-lg whitespace-nowrap">
          <Crown className="h-5 w-5" />
          新增用户
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总用户数</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">VIP 用户</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.class_level > 0).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Crown className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">正常用户</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.is_enabled === 1).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <span className="text-2xl">✓</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">禁用用户</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.is_enabled === 0).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⚠</span>
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
                placeholder="搜索邮箱或用户名..."
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

      {/* 用户列表表格 */}
      <Card>
        <CardHeader>
          <CardTitle>用户列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">UID</TableHead>
                <TableHead>邮箱</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>等级</TableHead>
                <TableHead>余额</TableHead>
                <TableHead>流量使用</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>注册时间</TableHead>
                <TableHead>到期时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={10} className="text-center py-8 text-gray-500">
                    暂无数据
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => {
                  const trafficPercent = getTrafficPercent(user.total_used, user.transfer_enable)
                  const trafficColor = getTrafficColor(trafficPercent)

                  return (
                    <TableRow key={user.id}>
                      <TableCell className="font-medium">#{user.id}</TableCell>
                      <TableCell className="font-mono text-sm">{user.email}</TableCell>
                      <TableCell className="font-semibold">{user.user_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1.5">
                          {user.is_admin === 1 && (
                            <Badge variant="destructive" className="gap-1">
                              <Crown className="h-3 w-3" />
                              管理员
                            </Badge>
                          )}
                          {user.is_admin === 0 && (
                            <Badge variant={user.class_level === 0 ? "secondary" : "default"}>
                              VIP {user.class_level}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-green-600">
                          ¥{user.money.toFixed(2)}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1.5 min-w-[160px]">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                              <div
                                className={`h-full ${trafficColor} rounded-full transition-all duration-300`}
                                style={{ width: `${trafficPercent}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-600 w-12 text-right">
                              {trafficPercent.toFixed(0)}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-500">
                              已用 {bytesToGB(user.total_used)} GB
                            </span>
                            <span className="text-gray-500">
                              总计 {bytesToGB(user.transfer_enable)} GB
                            </span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {user.is_enabled === 1 ? (
                          <Badge variant="success">正常</Badge>
                        ) : (
                          <Badge variant="destructive">禁用</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(user.reg_date)}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {formatDate(user.expire_in || "")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => handleEdit(user.id)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                            onClick={() => handleDelete(user.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={10} className="text-center text-sm text-gray-500">
                  显示 1-{filteredUsers.length} 条，共 {total} 条记录
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
