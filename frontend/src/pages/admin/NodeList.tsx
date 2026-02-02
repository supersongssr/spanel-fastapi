import { useState } from "react"
import { Plus, Edit, Trash2, MoreVertical } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table"

// Mock 节点数据
interface Node {
  id: number
  name: string
  server: string
  type: string
  is_online: boolean
  status: string
  class_level: number
  bandwidth_used_percent: number
  bandwidth_limit_gb: number
  online_users: number
  country_code: string
}

const mockNodes: Node[] = [
  {
    id: 1,
    name: "香港 IPLC 01",
    server: "hk1.example.com",
    type: "ss",
    is_online: true,
    status: "active",
    class_level: 1,
    bandwidth_used_percent: 45.2,
    bandwidth_limit_gb: 1000,
    online_users: 128,
    country_code: "HK",
  },
  {
    id: 2,
    name: "日本 BGP 02",
    server: "jp2.example.com",
    type: "vmess",
    is_online: true,
    status: "active",
    class_level: 1,
    bandwidth_used_percent: 67.8,
    bandwidth_limit_gb: 800,
    online_users: 89,
    country_code: "JP",
  },
  {
    id: 3,
    name: "美国 LA 03",
    server: "us3.example.com",
    type: "trojan",
    is_online: false,
    status: "maintenance",
    class_level: 0,
    bandwidth_used_percent: 23.5,
    bandwidth_limit_gb: 1200,
    online_users: 0,
    country_code: "US",
  },
  {
    id: 4,
    name: "新加坡 04",
    server: "sg4.example.com",
    type: "ss",
    is_online: true,
    status: "active",
    class_level: 1,
    bandwidth_used_percent: 78.3,
    bandwidth_limit_gb: 500,
    online_users: 156,
    country_code: "SG",
  },
  {
    id: 5,
    name: "台湾 05",
    server: "tw5.example.com",
    type: "ssr",
    is_online: true,
    status: "active",
    class_level: 0,
    bandwidth_used_percent: 34.1,
    bandwidth_limit_gb: 600,
    online_users: 67,
    country_code: "TW",
  },
]

export default function AdminNodeList() {
  const [nodes] = useState<Node[]>(mockNodes)
  const [total] = useState(5)

  const getOnlineStatusBadge = (isOnline: boolean, status: string) => {
    if (!isOnline) {
      return <Badge variant="destructive" className="gap-1.5">
        <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
        离线
      </Badge>
    }
    if (status === "maintenance") {
      return <Badge variant="warning" className="gap-1.5">
        <span className="h-2 w-2 rounded-full bg-white" />
        维护中
      </Badge>
    }
    return <Badge variant="success" className="gap-1.5">
      <span className="h-2 w-2 rounded-full bg-white animate-pulse" />
      在线
    </Badge>
  }

  const getBandwidthColor = (percent: number) => {
    if (percent >= 80) return "bg-red-500"
    if (percent >= 60) return "bg-orange-500"
    return "bg-green-500"
  }

  const handleEdit = (nodeId: number) => {
    console.log("Edit node:", nodeId)
  }

  const handleDelete = (nodeId: number) => {
    console.log("Delete node:", nodeId)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">节点管理</h1>
          <p className="text-gray-600 mt-1">管理所有代理节点的状态和配置</p>
        </div>
        <Button className="bg-gradient-red hover:bg-primary-admin-hover gap-2 shadow-lg">
          <Plus className="h-5 w-5" />
          新增节点
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总节点数</p>
                <p className="text-2xl font-bold text-gray-900">{nodes.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <span className="text-2xl">🌐</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">在线节点</p>
                <p className="text-2xl font-bold text-green-600">
                  {nodes.filter(n => n.is_online).length}
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
                <p className="text-sm text-gray-600 mb-1">离线节点</p>
                <p className="text-2xl font-bold text-red-600">
                  {nodes.filter(n => !n.is_online).length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <span className="text-2xl">⚠</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">在线用户</p>
                <p className="text-2xl font-bold text-purple-600">
                  {nodes.reduce((sum, n) => sum + n.online_users, 0)}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 节点列表表格 */}
      <Card>
        <CardHeader>
          <CardTitle>节点列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">ID</TableHead>
                <TableHead>节点名称</TableHead>
                <TableHead>服务器地址</TableHead>
                <TableHead>类型</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>等级限制</TableHead>
                <TableHead>带宽使用</TableHead>
                <TableHead>在线用户</TableHead>
                <TableHead>地区</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nodes.map((node) => (
                <TableRow key={node.id}>
                  <TableCell className="font-medium">#{node.id}</TableCell>
                  <TableCell className="font-semibold">{node.name}</TableCell>
                  <TableCell className="font-mono text-sm">{node.server}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {node.type.toUpperCase()}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {getOnlineStatusBadge(node.is_online, node.status)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={node.class_level === 0 ? "secondary" : "default"}>
                      VIP {node.class_level}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full ${getBandwidthColor(node.bandwidth_used_percent)} rounded-full transition-all`}
                            style={{ width: `${node.bandwidth_used_percent}%` }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-12 text-right">
                          {node.bandwidth_used_percent.toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {node.bandwidth_limit_gb} GB 总量
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold text-gray-900">{node.online_users}</span>
                  </TableCell>
                  <TableCell>
                    <span className="text-lg">{node.country_code === "HK" && "🇭🇰"}</span>
                    <span className="text-lg">{node.country_code === "JP" && "🇯🇵"}</span>
                    <span className="text-lg">{node.country_code === "US" && "🇺🇸"}</span>
                    <span className="text-lg">{node.country_code === "SG" && "🇸🇬"}</span>
                    <span className="text-lg">{node.country_code === "TW" && "🇹🇼"}</span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEdit(node.id)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => handleDelete(node.id)}
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
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell colSpan={10} className="text-center text-sm text-gray-500">
                  显示 1-{nodes.length} 条，共 {total} 条记录
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
