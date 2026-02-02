import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import UserLayout from "@/components/layout/UserLayout"
import Dashboard from "@/pages/Dashboard"
import NodeList from "@/pages/NodeList"
import Shop from "@/pages/Shop"
import TopUp from "@/pages/TopUp"
import Invite from "@/pages/Invite"
import Settings from "@/pages/Settings"
import Tickets from "@/pages/Tickets"
import Purchases from "@/pages/Purchases"
import Traffic from "@/pages/Traffic"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 默认重定向到仪表盘 */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* 用户中心路由 */}
        <Route path="/dashboard" element={<UserLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="nodes" element={<NodeList />} />
          <Route path="shop" element={<Shop />} />
          <Route path="topup" element={<TopUp />} />
          <Route path="invite" element={<Invite />} />
          <Route path="settings" element={<Settings />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="purchases" element={<Purchases />} />
          <Route path="traffic" element={<Traffic />} />
          {/* 其他路由可以后续添加 */}
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>

      {/* Toast 通知 */}
      <Toaster
        position="top-right"
        richColors
        closeButton
        duration={3000}
        toastOptions={{
          classNames: {
            toast: "font-sans",
            title: "text-gray-900",
            description: "text-gray-600",
          },
        }}
      />
    </BrowserRouter>
  )
}

export default App
