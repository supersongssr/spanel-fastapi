import { Repeat, Plus, Search, Edit, Trash2 } from "lucide-react"
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
import { Badge } from "@/components/ui/Badge"
import { useState } from "react"

// Mock data based on original spanel structure
const mockRelayData = [
  {
    id: 1,
    user_id: 1001,
    user_name: "user@example.com",
    source_node_name: "香港节点 01",
    dist_node_name: "美国节点 03",
    port: 12345,
    priority: 1
  },
  {
    id: 2,
    user_id: 0,
    user_name: "全体用户",
    source_node_name: "日本节点 02",
    dist_node_name: "新加坡节点 01",
    port: 54321,
    priority: 5
  },
  {
    id: 3,
    user_id: 1002,
    user_name: "test@example.com",
    source_node_name: "台湾节点 01",
    dist_node_name: "韩国节点 01",
    port: 33333,
    priority: 3
  },
  {
    id: 4,
    user_id: 1003,
    user_name: "demo@example.com",
    source_node_name: "香港节点 01",
    dist_node_name: "日本节点 02",
    port: 44444,
    priority: 2
  },
]

export default function UserRelay() {
  const [searchUserId, setSearchUserId] = useState("")

  const handleSearch = () => {
    if (!searchUserId.trim()) {
      alert("请输入用户 ID")
      return
    }
    alert(`搜索用户 ID: ${searchUserId} 的中转规则`)
  }

  const handleDelete = (id: number, userName: string) => {
    if (confirm(`确定要删除 ${userName} 的中转规则吗？`)) {
      alert(`删除规则 ID: ${id}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">中转规则管理</h1>
          <p className="text-sm text-gray-500 mt-1">配置用户流量中转规则</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          新增规则
        </Button>
      </div>

      <Card className="bg-purple-50 border-purple-200">
        <div className="flex items-start space-x-3">
          <Repeat className="h-5 w-5 text-purple-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-purple-800">
              系统中所有的中转规则
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <div className="p-6 space-y-4">
          <div className="flex gap-3">
            <input
              type="text"
              value={searchUserId}
              onChange={(e) => setSearchUserId(e.target.value)}
              placeholder="输入用户 ID 进行搜索链路搜索"
              className="flex-1 max-w-md px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <Button onClick={handleSearch} className="bg-purple-600 hover:bg-purple-700">
              <Search className="h-4 w-4 mr-2" />
              搜索
            </Button>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>操作</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>用户 ID</TableHead>
                <TableHead>用户名</TableHead>
                <TableHead>起源节点</TableHead>
                <TableHead>目标节点</TableHead>
                <TableHead>端口</TableHead>
                <TableHead>优先级</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockRelayData.map((relay) => (
                <TableRow key={relay.id}>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-xs"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        编辑
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(relay.id, relay.user_name)}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        删除
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{relay.id}</TableCell>
                  <TableCell>{relay.user_id}</TableCell>
                  <TableCell className="font-medium">
                    {relay.user_name === "全体用户" ? (
                      <Badge variant="secondary">{relay.user_name}</Badge>
                    ) : (
                      relay.user_name
                    )}
                  </TableCell>
                  <TableCell>{relay.source_node_name}</TableCell>
                  <TableCell>{relay.dist_node_name}</TableCell>
                  <TableCell className="font-mono text-sm">{relay.port}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{relay.priority}</Badge>
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
