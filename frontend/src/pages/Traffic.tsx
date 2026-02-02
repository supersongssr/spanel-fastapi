import { useState } from "react"
import {
  TrendingUp,
  Activity,
  Calendar,
  BarChart3,
  Download,
  Upload,
  HardDrive,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"

// Mock 数据 - 流量统计
const mockTrafficStats = {
  totalUsed: 856.7, // GB
  totalLimit: 1074, // GB (1TB)
  todayUsed: 2.34, // GB
  todayUpload: 0.56,
  todayDownload: 1.78,
  yesterdayUsed: 3.12,
  weekAverage: 2.45,
}

// Mock 数据 - 每日流量记录（最近 30 天）
const mockDailyTraffic = [
  { date: "2025-01-29", upload: 0.42, download: 1.92, total: 2.34, percentage: 0.22 },
  { date: "2025-01-28", upload: 0.56, download: 2.56, total: 3.12, percentage: 0.29 },
  { date: "2025-01-27", upload: 0.38, download: 1.78, total: 2.16, percentage: 0.20 },
  { date: "2025-01-26", upload: 0.65, download: 3.12, total: 3.77, percentage: 0.35 },
  { date: "2025-01-25", upload: 0.29, download: 1.45, total: 1.74, percentage: 0.16 },
  { date: "2025-01-24", upload: 0.48, download: 2.34, total: 2.82, percentage: 0.26 },
  { date: "2025-01-23", upload: 0.52, download: 2.89, total: 3.41, percentage: 0.32 },
  { date: "2025-01-22", upload: 0.35, download: 1.67, total: 2.02, percentage: 0.19 },
  { date: "2025-01-21", upload: 0.61, download: 2.98, total: 3.59, percentage: 0.33 },
  { date: "2025-01-20", upload: 0.44, download: 2.12, total: 2.56, percentage: 0.24 },
  { date: "2025-01-19", upload: 0.39, download: 1.88, total: 2.27, percentage: 0.21 },
  { date: "2025-01-18", upload: 0.57, download: 2.67, total: 3.24, percentage: 0.30 },
  { date: "2025-01-17", upload: 0.31, download: 1.54, total: 1.85, percentage: 0.17 },
  { date: "2025-01-16", upload: 0.48, download: 2.35, total: 2.83, percentage: 0.26 },
  { date: "2025-01-15", upload: 0.53, download: 2.78, total: 3.31, percentage: 0.31 },
]

// 计算流量使用百分比
const usagePercentage = (mockTrafficStats.totalUsed / mockTrafficStats.totalLimit) * 100

export default function Traffic() {
  const [selectedPeriod, setSelectedPeriod] = useState<"week" | "month">("week")

  // 进度条颜色根据使用量变化
  const getProgressColor = (percentage: number) => {
    if (percentage < 50) return "bg-green-500"
    if (percentage < 80) return "bg-orange-500"
    return "bg-red-500"
  }

  // 根据使用量显示不同颜色
  const getUsageColor = (percentage: number) => {
    if (percentage < 50) return "text-green-600"
    if (percentage < 80) return "text-orange-600"
    return "text-red-600"
  }

  const formatTraffic = (gb: number) => {
    return gb.toFixed(2)
  }

  const displayedData = selectedPeriod === "week"
    ? mockDailyTraffic.slice(0, 7)
    : mockDailyTraffic

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">流量记录</h1>
        <p className="text-gray-600 mt-1">查看您的流量使用情况和历史记录</p>
      </div>

      {/* 流量统计概览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="card-material bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">已用流量</p>
                <p className="text-2xl font-bold text-blue-900 mt-2">
                  {formatTraffic(mockTrafficStats.totalUsed)} GB
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-blue-200 flex items-center justify-center">
                <HardDrive className="h-6 w-6 text-blue-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-material bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">剩余流量</p>
                <p className="text-2xl font-bold text-green-900 mt-2">
                  {formatTraffic(mockTrafficStats.totalLimit - mockTrafficStats.totalUsed)} GB
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-green-200 flex items-center justify-center">
                <Activity className="h-6 w-6 text-green-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-material bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">今日使用</p>
                <p className="text-2xl font-bold text-purple-900 mt-2">
                  {formatTraffic(mockTrafficStats.todayUsed)} GB
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-purple-200 flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-purple-700" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-material bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">日均使用</p>
                <p className="text-2xl font-bold text-orange-900 mt-2">
                  {formatTraffic(mockTrafficStats.weekAverage)} GB
                </p>
              </div>
              <div className="h-12 w-12 rounded-full bg-orange-200 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-orange-700" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 总流量使用进度条 */}
      <Card className="card-material">
        <CardHeader>
          <CardTitle>总流量使用情况</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">
                已使用 {formatTraffic(mockTrafficStats.totalUsed)} GB / 总计 {formatTraffic(mockTrafficStats.totalLimit)} GB
              </span>
              <span className={`text-lg font-bold ${getUsageColor(usagePercentage)}`}>
                {usagePercentage.toFixed(1)}%
              </span>
            </div>
            {/* 进度条 */}
            <div className="h-4 w-full bg-gray-200 rounded-full overflow-hidden">
              <div
                className={`h-full ${getProgressColor(usagePercentage)} transition-all duration-500 ease-out`}
                style={{ width: `${usagePercentage}%` }}
              />
            </div>
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>0 GB</span>
              <span>{(mockTrafficStats.totalLimit / 2).toFixed(0)} GB</span>
              <span>{mockTrafficStats.totalLimit} GB</span>
            </div>
          </div>

          {/* 今日上传下载统计 */}
          <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">今日上传</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatTraffic(mockTrafficStats.todayUpload)} GB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Download className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-xs text-gray-600">今日下载</p>
                <p className="text-sm font-semibold text-gray-900">
                  {formatTraffic(mockTrafficStats.todayDownload)} GB
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 每日流量详情 */}
      <Card className="card-material">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>每日流量记录</CardTitle>
            <div className="flex gap-2">
              <Badge
                variant={selectedPeriod === "week" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedPeriod("week")}
              >
                最近 7 天
              </Badge>
              <Badge
                variant={selectedPeriod === "month" ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setSelectedPeriod("month")}
              >
                最近 15 天
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">日期</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">上传</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">下载</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">总计</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">占比</th>
                </tr>
              </thead>
              <tbody>
                {displayedData.map((record, index) => (
                  <tr
                    key={record.date}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-900">{record.date}</span>
                        {index === 0 && (
                          <Badge variant="default" className="text-xs">
                            今天
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Upload className="h-3 w-3 text-blue-600" />
                        <span className="text-gray-900">{formatTraffic(record.upload)} GB</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Download className="h-3 w-3 text-green-600" />
                        <span className="text-gray-900">{formatTraffic(record.download)} GB</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm font-semibold text-gray-900">
                        {formatTraffic(record.total)} GB
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24">
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${getProgressColor(record.percentage * 100)}`}
                              style={{ width: `${record.percentage * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-gray-600 w-12">
                          {(record.percentage * 100).toFixed(0)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* 流量使用提示 */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="space-y-2 text-sm text-blue-900">
            <p className="font-semibold">流量统计说明</p>
            <ul className="space-y-1 list-disc list-inside text-blue-800">
              <li>流量统计每 5 分钟更新一次，可能有短暂延迟</li>
              <li>上传和下载流量都会计入总流量使用量</li>
              <li>套餐到期后流量会重置，请注意及时续费</li>
              <li>建议每日流量使用控制在 3GB 以内，避免超出套餐限额</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
