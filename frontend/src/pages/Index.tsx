import { Link } from "react-router-dom"
import { Rocket, Shield, Zap, Globe, CheckCircle, ArrowRight } from "lucide-react"

export default function Index() {
  const features = [
    {
      icon: <Rocket className="h-8 w-8" />,
      title: "极致速度",
      description: "全球多节点部署，低延迟高速网络，畅享无忧上网体验",
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: "安全加密",
      description: "采用企业级加密技术，保护您的隐私和数据安全",
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: "多协议支持",
      description: "支持 SS/Vmess/Vless/Trojan 等多种协议，兼容所有主流设备",
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "全球覆盖",
      description: "节点覆盖香港、日本、美国、新加坡等多个地区",
    },
  ]

  const plans = [
    {
      name: "基础版",
      price: "¥9.9",
      period: "/月",
      features: [
        "100GB 月流量",
        "10个节点",
        "基础线路",
        "工单支持",
      ],
      cta: "立即开始",
      popular: false,
    },
    {
      name: "进阶版",
      price: "¥29.9",
      period: "/月",
      features: [
        "500GB 月流量",
        "30个节点",
        "CN2/IPLC 精品线路",
        "优先客服",
        "Telegram 机器人",
      ],
      cta: "最受欢迎",
      popular: true,
    },
    {
      name: "团队版",
      price: "¥99.9",
      period: "/月",
      features: [
        "不限流量",
        "全部节点",
        "专属独享线路",
        "一对一技术支持",
        "API 访问",
        "多用户管理",
      ],
      cta: "联系销售",
      popular: false,
    },
  ]

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-red bg-clip-text text-transparent">
                sPanel
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/auth/login"
                className="text-gray-700 hover:text-gray-900 font-medium transition-colors"
              >
                登录
              </Link>
              <Link
                to="/auth/register"
                className="bg-gradient-red hover:bg-primary-admin-hover text-white px-6 py-2 rounded-lg font-medium transition-all shadow-lg hover:shadow-xl"
              >
                注册账号
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/30">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <h2 className="text-5xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              下一代
              <span className="bg-gradient-red bg-clip-text text-transparent">
                {" "}科学上网
              </span>
              <br />
              服务平台
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              极速稳定的网络体验 · 企业级安全加密 · 全天候技术支持
              <br />
              立即注册，开启畅快上网之旅
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                to="/auth/register"
                className="bg-gradient-red hover:bg-primary-admin-hover text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-2xl hover:shadow-3xl flex items-center gap-2 group"
              >
                立即开始
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/auth/login"
                className="bg-white hover:bg-gray-50 text-gray-900 px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl border-2 border-gray-200"
              >
                用户中心
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute top-40 right-10 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/2 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">为什么选择我们</h3>
            <p className="text-xl text-gray-600">
              专业团队打造，为您提供最优质的服务体验
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-8 rounded-2xl border-2 border-gray-100 hover:border-red-200 hover:shadow-xl transition-all bg-white"
              >
                <div className="text-primary-admin mb-4 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h4 className="text-xl font-bold text-gray-900 mb-3">
                  {feature.title}
                </h4>
                <p className="text-gray-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 bg-gradient-to-br from-gray-50 to-red-50/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-4xl font-bold text-gray-900 mb-4">价格方案</h3>
            <p className="text-xl text-gray-600">
              选择适合您的套餐，随时可以升级或降级
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <div
                key={index}
                className={`relative p-8 rounded-2xl transition-all ${
                  plan.popular
                    ? "bg-gradient-red border-2 border-red-500 shadow-2xl scale-105"
                    : "bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-xl"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-red-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      最受欢迎
                    </span>
                  </div>
                )}

                <div className="text-center mb-8">
                  <h4 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h4>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-5xl font-bold text-gray-900">
                      {plan.price}
                    </span>
                    <span className="text-xl text-gray-600">{plan.period}</span>
                  </div>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-3">
                      <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  to={plan.popular ? "/auth/register" : "/auth/register"}
                  className={`block w-full py-4 rounded-xl font-semibold text-center transition-all ${
                    plan.popular
                      ? "bg-white text-red-600 hover:bg-gray-100"
                      : "bg-gradient-red text-white hover:bg-primary-admin-hover"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-red">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-4xl font-bold text-white mb-6">
            准备好开始了吗？
          </h3>
          <p className="text-xl text-white/90 mb-10">
            立即注册，新用户注册即可获得免费流量体验
          </p>
          <Link
            to="/auth/register"
            className="inline-flex items-center gap-2 bg-white text-red-600 px-10 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all shadow-2xl"
          >
            立即注册
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white text-lg font-bold mb-4">sPanel</h4>
              <p className="text-sm leading-relaxed">
                下一代科学上网服务平台，为用户提供高速、稳定、安全的网络体验。
              </p>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">产品</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    节点列表
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    价格方案
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    使用教程
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">支持</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    帮助中心
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    工单系统
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    联系我们
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="text-white font-semibold mb-4">法律</h5>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    服务条款
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    隐私政策
                  </Link>
                </li>
                <li>
                  <Link to="#" className="hover:text-white transition-colors">
                    退款政策
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2026 sPanel. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
