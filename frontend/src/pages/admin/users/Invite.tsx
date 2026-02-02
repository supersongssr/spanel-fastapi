import PlaceholderPage from "../placeholder"
import { Receipt } from "lucide-react"

export default function UserInvite() {
  return (
    <PlaceholderPage
      title="邀请与返利"
      description="管理邀请返利配置"
      icon={<Receipt className="h-6 w-6" />}
    />
  )
}
