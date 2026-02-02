import { LogIn } from "lucide-react"
import { Card } from "@/components/ui/Card"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table"
import { Badge } from "@/components/ui/Badge"

// Mock data based on original spanel IpController::login structure
const mockLoginData = [
  {
    id: 1,
    userid: 1001,
    user_name: "user@example.com",
    ip: "192.168.1.100",
    location: "中国 广东 深圳",
    datetime: "2025-02-02 14:35:00",
    type: 0
  },
  {
    id: 2,
    userid: 1002,
    user_name: "test@example.com",
    ip: "10.0.0.50",
    location: "美国 加利福尼亚",
    datetime: "2025-02-02 14:30:00",
    type: 0
  },
  {
    id: 3,
    userid: 1001,
    user_name: "user@example.com",
    ip: "172.16.0.25",
    location: "日本 东京",
    datetime: "2025-02-02 14:25:00",
    type: 1
  },
  {
    id: 4,
    userid: 1003,
    user_name: "admin@example.com",
    ip: "203.0.113.50",
    location: "新加坡",
    datetime: "2025-02-02 14:20:00",
    type: 0
  },
  {
    id: 5,
    userid: 1004,
    user_name: "vip@example.com",
    ip: "198.51.100.25",
    location: "中国 台湾 台北",
    datetime: "2025-02-02 14:15:00",
    type: 0
  },
]

export default function UserLoginHistory() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">登录IP</h1>
          <p className="text-sm text-gray-500 mt-1">查看用户登录历史记录</p>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <LogIn className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              系统中所有用户登录记录
            </p>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>用户 ID</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>IP 地址</TableHead>
                <TableHead>归属地</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>类型</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockLoginData.map((login) => (
                <TableRow key={login.id}>
                  <TableCell>{login.id}</TableCell>
                  <TableCell>{login.userid}</TableCell>
                  <TableCell className="font-medium">{login.user_name}</TableCell>
                  <TableCell className="font-mono text-sm">{login.ip}</TableCell>
                  <TableCell>{login.location}</TableCell>
                  <TableCell className="text-gray-500">{login.datetime}</TableCell>
                  <TableCell>
                    {login.type === 0 ? (
                      <Badge variant="default" className="bg-green-600">成功</Badge>
                    ) : (
                      <Badge variant="destructive">失败</Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
