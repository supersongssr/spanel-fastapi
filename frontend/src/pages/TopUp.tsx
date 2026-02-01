import { useState } from "react"
import {
  Wallet,
  CreditCard,
  Check,
  Info,
  Gift,
  TrendingUp,
  Shield,
  HeadphonesIcon,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { toast } from "sonner"

// Mock 数据
const mockUserData = {
  balance: 128.50,
  class: 1,
  classExpire: "2026-12-31 23:59:59",
}

const mockPaymentMethods = [
  {
    id: "alipay",
    name: "支付宝",
    icon: "💳",
    color: "from-blue-500 to-blue-600",
    description: "支持扫码支付",
    popular: true,
  },
  {
    id: "wechat",
    name: "微信支付",
    icon: "💰",
    color: "from-green-500 to-green-600",
    description: "支持扫码支付",
    popular: false,
  },
  {
    id: "paypal",
    name: "PayPal",
    icon: "🌍",
    color: "from-yellow-500 to-yellow-600",
    description: "国际信用卡支付",
    popular: false,
  },
  {
    id: "crypto",
    name: "加密货币",
    icon: "₿",
    color: "from-orange-500 to-orange-600",
    description: "BTC/ETH/USDT",
    popular: false,
  },
]

const mockRechargePackages = [
  { amount: 10, bonus: 0 },
  { amount: 30, bonus: 2 },
  { amount: 50, bonus: 5 },
  { amount: 100, bonus: 15 },
  { amount: 200, bonus: 40 },
  { amount: 500, bonus: 120 },
]

const mockCouponCode = "NEWYEAR2026"

export default function TopUp() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmount, setCustomAmount] = useState("")
  const [couponCode, setCouponCode] = useState("")
  const [couponApplied, setCouponApplied] = useState(false)
  const [activating, setActivating] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)

  const handlePackageSelect = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmount("")
  }

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value)
    setSelectedAmount(null)
  }

  const applyCoupon = () => {
    if (!couponCode.trim()) {
      toast.error("请输入卡密")
      return
    }

    if (couponCode.toUpperCase() === mockCouponCode.toUpperCase()) {
      setCouponApplied(true)
      toast.success("卡密激活成功！", {
        description: "已获得 ¥20 充值金额",
      })
    } else {
      toast.error("卡密无效或已过期")
    }
  }

  const handleActivate = () => {
    if (!couponCode.trim()) {
      toast.error("请输入卡密")
      return
    }

    setActivating(true)

    // 模拟激活过程
    setTimeout(() => {
      setActivating(false)
      setCouponCode("")
      setCouponApplied(false)

      const newBalance = mockUserData.balance + 20
      toast.success("充值成功！", {
        description: `余额已更新为 ¥${newBalance.toFixed(2)}`,
        duration: 5000,
      })
    }, 1500)
  }

  const handlePayment = (method: typeof mockPaymentMethods[0]) => {
    const amount = selectedAmount || parseFloat(customAmount)

    if (!amount || amount <= 0) {
      toast.error("请选择或输入充值金额")
      return
    }

    if (amount < 1) {
      toast.error("最低充值金额为 ¥1")
      return
    }

    setSelectedPayment(method.id)

    // 模拟支付流程
    toast.success(`正在跳转${method.name}...`, {
      description: `充值金额: ¥${amount}`,
    })

    setTimeout(() => {
      setSelectedPayment(null)
      toast.success("支付成功！", {
        description: `已充值 ¥${amount} 到账户`,
        duration: 5000,
      })
    }, 2000)
  }

  const calculateBonus = (amount: number) => {
    const pkg = mockRechargePackages.find((p) => p.amount === amount)
    return pkg?.bonus || 0
  }

  const getTotalAmount = () => {
    const amount = selectedAmount || parseFloat(customAmount) || 0
    const bonus = calculateBonus(amount)
    return amount + bonus
  }

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">捐赠充值</h1>
        <p className="text-gray-600 mt-1">为账户充值，享受更多优质服务</p>
      </div>

      {/* 当前余额卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                <Wallet className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-white/80">当前余额</p>
                <p className="text-3xl font-bold">¥{mockUserData.balance.toFixed(2)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-white/80">VIP 等级</p>
                <p className="text-3xl font-bold">VIP {mockUserData.class}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white border-0">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-white/20 flex items-center justify-center">
                <Gift className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-white/80">等级到期</p>
                <p className="text-sm font-semibold">{mockUserData.classExpire}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：充值方式 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 充值套餐 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-6 w-6" />
                选择充值金额
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* 预设套餐 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">快捷充值</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {mockRechargePackages.map((pkg) => {
                    const bonus = pkg.bonus > 0
                    const isSelected = selectedAmount === pkg.amount

                    return (
                      <button
                        key={pkg.amount}
                        onClick={() => handlePackageSelect(pkg.amount)}
                        className={`relative p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? "border-primary-user bg-primary-user/5"
                            : "border-gray-200 hover:border-primary-user/50"
                        }`}
                      >
                        <p className="text-2xl font-bold text-gray-900">
                          ¥{pkg.amount}
                        </p>
                        {bonus && (
                          <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">
                            送¥{pkg.bonus}
                          </div>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* 自定义金额 */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">自定义金额</p>
                <div className="flex gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      ¥
                    </span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => handleCustomAmountChange(e.target.value)}
                      placeholder="输入金额"
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-user focus:border-transparent"
                    />
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSelectedAmount(null)
                      setCustomAmount("")
                    }}
                  >
                    清除
                  </Button>
                </div>
              </div>

              {/* 在线支付 */}
              {(selectedAmount || customAmount) && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">选择支付方式</p>
                  <div className="grid grid-cols-2 gap-4">
                    {mockPaymentMethods.map((method) => (
                      <button
                        key={method.id}
                        onClick={() => handlePayment(method)}
                        disabled={selectedPayment !== null}
                        className={`relative p-6 rounded-lg border-2 transition-all ${
                          selectedPayment === method.id
                            ? "border-primary-user shadow-lg"
                            : "border-gray-200 hover:border-primary-user/50"
                        } ${selectedPayment !== null && selectedPayment !== method.id ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <div className="flex flex-col items-center gap-3">
                          <span className="text-4xl">{method.icon}</span>
                          <div className="text-center">
                            <p className="font-semibold text-gray-900">
                              {method.name}
                            </p>
                            <p className="text-xs text-gray-600">
                              {method.description}
                            </p>
                          </div>
                        </div>
                        {method.popular && (
                          <Badge className="absolute -top-2 right-2 bg-primary-user">
                            推荐
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 总计 */}
              {(selectedAmount || customAmount) && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">充值金额</p>
                      <p className="text-2xl font-bold text-primary-user">
                        ¥{(selectedAmount || parseFloat(customAmount) || 0).toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">实际到账</p>
                      <p className="text-2xl font-bold text-green-600">
                        ¥{getTotalAmount().toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 支付说明 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-6 w-6" />
                支付说明
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p>所有支付方式均采用 SSL 加密，确保资金安全</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p>充值即时到账，无需等待人工审核</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p>支持支付宝、微信支付、PayPal 等多种方式</p>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                <p>大额充值可联系客服享受更多优惠</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 右侧：卡密激活 */}
        <div className="space-y-6">
          {/* 卡密激活 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-6 w-6" />
                卡密激活
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  卡密代码
                </label>
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="输入卡密代码"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-user focus:border-transparent"
                  disabled={couponApplied}
                />
              </div>

              {!couponApplied ? (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={applyCoupon}
                    className="flex-1"
                  >
                    验证卡密
                  </Button>
                  <Button
                    onClick={handleActivate}
                    disabled={activating}
                    className="flex-1"
                  >
                    {activating ? "激活中..." : "立即激活"}
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleActivate}
                  disabled={activating}
                  className="w-full gap-2"
                >
                  {activating ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      激活中...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4" />
                      确认激活 ¥20
                    </>
                  )}
                </Button>
              )}

              {/* 卡密提示 */}
              <div className="bg-blue-50 rounded-lg p-4 text-sm text-blue-900">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="space-y-1">
                    <p className="font-semibold">测试卡密</p>
                    <p className="text-xs font-mono bg-white px-2 py-1 rounded">
                      {mockCouponCode}
                    </p>
                    <p className="text-xs mt-2">
                      真实卡密可通过活动或客服获取
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 客服联系 */}
          <Card className="bg-gradient-orange text-white border-0">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <HeadphonesIcon className="h-6 w-6 flex-shrink-0" />
                <div className="space-y-2">
                  <p className="font-semibold">需要帮助？</p>
                  <p className="text-sm text-white/90">
                    如遇到支付问题，请联系客服获取支持
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white text-primary-user hover:bg-white/90 border-0"
                  >
                    联系客服
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
