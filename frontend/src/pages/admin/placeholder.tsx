import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/Table"

interface PlaceholderPageProps {
  title: string
  description: string
  icon?: React.ReactNode
}

export default function PlaceholderPage({ title, description, icon }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {icon && <div className="h-10 w-10 rounded-lg bg-primary-admin/10 flex items-center justify-center text-primary-admin">
            {icon}
          </div>}
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <p className="text-gray-600 mt-1">{description}</p>
          </div>
        </div>
        <Button className="bg-gradient-red hover:bg-primary-admin-hover">
          新增
        </Button>
      </div>

      {/* 统计卡片占位 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                </div>
                <div className="h-12 w-12 rounded-full bg-gray-100" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 表格占位 */}
      <Card>
        <CardHeader>
          <CardTitle>{title}列表</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>项目名称</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>创建时间</TableHead>
                <TableHead className="text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-gray-500">
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center">
                      <span className="text-3xl">🚧</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">功能开发中</p>
                      <p className="text-sm mt-1">该功能模块正在开发中，敬请期待</p>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
