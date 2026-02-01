import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  Globe,
  Zap,
  Users,
  BarChart3,
  Copy,
  Check,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

// Mock 数据
const mockNodes = [
  {
    id: 1,
    name: "香港 IPLC 01",
    group: 0,
    class: 1,
    sort: 11,
    type: "Vmess",
    online: 45,
    bandwidth: 1073,
    rate: 1,
    status: "online",
    config: {
      address: "hk1.example.com",
      port: 443,
      uuid: "abc123-def456-ghi789",
      alterId: 0,
      network: "ws",
      tls: "tls",
    },
  },
  {
    id: 2,
    name: "香港 IPLC 02",
    group: 0,
    class: 1,
    sort: 11,
    type: "Vmess",
    online: 38,
    bandwidth: 1073,
    rate: 1,
    status: "online",
    config: {
      address: "hk2.example.com",
      port: 443,
      uuid: "abc123-def456-ghi789",
      alterId: 0,
      network: "ws",
      tls: "tls",
    },
  },
  {
    id: 3,
    name: "日本东京 BGP 01",
    group: 0,
    class: 1,
    sort: 13,
    type: "Vless",
    online: 62,
    bandwidth: 536,
    rate: 1,
    status: "online",
    config: {
      address: "jp1.example.com",
      port: 443,
      uuid: "abc123-def456-ghi789",
      flow: "xtls-rprx-vision",
    },
  },
  {
    id: 4,
    name: "美国洛杉矶 CN2 01",
    group: 0,
    class: 1,
    sort: 14,
    type: "Trojan",
    online: 28,
    bandwidth: 2145,
    rate: 0.5,
    status: "online",
    config: {
      address: "us1.example.com",
      port: 443,
      password: "your-password",
    },
  },
  {
    id: 5,
    name: "新加坡 AWS 01",
    group: 0,
    class: 2,
    sort: 11,
    type: "Vmess",
    online: 55,
    bandwidth: 819,
    rate: 1,
    status: "busy",
    config: {
      address: "sg1.example.com",
      port: 443,
      uuid: "abc123-def456-ghi789",
      alterId: 0,
      network: "ws",
      tls: "tls",
    },
  },
]

const nodeGroups = [
  { id: 0, name: "VIP 1 节点", nodes: mockNodes.filter((n) => n.class === 1) },
  { id: 1, name: "VIP 2 节点", nodes: mockNodes.filter((n) => n.class === 2) },
  { id: 2, name: "VIP 3 节点", nodes: mockNodes.filter((n) => n.class === 3) },
]

export default function NodeList() {
  const [expandedGroups, setExpandedGroups] = useState<number[]>([0, 1])
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const toggleGroup = (groupId: number) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId)
        ? prev.filter((id) => id !== groupId)
        : [...prev, groupId]
    )
  }

  const handleCopyConfig = (nodeId: number, config: any) => {
    const configText = JSON.stringify(config, null, 2)
    navigator.clipboard.writeText(configText)
    setCopiedId(nodeId)
    toast.success("节点配置已复制！")
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">节点列表</h1>
        <p className="text-gray-600 mt-1">共 {mockNodes.length} 个可用节点</p>
      </div>

      {/* 节点分组 */}
      {nodeGroups.map((group) => {
        const isExpanded = expandedGroups.includes(group.id)

        return (
          <div key={group.id} className="space-y-3">
            {/* 分组标题 */}
            <button
              onClick={() => toggleGroup(group.id)}
              className="w-full flex items-center justify-between rounded-lg bg-gradient-orange px-6 py-4 text-white shadow-md hover:shadow-lg transition-all"
            >
              <div className="flex items-center gap-3">
                <Globe className="h-6 w-6" />
                <span className="text-lg font-semibold">{group.name}</span>
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {group.nodes.length} 个节点
                </Badge>
              </div>
              {isExpanded ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>

            {/* 节点列表 */}
            {isExpanded && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.nodes.map((node) => (
                  <Card key={node.id} className="card-material">
                    <CardContent className="p-5">
                      {/* 节点头部 */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold text-gray-900">{node.name}</h3>
                            <Badge variant="outline" className="text-xs">
                              #{node.id}
                            </Badge>
                          </div>
                          <Badge
                            variant={node.status === "online" ? "success" : "destructive"}
                            className="text-xs"
                          >
                            <div className="flex items-center gap-1.5">
                              <span
                                className={cn(
                                  "w-2 h-2 rounded-full bg-white",
                                  node.status === "online" && "animate-breathe"
                                )}
                              />
                              {node.status === "online" ? "在线" : "拥挤"}
                            </div>
                          </Badge>
                        </div>
                      </div>

                      {/* 节点信息 */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Zap className="h-4 w-4" />
                          <span>{node.type}</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <BarChart3 className="h-4 w-4" />
                          <span>{node.bandwidth} GB</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Users className="h-4 w-4" />
                          <span>{node.online} 人在线</span>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="font-semibold">倍率:</span>
                          <span className="text-primary-user font-bold">x{node.rate}</span>
                        </div>
                      </div>

                      {/* 操作按钮 */}
                      <div className="mt-4 pt-4 border-t">
                        <Button
                          onClick={() => handleCopyConfig(node.id, node.config)}
                          variant={copiedId === node.id ? "default" : "outline"}
                          className="w-full gap-2"
                        >
                          {copiedId === node.id ? (
                            <>
                              <Check className="h-4 w-4" />
                              已复制
                            </>
                          ) : (
                            <>
                              <Copy className="h-4 w-4" />
                              复制配置
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* 空状态 */}
      {nodeGroups.every((g) => g.nodes.length === 0) && (
        <Card>
          <CardContent className="py-12 text-center">
            <Globe className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">暂无可用节点</h3>
            <p className="text-gray-600">请升级套餐以解锁更多节点</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
