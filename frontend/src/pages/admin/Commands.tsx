import { useState } from "react"
import { Terminal, Play, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Textarea } from "@/components/ui/Textarea"
import { Label } from "@/components/ui/Label"

// Mock 命令历史数据
interface CommandHistory {
  id: number
  command: string
  node_target: string
  status: "success" | "failed" | "running"
  result?: string
  executed_at: string
  execution_time?: number
}

const mockCommands: CommandHistory[] = [
  {
    id: 1,
    command: "systemctl restart ss-server",
    node_target: "香港 IPLC 01",
    status: "success",
    result: "Redirecting to /bin/systemctl restart ss-server\nJob for ss-server.service succeeded.",
    executed_at: "2026-02-02T10:30:00",
    execution_time: 2.3,
  },
  {
    id: 2,
    command: "iptables -L -n -v",
    node_target: "日本 BGP 02",
    status: "success",
    result: "Chain INPUT (policy ACCEPT 4521 packets, 523K bytes)\n pkts bytes target     prot opt in     out     source               destination\n...",
    executed_at: "2026-02-02T09:15:00",
    execution_time: 0.8,
  },
  {
    id: 3,
    command: "cat /etc/shadow",
    node_target: "美国 LA 03",
    status: "failed",
    result: "Permission denied (user=www-data)",
    executed_at: "2026-02-02T08:45:00",
  },
  {
    id: 4,
    command: "df -h",
    node_target: "新加坡 04",
    status: "running",
    executed_at: "2026-02-02T11:00:00",
  },
]

export default function AdminCommands() {
  const [commands] = useState<CommandHistory[]>(mockCommands)
  const [currentCommand, setCurrentCommand] = useState("")
  const [selectedNodes, setSelectedNodes] = useState<string[]>([])
  const [isExecuting, setIsExecuting] = useState(false)

  const handleExecute = () => {
    if (!currentCommand.trim() || selectedNodes.length === 0) return
    setIsExecuting(true)
    // 模拟执行
    setTimeout(() => {
      setIsExecuting(false)
      setCurrentCommand("")
      setSelectedNodes([])
    }, 2000)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return (
          <Badge variant="success" className="gap-1.5">
            <CheckCircle className="h-3 w-3" />
            成功
          </Badge>
        )
      case "failed":
        return (
          <Badge variant="destructive" className="gap-1.5">
            <XCircle className="h-3 w-3" />
            失败
          </Badge>
        )
      case "running":
        return (
          <Badge variant="warning" className="gap-1.5">
            <Terminal className="h-3 w-3" />
            执行中
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  const nodes = ["香港 IPLC 01", "日本 BGP 02", "美国 LA 03", "新加坡 04", "台湾 05"]

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">下发命令</h1>
          <p className="text-gray-600 mt-1">向节点远程下发控制命令</p>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">总命令</p>
                <p className="text-2xl font-bold text-gray-900">{commands.length}</p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Terminal className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">执行成功</p>
                <p className="text-2xl font-bold text-green-600">
                  {commands.filter(c => c.status === "success").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">执行失败</p>
                <p className="text-2xl font-bold text-red-600">
                  {commands.filter(c => c.status === "failed").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">执行中</p>
                <p className="text-2xl font-bold text-orange-600">
                  {commands.filter(c => c.status === "running").length}
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 命令执行区 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 命令输入 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="h-6 w-6 text-primary-admin" />
              执行命令
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="command">Shell 命令</Label>
              <Textarea
                id="command"
                placeholder="输入要执行的命令，例如：systemctl restart ss-server"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                className="font-mono text-sm bg-gray-50"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>选择目标节点</Label>
              <div className="grid grid-cols-2 gap-2">
                {nodes.map((node) => (
                  <button
                    key={node}
                    onClick={() => {
                      if (selectedNodes.includes(node)) {
                        setSelectedNodes(selectedNodes.filter(n => n !== node))
                      } else {
                        setSelectedNodes([...selectedNodes, node])
                      }
                    }}
                    className={`p-3 rounded-lg border-2 text-left text-sm transition-all ${
                      selectedNodes.includes(node)
                        ? "border-primary-admin bg-primary-admin/5 text-primary-admin"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{node}</span>
                      {selectedNodes.includes(node) && (
                        <CheckCircle className="h-4 w-4" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              className="w-full bg-gradient-red hover:bg-primary-admin-hover gap-2"
              onClick={handleExecute}
              disabled={isExecuting || !currentCommand.trim() || selectedNodes.length === 0}
            >
              {isExecuting ? (
                <>
                  <Terminal className="h-5 w-5 animate-pulse" />
                  执行中...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5" />
                  执行命令
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* 执行结果监控 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-6 w-6 text-primary-admin" />
              执行结果
            </CardTitle>
          </CardHeader>
          <CardContent>
            {commands.length === 0 ? (
              <div className="h-full min-h-[300px] flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <Terminal className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                  <p>暂无执行记录</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {commands.slice(0, 3).map((cmd) => (
                  <div
                    key={cmd.id}
                    className="rounded-lg overflow-hidden border border-gray-200"
                  >
                    {/* 命令头部 */}
                    <div className="bg-gray-50 px-4 py-3 border-b flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Terminal className="h-4 w-4 text-gray-500" />
                        <code className="text-sm font-semibold text-gray-900">
                          {cmd.command}
                        </code>
                        <Badge variant="outline" className="text-xs">{cmd.node_target}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(cmd.status)}
                        {cmd.execution_time && (
                          <span className="text-xs text-gray-500">{cmd.execution_time}s</span>
                        )}
                      </div>
                    </div>

                    {/* 命令结果（黑色代码块） */}
                    {cmd.result && (
                      <div className="bg-gray-900 p-4">
                        <pre className="text-xs text-green-400 font-mono whitespace-pre-wrap break-all">
                          {cmd.result}
                        </pre>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 命令历史 */}
      <Card>
        <CardHeader>
          <CardTitle>执行历史</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">ID</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">命令</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">目标节点</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">状态</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">执行时间</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">耗时</th>
                </tr>
              </thead>
              <tbody>
                {commands.map((cmd) => (
                  <tr key={cmd.id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">#{cmd.id}</td>
                    <td className="py-3 px-4 font-mono text-gray-600 max-w-[300px] truncate">
                      {cmd.command}
                    </td>
                    <td className="py-3 px-4">{cmd.node_target}</td>
                    <td className="py-3 px-4">{getStatusBadge(cmd.status)}</td>
                    <td className="py-3 px-4 text-gray-600">
                      {new Date(cmd.executed_at).toLocaleString("zh-CN")}
                    </td>
                    <td className="py-3 px-4">
                      {cmd.execution_time ? `${cmd.execution_time}s` : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
