import { Activity } from "lucide-react"
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
const mockTrafficData = [
  {
    id: 1,
    user_id: 1001,
    user_name: "user@example.com",
    node_name: "香港节点 01",
    rate: 1.0,
    origin_traffic: "1.25 GB",
    traffic: "1.25 GB",
    log_time: "2025-02-02 14:30:00"
  },
  {
    id: 2,
    user_id: 1002,
    user_name: "test@example.com",
    node_name: "美国节点 03",
    rate: 0.5,
    origin_traffic: "2.50 GB",
    traffic: "1.25 GB",
    log_time: "2025-02-02 14:25:00"
  },
  {
    id: 3,
    user_id: 1003,
    user_name: "demo@example.com",
    node_name: "日本节点 02",
    rate: 1.0,
    origin_traffic: "856.32 MB",
    traffic: "856.32 MB",
    log_time: "2025-02-02 14:20:00"
  },
  {
    id: 4,
    user_id: 1001,
    user_name: "user@example.com",
    node_name: "新加坡节点 01",
    rate: 1.0,
    origin_traffic: "512.00 MB",
    traffic: "512.00 MB",
    log_time: "2025-02-02 14:15:00"
  },
  {
    id: 5,
    user_id: 1004,
    user_name: "admin@example.com",
    node_name: "台湾节点 01",
    rate: 0.0,
    origin_traffic: "3.20 GB",
    traffic: "0 B",
    log_time: "2025-02-02 14:10:00"
  },
]

export default function NodeTraffic() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">流量使用记录</h1>
          <p className="text-sm text-gray-500 mt-1">查看所有节点流量使用详情</p>
        </div>
      </div>

      <Card className="bg-yellow-50 border-yellow-200">
        <div className="flex items-start space-x-3">
          <Activity className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-yellow-800">
              部分节点不支持流量记录
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
                <TableHead>使用节点</TableHead>
                <TableHead>倍率</TableHead>
                <TableHead>实际使用流量</TableHead>
                <TableHead>结算流量</TableHead>
                <TableHead>记录时间</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockTrafficData.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{log.id}</TableCell>
                  <TableCell>{log.user_id}</TableCell>
                  <TableCell className="font-medium">{log.user_name}</TableCell>
                  <TableCell>{log.node_name}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      log.rate === 0
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {log.rate === 0 ? '免费' : log.rate.toFixed(1)}
                    </span>
                  </TableCell>
                  <TableCell>{log.origin_traffic}</TableCell>
                  <TableCell className="font-semibold">{log.traffic}</TableCell>
                  <TableCell className="text-gray-500">{log.log_time}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
