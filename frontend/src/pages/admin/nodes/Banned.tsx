import { ShieldAlert } from "lucide-react"
import { Card } from "@/components/ui/Card"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table"
import { Button } from "@/components/ui/Button"
import { useState } from "react"

// Mock data based on original spanel structure
const mockBannedData = [
  {
    id: 1,
    name: "香港节点 01",
    ip: "192.168.1.100",
    location: "中国 广东 深圳",
    datetime: "2025-02-02 14:30:00"
  },
  {
    id: 2,
    name: "美国节点 03",
    ip: "10.0.0.50",
    location: "美国 加利福尼亚",
    datetime: "2025-02-02 14:15:00"
  },
  {
    id: 3,
    name: "日本节点 02",
    ip: "172.16.0.25",
    location: "日本 东京",
    datetime: "2025-02-02 13:50:00"
  },
  {
    id: 4,
    name: "新加坡节点 01",
    ip: "203.0.113.50",
    location: "新加坡",
    datetime: "2025-02-02 13:20:00"
  },
]

export default function BannedIPs() {
  const [unblockIp, setUnblockIp] = useState("")

  const handleUnblock = () => {
    if (!unblockIp.trim()) {
      alert("请输入要解封的 IP 地址")
      return
    }
    alert(`解封 IP: ${unblockIp}`)
    setUnblockIp("")
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">节点被封IP</h1>
          <p className="text-sm text-gray-500 mt-1">管理被封禁的 IP 地址</p>
        </div>
      </div>

      <Card className="bg-blue-50 border-blue-200">
        <div className="flex items-start space-x-3">
          <ShieldAlert className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-800">
              这里是最近的节点上捕捉到的进行非法行为的 IP
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              要解封的 IP
            </label>
            <input
              type="text"
              value={unblockIp}
              onChange={(e) => setUnblockIp(e.target.value)}
              placeholder="输入 IP 地址"
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Button onClick={handleUnblock} className="bg-blue-600 hover:bg-blue-700">
            解封
          </Button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>节点名称</TableHead>
                <TableHead>IP 地址</TableHead>
                <TableHead>归属地</TableHead>
                <TableHead>封禁时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockBannedData.map((banned) => (
                <TableRow key={banned.id}>
                  <TableCell>{banned.id}</TableCell>
                  <TableCell className="font-medium">{banned.name}</TableCell>
                  <TableCell className="font-mono text-sm">{banned.ip}</TableCell>
                  <TableCell>{banned.location}</TableCell>
                  <TableCell className="text-gray-500">{banned.datetime}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
