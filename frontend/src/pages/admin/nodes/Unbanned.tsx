import { ShieldCheck } from "lucide-react"
import { Card } from "@/components/ui/Card"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table"

// Mock data based on original spanel structure
const mockUnbannedData = [
  {
    id: 1,
    userid: 1001,
    user_name: "admin@example.com",
    ip: "192.168.1.100",
    location: "中国 广东 深圳",
    datetime: "2025-02-02 14:35:00"
  },
  {
    id: 2,
    userid: 1001,
    user_name: "admin@example.com",
    ip: "10.0.0.50",
    location: "美国 加利福尼亚",
    datetime: "2025-02-02 14:20:00"
  },
  {
    id: 3,
    userid: 1002,
    user_name: "superadmin@example.com",
    ip: "172.16.0.25",
    location: "日本 东京",
    datetime: "2025-02-02 13:55:00"
  },
  {
    id: 4,
    userid: 1001,
    user_name: "admin@example.com",
    ip: "203.0.113.50",
    location: "新加坡",
    datetime: "2025-02-02 13:25:00"
  },
]

export default function UnbannedIPs() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">解封IP记录</h1>
          <p className="text-sm text-gray-500 mt-1">查看 IP 解封操作历史</p>
        </div>
      </div>

      <Card className="bg-green-50 border-green-200">
        <div className="flex items-start space-x-3">
          <ShieldCheck className="h-5 w-5 text-green-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-green-800">
              这里是最近的解封 IP 记录
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
                <TableHead>解封时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUnbannedData.map((unbanned) => (
                <TableRow key={unbanned.id}>
                  <TableCell>{unbanned.id}</TableCell>
                  <TableCell>{unbanned.userid}</TableCell>
                  <TableCell className="font-medium">{unbanned.user_name}</TableCell>
                  <TableCell className="font-mono text-sm">{unbanned.ip}</TableCell>
                  <TableCell>{unbanned.location}</TableCell>
                  <TableCell className="text-gray-500">{unbanned.datetime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
