import { useState } from "react"
import { Sliders, Save, RefreshCw, CheckCircle, XCircle, Edit2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Switch } from "@/components/ui/Switch"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select"

interface Node {
  id: number
  name: string
  server: string
  node_ip: string
  status: number
  info: string
  node_sort: number
  custom_rss: boolean
  type: boolean
  node_class: number
  node_group: number
  traffic_rate: number
  sort: string
  node_cost: number
  bandwidthlimit_resetday: number
  is_multi_user: number
  node_speedlimit: number
  node_bandwidth_limit: number
}

const mockNodes: Node[] = [
  {
    id: 1,
    name: "香港节点 01",
    server: "hk01.example.com",
    node_ip: "1.2.3.4",
    status: 1,
    info: "CN2 GIA 线路",
    node_sort: 0,
    custom_rss: true,
    type: true,
    node_class: 0,
    node_group: 1,
    traffic_rate: 1.0,
    sort: "0",
    node_cost: 50,
    bandwidthlimit_resetday: 1,
    is_multi_user: -1,
    node_speedlimit: 0,
    node_bandwidth_limit: 10737418240, // 10GB in bytes
  },
  {
    id: 2,
    name: "美国节点 01",
    server: "us01.example.com",
    node_ip: "5.6.7.8",
    status: 1,
    info: "洛杉矶 IPLC",
    node_sort: 1,
    custom_rss: true,
    type: true,
    node_class: 1,
    node_group: 2,
    traffic_rate: 0.5,
    sort: "0",
    node_cost: 30,
    bandwidthlimit_resetday: 1,
    is_multi_user: -1,
    node_speedlimit: 100,
    node_bandwidth_limit: 21474836480, // 20GB in bytes
  },
  {
    id: 3,
    name: "日本节点 01",
    server: "jp01.example.com",
    node_ip: "9.10.11.12",
    status: 0,
    info: "东京 NTT",
    node_sort: 2,
    custom_rss: false,
    type: false,
    node_class: 0,
    node_group: 3,
    traffic_rate: 1.0,
    sort: "0",
    node_cost: 40,
    bandwidthlimit_resetday: 1,
    is_multi_user: -1,
    node_speedlimit: 0,
    node_bandwidth_limit: 0,
  },
]

export default function NodeAdjustment() {
  const [nodes, setNodes] = useState<Node[]>(mockNodes)
  const [selectedNode, setSelectedNode] = useState<Node | null>(null)
  const [editingMode, setEditingMode] = useState(false)

  // 全局调整设置
  const [globalSettings, setGlobalSettings] = useState({
    rateMultiplier: 1.0,
    enableAllNodes: false,
    resetBandwidth: false,
  })

  const handleSelectNode = (node: Node) => {
    setSelectedNode(node)
    setEditingMode(false)
  }

  const handleUpdateNode = () => {
    if (!selectedNode) return

    setNodes(nodes.map(n =>
      n.id === selectedNode.id ? selectedNode : n
    ))

    alert("节点已更新！")
    setEditingMode(false)
  }

  const handleGlobalRateChange = () => {
    const newNodes = nodes.map(node => ({
      ...node,
      traffic_rate: Number((node.traffic_rate * globalSettings.rateMultiplier).toFixed(2))
    }))

    setNodes(newNodes)
    alert(`已将所有节点的流量倍率调整为 ×${globalSettings.rateMultiplier}`)
  }

  const handleToggleAllNodes = () => {
    const newNodes = nodes.map(node => ({
      ...node,
      type: globalSettings.enableAllNodes
    }))

    setNodes(newNodes)
    alert(`已${globalSettings.enableAllNodes ? "启用" : "禁用"}所有节点`)
  }

  const getSortLabel = (sort: string) => {
    const sortMap: Record<string, string> = {
      "0": "SS",
      "11": "Vmess",
      "13": "Vless",
      "14": "Trojan",
    }
    return sortMap[sort] || sort
  }


  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">节点调整</h1>
          <p className="text-gray-600 mt-1">批量调整节点配置与参数</p>
        </div>
        <Button className="bg-gradient-red hover:bg-primary-admin-hover gap-2">
          <RefreshCw className="h-5 w-5" />
          刷新节点
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧节点列表 */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">节点列表</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {nodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() => handleSelectNode(node)}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedNode?.id === node.id
                      ? "border-red-500 bg-red-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{node.name}</h3>
                        {node.type ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-500" />
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{node.server}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline">{getSortLabel(node.sort)}</Badge>
                        <Badge variant="secondary">倍率 {node.traffic_rate}</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* 右侧编辑区域 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 全局调整 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sliders className="h-6 w-6 text-primary-admin" />
                全局批量调整
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="rateMultiplier">流量倍率调整</Label>
                <div className="flex gap-3">
                  <Input
                    id="rateMultiplier"
                    type="number"
                    step="0.1"
                    min="0.1"
                    max="10"
                    value={globalSettings.rateMultiplier}
                    onChange={(e) => setGlobalSettings({
                      ...globalSettings,
                      rateMultiplier: Number(e.target.value)
                    })}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleGlobalRateChange}
                    className="bg-gradient-red hover:bg-primary-admin-hover"
                  >
                    应用到所有节点
                  </Button>
                </div>
                <p className="text-xs text-gray-500">
                  当前所有节点倍率将乘以此系数。例如设置为 0.5 表示所有流量减半计算
                </p>
              </div>

              <div className="flex items-center justify-between py-3 border-b">
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    批量启用所有节点
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    将所有节点状态设为启用
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setGlobalSettings({ ...globalSettings, enableAllNodes: true })
                    handleToggleAllNodes()
                  }}
                  variant="outline"
                >
                  全部启用
                </Button>
              </div>

              <div className="flex items-center justify-between py-3">
                <div className="flex-1">
                  <Label className="text-base font-medium">
                    批量禁用所有节点
                  </Label>
                  <p className="text-sm text-gray-500 mt-1">
                    将所有节点状态设为禁用
                  </p>
                </div>
                <Button
                  onClick={() => {
                    setGlobalSettings({ ...globalSettings, enableAllNodes: false })
                    handleToggleAllNodes()
                  }}
                  variant="outline"
                  className="text-red-600 border-red-200 hover:bg-red-50"
                >
                  全部禁用
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* 单节点编辑 */}
          {selectedNode && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Edit2 className="h-6 w-6 text-primary-admin" />
                    编辑节点 #{selectedNode.id}
                  </CardTitle>
                  <Button
                    onClick={() => setEditingMode(!editingMode)}
                    variant={editingMode ? "outline" : "default"}
                    className={editingMode ? "" : "bg-gradient-red hover:bg-primary-admin-hover"}
                  >
                    {editingMode ? "取消编辑" : "编辑节点"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="edit_name">节点名称</Label>
                    <Input
                      id="edit_name"
                      value={selectedNode.name}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        name: e.target.value
                      })}
                      disabled={!editingMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_server">节点地址</Label>
                    <Input
                      id="edit_server"
                      value={selectedNode.server}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        server: e.target.value
                      })}
                      disabled={!editingMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_node_ip">节点IP</Label>
                    <Input
                      id="edit_node_ip"
                      value={selectedNode.node_ip}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        node_ip: e.target.value
                      })}
                      disabled={!editingMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_status">节点状态</Label>
                    <Select
                      value={selectedNode.status.toString()}
                      onValueChange={(value) => setSelectedNode({
                        ...selectedNode,
                        status: Number(value)
                      })}
                      disabled={!editingMode}
                    >
                      <SelectTrigger id="edit_status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">启用</SelectItem>
                        <SelectItem value="0">禁用</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_info">节点描述</Label>
                    <Input
                      id="edit_info"
                      value={selectedNode.info}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        info: e.target.value
                      })}
                      disabled={!editingMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_node_sort">故障排序</Label>
                    <Input
                      id="edit_node_sort"
                      type="number"
                      value={selectedNode.node_sort}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        node_sort: Number(e.target.value)
                      })}
                      disabled={!editingMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_node_class">节点等级</Label>
                    <Input
                      id="edit_node_class"
                      type="number"
                      value={selectedNode.node_class}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        node_class: Number(e.target.value)
                      })}
                      disabled={!editingMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_node_group">节点群组</Label>
                    <Input
                      id="edit_node_group"
                      type="number"
                      value={selectedNode.node_group}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        node_group: Number(e.target.value)
                      })}
                      disabled={!editingMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_traffic_rate">流量比例</Label>
                    <Input
                      id="edit_traffic_rate"
                      type="number"
                      step="0.1"
                      value={selectedNode.traffic_rate}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        traffic_rate: Number(e.target.value)
                      })}
                      disabled={!editingMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_sort">节点类型</Label>
                    <Select
                      value={selectedNode.sort}
                      onValueChange={(value) => setSelectedNode({
                        ...selectedNode,
                        sort: value
                      })}
                      disabled={!editingMode}
                    >
                      <SelectTrigger id="edit_sort">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">SS</SelectItem>
                        <SelectItem value="11">Vmess</SelectItem>
                        <SelectItem value="13">Vless</SelectItem>
                        <SelectItem value="14">Trojan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_node_cost">节点成本</Label>
                    <Input
                      id="edit_node_cost"
                      type="number"
                      value={selectedNode.node_cost}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        node_cost: Number(e.target.value)
                      })}
                      disabled={!editingMode}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_node_speedlimit">节点限速 (Mbps)</Label>
                    <Input
                      id="edit_node_speedlimit"
                      type="number"
                      value={selectedNode.node_speedlimit}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        node_speedlimit: Number(e.target.value)
                      })}
                      disabled={!editingMode}
                    />
                    <p className="text-xs text-gray-500">0 表示不限速</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_is_multi_user">单端口多用户</Label>
                    <Select
                      value={selectedNode.is_multi_user.toString()}
                      onValueChange={(value) => setSelectedNode({
                        ...selectedNode,
                        is_multi_user: Number(value)
                      })}
                      disabled={!editingMode}
                    >
                      <SelectTrigger id="edit_is_multi_user">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="0">单端口与普通端口并存</SelectItem>
                        <SelectItem value="-1">仅普通端口</SelectItem>
                        <SelectItem value="1">仅单端口多用户</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_node_bandwidth">流量上限 (GB)</Label>
                    <Input
                      id="edit_node_bandwidth"
                      type="number"
                      value={Math.round(selectedNode.node_bandwidth_limit / 1024 / 1024 / 1024)}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        node_bandwidth_limit: Number(e.target.value) * 1024 * 1024 * 1024
                      })}
                      disabled={!editingMode}
                    />
                    <p className="text-xs text-gray-500">0 表示不设上限</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="edit_bandwidthlimit_resetday">清空日</Label>
                    <Input
                      id="edit_bandwidthlimit_resetday"
                      type="number"
                      min="1"
                      max="28"
                      value={selectedNode.bandwidthlimit_resetday}
                      onChange={(e) => setSelectedNode({
                        ...selectedNode,
                        bandwidthlimit_resetday: Number(e.target.value)
                      })}
                      disabled={!editingMode}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-t">
                  <div className="flex-1">
                    <Label className="text-base font-medium">
                      显示在订阅中
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      是否在用户订阅中显示此节点
                    </p>
                  </div>
                  <Switch
                    checked={selectedNode.custom_rss}
                    onCheckedChange={(checked) => setSelectedNode({
                      ...selectedNode,
                      custom_rss: checked
                    })}
                    disabled={!editingMode}
                  />
                </div>

                <div className="flex items-center justify-between py-3 border-t">
                  <div className="flex-1">
                    <Label className="text-base font-medium">
                      节点在线状态
                    </Label>
                    <p className="text-sm text-gray-500 mt-1">
                      手动设置节点为在线或离线
                    </p>
                  </div>
                  <Switch
                    checked={selectedNode.type}
                    onCheckedChange={(checked) => setSelectedNode({
                      ...selectedNode,
                      type: checked
                    })}
                    disabled={!editingMode}
                  />
                </div>

                {editingMode && (
                  <div className="flex gap-3 pt-4">
                    <Button
                      onClick={handleUpdateNode}
                      className="bg-gradient-red hover:bg-primary-admin-hover gap-2"
                    >
                      <Save className="h-4 w-4" />
                      保存修改
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setEditingMode(false)
                        setSelectedNode(nodes.find(n => n.id === selectedNode.id) || null)
                      }}
                    >
                      取消
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
