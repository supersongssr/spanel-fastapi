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

// Mock data based on original spanel structure
const mockOnlineIPData = [
  {
    id: 1,
    userid: 1001,
    user_name: "user@example.com",
    nodeid: 1,
    node_name: "香港节点 01",
    ip: "192.168.1.100",
    location: "中国 广东 深圳",
    datetime: "2025-02-02 14:35:00",
    is_node: "否"
  },
  {
    id: 2,
    userid: 1002,
    user_name: "test@example.com",
    nodeid: 3,
    node_name: "美国节点 03",
    ip: "10.0.0.50",
    location: "美国 加利福尼亚",
    datetime: "2025-02-02 14:34:00",
    is_node: "否"
  },
  {
    id: 3,
    userid: 1003,
    user_name: "demo@example.com",
    nodeid: 2,
    node_name: "日本节点 02",
    ip: "172.16.0.25",
    location: "日本 东京",
    datetime: "2025-02-02 14:33:00",
    is_node: "是"
  },
  {
    id: 4,
    userid: 1001,
    user_name: "user@example.com",
    nodeid: 4,
    node_name: "新加坡节点 01",
    ip: "203.0.113.50",
    location: "新加坡",
    datetime: "2025-02-02 14:32:00",
    is_node: "否"
  },
  {
    id: 5,
    userid: 1004,
    user_name: "admin@example.com",
    nodeid: 5,
    node_name: "台湾节点 01",
    ip: "198.51.100.25",
    location: "中国 台湾 台北",
    datetime: "2025-02-02 14:31:00",
    is_node: "否"
  },
]

export default function UserOnlineIP() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">在线IP</h1>
          <p className="text-sm text-gray-500 mt-1">查看当前在线用户的 IP 地址</p>
        </div>
        <Card className="px-4 py-2">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">当前在线总数</span>
            <Badge variant="default" className="bg-green-600">
              {mockOnlineIPData.length}
            </Badge>
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>用户 ID</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>节点 ID</TableHead>
                <TableHead>节点名</TableHead>
                <TableHead>IP 地址</TableHead>
                <TableHead>归属地</TableHead>
                <TableHead>时间</TableHead>
                <TableHead>是否为中转连接</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockOnlineIPData.map((online) => (
                <TableRow key={online.id}>
                  <TableCell>{online.id}</TableCell>
                  <TableCell>{online.userid}</TableCell>
                  <TableCell className="font-medium">{online.user_name}</TableCell>
                  <TableCell>{online.nodeid}</TableCell>
                  <TableCell>{online.node_name}</TableCell>
                  <TableCell className="font-mono text-sm">{online.ip}</TableCell>
                  <TableCell>{online.location}</TableCell>
                  <TableCell className="text-gray-500">{online.datetime}</TableCell>
                  <TableCell>
                    {online.is_node === "是" ? (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                        {online.is_node}
                      </Badge>
                    ) : (
                      <Badge variant="outline">{online.is_node}</Badge>
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
