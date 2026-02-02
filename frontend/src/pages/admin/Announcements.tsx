import { Megaphone, Plus, Edit, Trash2 } from "lucide-react"
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

// Mock data based on original spanel structure
const mockAnnouncements = [
  {
    id: 1,
    date: "2025-02-01 10:00:00",
    markdown: "# 🎉 新年特惠活动开启！\n\n为感谢用户支持，我们特别推出新年优惠套餐..."
  },
  {
    id: 2,
    date: "2025-01-28 15:30:00",
    markdown: "# 系统维护通知\n\n我们将于2025年2月1日凌晨2点进行系统升级..."
  },
  {
    id: 3,
    date: "2025-01-25 09:00:00",
    markdown: "# 新节点上线：香港高速节点\n\n全新香港节点已上线，欢迎体验..."
  },
  {
    id: 4,
    date: "2025-01-20 14:20:00",
    markdown: "# 春节假期服务安排\n\n春节期间客服值班时间调整通知..."
  },
]

function extractTitle(markdown: string): string {
  const match = markdown.match(/^#\s+(.+)$/m)
  return match ? match[1] : "无标题"
}

export default function AdminAnnouncements() {
  const handleDelete = (id: number, title: string) => {
    if (confirm(`确定要删除公告「${title}」吗？`)) {
      alert(`删除公告 ID: ${id}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">公告管理</h1>
          <p className="text-sm text-gray-500 mt-1">管理系统公告与通知推送</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          发布公告
        </Button>
      </div>

      <Card className="bg-orange-50 border-orange-200">
        <div className="flex items-start space-x-3">
          <Megaphone className="h-5 w-5 text-orange-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-orange-800">
              系统中所有公告列表
            </p>
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
                <TableHead>日期</TableHead>
                <TableHead>内容</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockAnnouncements.map((ann) => (
                <TableRow key={ann.id}>
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
                        onClick={() => handleDelete(ann.id, extractTitle(ann.markdown))}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        删除
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{ann.id}</TableCell>
                  <TableCell className="text-gray-600 text-sm">{ann.date}</TableCell>
                  <TableCell>
                    <div className="max-w-md">
                      <p className="font-medium text-gray-900 mb-1">
                        {extractTitle(ann.markdown)}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {ann.markdown.substring(0, 100)}...
                      </p>
                    </div>
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
