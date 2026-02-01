import { useState } from "react"
import {
  ShoppingCart,
  Star,
  Zap,
  Clock,
  Smartphone,
  Award,
  Info,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

// Mock 套餐数据 - 严格遵循后端数据结构
const mockPackages = [
  {
    id: 1,
    name: "月度体验套餐",
    price: 19.99,
    content: {
      traffic: 100, // GB
      class: 1,
      class_expire: 30, // 天
      speed_limit: 100, // Mbps
      devices: 3,
    },
    auto_renew: 0,
    auto_reset_bandwidth: 1,
    status: 1,
    popular: false,
    description: "适合轻度使用的入门套餐",
  },
  {
    id: 2,
    name: "季度标准套餐",
    price: 49.99,
    content: {
      traffic: 300, // GB
      class: 1,
      class_expire: 90, // 天
      speed_limit: 200, // Mbps
      devices: 5,
    },
    auto_renew: 0,
    auto_reset_bandwidth: 1,
    status: 1,
    popular: true,
    description: "性价比之选，畅享高速浏览",
  },
  {
    id: 3,
    name: "年度尊享套餐",
    price: 159.99,
    content: {
      traffic: 1074, // GB (1TB)
      class: 2,
      class_expire: 365, // 天
      speed_limit: 500, // Mbps
      devices: 10,
    },
    auto_renew: 0,
    auto_reset_bandwidth: 1,
    status: 1,
    popular: true,
    description: "全年无忧，VIP 2 特权尊享",
  },
  {
    id: 4,
    name: "旗舰尊贵套餐",
    price: 299.99,
    content: {
      traffic: 3222, // GB (3TB)
      class: 3,
      class_expire: 365, // 天
      speed_limit: 1000, // Mbps
      devices: 20,
    },
    auto_renew: 0,
    auto_reset_bandwidth: 1,
    status: 1,
    popular: false,
    description: "终极体验，解锁全部 VIP 3 节点",
  },
  {
    id: 5,
    name: "按量计费套餐",
    price: 0,
    content: {
      traffic: 0, // 不限
      class: 1,
      class_expire: 30, // 天
      speed_limit: 100, // Mbps
      devices: 3,
    },
    auto_renew: 0,
    auto_reset_bandwidth: 0,
    status: 1,
    popular: false,
    description: "按实际使用量计费，灵活自由",
  },
]

const mockUserBalance = 128.50

export default function Shop() {
  const [selectedPackage, setSelectedPackage] = useState<number | null>(null)
  const [purchasing, setPurchasing] = useState(false)

  const handlePurchase = (pkg: typeof mockPackages[0]) => {
    if (purchasing) return

    // 检查余额
    if (pkg.price > mockUserBalance) {
      toast.error(`余额不足！需要 ¥${pkg.price}，当前余额 ¥${mockUserBalance}`)
      return
    }

    setSelectedPackage(pkg.id)
    setPurchasing(true)

    // 模拟购买过程
    setTimeout(() => {
      setPurchasing(false)
      toast.success(`购买成功！已开通 ${pkg.name}`, {
        description: `消费 ¥${pkg.price}，剩余余额 ¥${(mockUserBalance - pkg.price).toFixed(2)}`,
        duration: 5000,
      })
      setSelectedPackage(null)
    }, 1500)
  }

  const formatTraffic = (gb: number) => {
    if (gb === 0) return "不限流量"
    if (gb >= 1024) return `${(gb / 1024).toFixed(0)} TB`
    return `${gb} GB`
  }

  const formatDuration = (days: number) => {
    if (days >= 365) return `${(days / 365).toFixed(0)} 年`
    if (days >= 30) return `${(days / 30).toFixed(0)} 个月`
    return `${days} 天`
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">套餐购买</h1>
          <p className="text-gray-600 mt-1">选择适合您的套餐，享受高速网络服务</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">当前余额</p>
          <p className="text-2xl font-bold text-green-600">¥{mockUserBalance.toFixed(2)}</p>
        </div>
      </div>

      {/* 套餐卡片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPackages.map((pkg) => {
          const isPopular = pkg.popular
          const isSelected = selectedPackage === pkg.id
          const canAfford = pkg.price <= mockUserBalance

          return (
            <Card
              key={pkg.id}
              className={`card-material relative transition-all duration-300 hover:shadow-xl ${
                isPopular ? "border-2 border-primary-user shadow-lg" : ""
              }`}
            >
              {/* 推荐标签 */}
              {isPopular && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <div className="bg-gradient-orange text-white px-4 py-1 rounded-full text-sm font-semibold flex items-center gap-1 shadow-md">
                    <Star className="h-4 w-4 fill-current" />
                    最受欢迎
                  </div>
                </div>
              )}

              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <span className="text-xl">{pkg.name}</span>
                  {pkg.content.class >= 2 && (
                    <Badge variant="success" className="gap-1">
                      <Award className="h-3 w-3" />
                      VIP {pkg.content.class}
                    </Badge>
                  )}
                </CardTitle>
                <p className="text-sm text-gray-600 mt-2">{pkg.description}</p>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* 价格 */}
                <div className="text-center py-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-lg">
                  <p className="text-4xl font-bold text-primary-user">
                    {pkg.price === 0 ? "按量计费" : `¥${pkg.price}`}
                  </p>
                  {pkg.price > 0 && (
                    <p className="text-sm text-gray-600 mt-1">一次性付款</p>
                  )}
                </div>

                {/* 套餐详情 */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600">流量额度</p>
                      <p className="font-semibold text-gray-900">
                        {formatTraffic(pkg.content.traffic)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600">有效时长</p>
                      <p className="font-semibold text-gray-900">
                        {formatDuration(pkg.content.class_expire)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-purple-100 flex items-center justify-center flex-shrink-0">
                      <Smartphone className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600">支持设备</p>
                      <p className="font-semibold text-gray-900">
                        {pkg.content.devices} 台设备同时在线
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-sm">
                    <div className="h-8 w-8 rounded-lg bg-orange-100 flex items-center justify-center flex-shrink-0">
                      <Info className="h-4 w-4 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-gray-600">速率限制</p>
                      <p className="font-semibold text-gray-900">
                        {pkg.content.speed_limit >= 1000
                          ? "不限速"
                          : `${pkg.content.speed_limit} Mbps`}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 购买按钮 */}
                <Button
                  onClick={() => handlePurchase(pkg)}
                  disabled={!canAfford || purchasing}
                  className={`w-full gap-2 ${
                    isPopular
                      ? "bg-primary-user hover:bg-primary-user-hover"
                      : ""
                  }`}
                  size="lg"
                >
                  {isSelected && purchasing ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      处理中...
                    </>
                  ) : !canAfford ? (
                    <>余额不足</>
                  ) : (
                    <>
                      <ShoppingCart className="h-4 w-4" />
                      {pkg.price === 0 ? "立即开通" : "立即购买"}
                    </>
                  )}
                </Button>

                {/* 余额不足提示 */}
                {!canAfford && pkg.price > 0 && (
                  <p className="text-xs text-center text-orange-600">
                    还需要 ¥{(pkg.price - mockUserBalance).toFixed(2)}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* 底部提示 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div className="space-y-2 text-sm text-blue-900">
              <p className="font-semibold">购买说明</p>
              <ul className="space-y-1 list-disc list-inside">
                <li>购买后立即生效，流量从激活时间开始计算</li>
                <li>VIP 等级越高，可使用节点越多，速度越快</li>
                <li>套餐到期后可续费，否则降级为免费用户</li>
                <li>按量计费套餐根据实际使用流量结算</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
