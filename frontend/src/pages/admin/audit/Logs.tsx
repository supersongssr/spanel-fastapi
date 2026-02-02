import PlaceholderPage from "../placeholder"
import { FileText } from "lucide-react"

export default function AuditLogs() {
  return (
    <PlaceholderPage
      title="审计记录"
      description="查看系统审计日志记录"
      icon={<FileText className="h-6 w-6" />}
    />
  )
}
