import { ShoppingBag, Plus, Edit, Package } from "lucide-react"
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

// Mock data based on original spanel structure
const mockProducts = [
  {
    id: 1,
    name: "月度VIP套餐",
    price: 29.99,
    content: { bandwidth: 100, expire: 30, class: 1 },
    auto_renew: 30,
    auto_reset_bandwidth: 1,
    status: 1,
    period_sales: 156
  },
  {
    id: 2,
    name: "季度VIP套餐",
    price: 79.99,
    content: { bandwidth: 300, expire: 90, class: 1 },
    auto_renew: 90,
    auto_reset_bandwidth: 1,
    status: 1,
    period_sales: 89
  },
  {
    id: 3,
    name: "年度超级VIP",
    price: 299.99,
    content: { bandwidth: 1024, expire: 365, class: 2 },
    auto_renew: 365,
    auto_reset_bandwidth: 1,
    status: 1,
    period_sales: 234
  },
  {
    id: 4,
    name: "流量包 100GB",
    price: 19.99,
    content: { bandwidth: 100 },
    auto_renew: 0,
    auto_reset_bandwidth: 0,
    status: 1,
    period_sales: 67
  },
  {
    id: 5,
    name: "体验套餐（已下架）",
    price: 9.99,
    content: { bandwidth: 10, expire: 7 },
    auto_renew: 0,
    auto_reset_bandwidth: 0,
    status: 0,
    period_sales: 0
  },
]

function formatContent(content: any): string {
  const parts: string[] = []
  if (content.bandwidth) parts.push(`${content.bandwidth}GB`)
  if (content.expire) parts.push(`${content.expire}天`)
  if (content.class) parts.push(`LV.${content.class}`)
  return parts.join(" | ") || "-"
}

export default function TransactionProducts() {
  const handleDelete = (id: number, name: string) => {
    if (confirm(`确定要下架「${name}」吗？\n提示：下架会关闭所有购买过的此套餐的自动续费！`)) {
      alert(`下架商品 ID: ${id}`)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">商品列表</h1>
          <p className="text-sm text-gray-500 mt-1">管理在售套餐与商品</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700 text-white">
          <Plus className="h-4 w-4 mr-2" />
          新增商品
        </Button>
      </div>

      <Card className="bg-purple-50 border-purple-200">
        <div className="flex items-start space-x-3">
          <ShoppingBag className="h-5 w-5 text-purple-600 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-purple-800">
              系统中所有商品的列表
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
                <TableHead>商品名称</TableHead>
                <TableHead>价格</TableHead>
                <TableHead>商品内容</TableHead>
                <TableHead>自动续费</TableHead>
                <TableHead>续费重置流量</TableHead>
                <TableHead>状态</TableHead>
                <TableHead>周期销量</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockProducts.map((product) => (
                <TableRow key={product.id}>
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
                        onClick={() => handleDelete(product.id, product.name)}
                        disabled={product.status === 0}
                      >
                        下架
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{product.id}</TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell className="font-semibold text-red-600">
                    ¥{product.price.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-sm">{formatContent(product.content)}</TableCell>
                  <TableCell>
                    {product.auto_renew === 0 ? (
                      <Badge variant="outline">不自动续费</Badge>
                    ) : (
                      <Badge variant="secondary">{product.auto_renew} 天后续费</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.auto_reset_bandwidth === 0 ? (
                      <span className="text-gray-500">不自动重置</span>
                    ) : (
                      <Badge variant="secondary">自动重置</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {product.status === 1 ? (
                      <Badge variant="default" className="bg-green-600">上架</Badge>
                    ) : (
                      <Badge variant="outline">下架</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Package className="h-3 w-3 text-gray-400" />
                      <span className="font-medium">{product.period_sales}</span>
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
