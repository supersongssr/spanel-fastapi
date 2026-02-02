import { useState } from "react"
import { Link } from "react-router-dom"
import { Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"

export default function ResetPassword() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim()) {
      alert("请输入邮箱地址")
      return
    }

    setLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    console.log("Password reset requested for:", email)
    setSubmitted(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-orange-50/30 flex items-center justify-center p-4">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-red-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      <div className="absolute top-40 right-10 w-72 h-72 bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>

      <div className="w-full max-w-md">
        {/* Logo and Navigation */}
        <div className="text-center mb-8">
          <Link to="/" className="text-3xl font-bold bg-gradient-red bg-clip-text text-transparent">
            sPanel
          </Link>
          <p className="text-gray-600 mt-2">找回密码</p>
        </div>

        {/* Auth Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
          {!submitted ? (
            <>
              <div className="mb-6">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  返回登录
                </Link>
              </div>

              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  找回密码
                </h2>
                <p className="text-gray-600">
                  输入您的注册邮箱，我们将向您发送密码重置链接
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Email Field */}
                <div className="space-y-2">
                  <Label htmlFor="email">注册邮箱</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-red hover:bg-primary-admin-hover py-6 text-base font-semibold shadow-lg"
                >
                  {loading ? "发送中..." : "发送重置链接"}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">或</span>
                </div>
              </div>

              {/* Back to Register */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  还没有账号？
                  <Link
                    to="/auth/register"
                    className="font-medium text-primary-admin hover:text-red-700 transition-colors ml-1"
                  >
                    立即注册
                  </Link>
                </p>
              </div>
            </>
          ) : (
            <>
              {/* Success State */}
              <div className="text-center py-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-6">
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  邮件已发送
                </h2>

                <p className="text-gray-600 mb-8">
                  我们已向 <span className="font-semibold text-gray-900">{email}</span> 发送了密码重置链接。
                  <br />
                  请查收邮件并按照提示重置密码。
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={() => setSubmitted(false)}
                    className="w-full bg-gradient-red hover:bg-primary-admin-hover"
                  >
                    重新发送
                  </Button>

                  <Link
                    to="/auth/login"
                    className="block w-full py-3 text-center text-sm font-medium text-gray-700 hover:text-gray-900 border-2 border-gray-200 rounded-lg hover:border-gray-300 transition-colors"
                  >
                    返回登录
                  </Link>
                </div>

                <p className="text-sm text-gray-500 mt-6">
                  没有收到邮件？请检查垃圾邮件文件夹，或确认邮箱地址是否正确
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-gray-500">
          <Link
            to="/"
            className="text-primary-admin hover:text-red-700 transition-colors"
          >
            返回首页
          </Link>
        </div>
      </div>
    </div>
  )
}
