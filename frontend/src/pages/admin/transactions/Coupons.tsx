import { Percent, Ticket } from "lucide-react"
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
const mockCoupons = [
  {
    id: 1,
    code: "WELCOME2025",
    expire: "2025-12-31 23:59:59",
    shop: "0",
    credit: 10,
    onetime: 1
  },
  {
    id: 2,
    code: "VIP90OFF",
    expire: "2025-06-30 23:59:59",
    shop: "1,2,3",
    credit: 90,
    onetime: 0
  },
  {
    id: 3,
    code: "SPRING50",
    expire: "2025-03-31 23:59:59",
    shop: "",
    credit: 50,
    onetime: 1
  },
  {
    id: 4,
    code: "YEARLY20",
    expire: "2025-01-31 23:59:59",
    shop: "3",
    credit: 20,
    onetime: 0
  },
]

export default function TransactionCoupons() {
  const [prefix, setPrefix] = useState("")
  const [credit, setCredit] = useState("")
  const [expire, setExpire] = useState(24)
  const [shop, setShop] = useState("")
  const [count, setCount] = useState(1)
  const [onetime, setOnetime] = useState(false)

  const handleGenerate = () => {
    if (!credit) {
      alert("请输入优惠码额度")
      return
    }
    alert(`生成优惠码\n前缀: ${prefix || "(随机)"}\n额度: ${credit}%\n有效期: ${expire}小时`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">优惠码</h1>
          <p className="text-sm text-gray-500 mt-1">创建与管理优惠折扣码</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 生成优惠码表单 */}
        <Card className="lg:col-span-1">
          <div className="p-6 space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <Ticket className="h-5 w-5 text-purple-600" />
              生成优惠码
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                优惠码前缀
              </label>
              <input
                type="text"
                value={prefix}
                onChange={(e) => setPrefix(e.target.value)}
                placeholder="留空生成随机码"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">生成随机优惠码不填</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                优惠码额度
              </label>
              <input
                type="text"
                value={credit}
                onChange={(e) => setCredit(e.target.value)}
                placeholder="例如：10"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">百分比，九折就填 10</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                优惠码有效期(小时)
              </label>
              <input
                type="number"
                value={expire}
                onChange={(e) => setExpire(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                限定商品ID
              </label>
              <input
                type="text"
                value={shop}
                onChange={(e) => setShop(e.target.value)}
                placeholder="留空为全部商品"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">多个商品用英文半角逗号分割</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                每个用户可用次数
              </label>
              <input
                type="number"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
              />
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="onetime"
                checked={onetime}
                onChange={(e) => setOnetime(e.target.checked)}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
              />
              <label htmlFor="onetime" className="text-sm text-gray-700">
                一次性的，只在用户当次购买时有效
              </label>
            </div>

            <Button onClick={handleGenerate} className="w-full bg-purple-600 hover:bg-purple-700">
              生成优惠码
            </Button>
          </div>
        </Card>

        {/* 优惠码列表 */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-purple-50 border-purple-200">
            <div className="flex items-start space-x-3">
              <Percent className="h-5 w-5 text-purple-600 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm text-purple-800">
                  系统中所有优惠码列表
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
                    <TableHead>优惠码</TableHead>
                    <TableHead>折扣额度</TableHead>
                    <TableHead>过期时间</TableHead>
                    <TableHead>限定商品</TableHead>
                    <TableHead>使用限制</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockCoupons.map((coupon) => (
                    <TableRow key={coupon.id}>
                      <TableCell>{coupon.id}</TableCell>
                      <TableCell className="font-mono text-sm font-semibold">
                        {coupon.code}
                      </TableCell>
                      <TableCell className="font-semibold text-red-600">
                        {coupon.credit}%
                      </TableCell>
                      <TableCell className="text-gray-600 text-sm">
                        {coupon.expire}
                      </TableCell>
                      <TableCell>
                        {coupon.shop === "" || coupon.shop === "0" ? (
                          <Badge variant="secondary">全部商品</Badge>
                        ) : (
                          <span className="text-sm">{coupon.shop}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {coupon.onetime === 1 ? (
                          <Badge variant="outline">一次性</Badge>
                        ) : (
                          <Badge variant="secondary">可重复使用</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
