import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "sonner"
import UserLayout from "@/components/layout/UserLayout"
import AdminLayout from "@/components/layout/AdminLayout"
import Dashboard from "@/pages/Dashboard"
import AdminDashboard from "@/pages/admin/Dashboard"
import AdminNodeList from "@/pages/admin/NodeList"
import AdminUserList from "@/pages/admin/UserList"
import AdminTicketList from "@/pages/admin/TicketList"
import AdminOrderList from "@/pages/admin/OrderList"
import AdminSettings from "@/pages/admin/Settings"
import AdminAnnouncements from "@/pages/admin/Announcements"
import AdminCommands from "@/pages/admin/Commands"
import NodeAdjustment from "@/pages/admin/nodes/Adjustment"
import NodeTraffic from "@/pages/admin/nodes/Traffic"
import BannedIPs from "@/pages/admin/nodes/Banned"
import UnbannedIPs from "@/pages/admin/nodes/Unbanned"
import UserRelay from "@/pages/admin/users/Relay"
import UserInvite from "@/pages/admin/users/Invite"
import UserLoginHistory from "@/pages/admin/users/LoginHistory"
import UserOnlineIP from "@/pages/admin/users/OnlineIP"
import AuditRules from "@/pages/admin/audit/Rules"
import AuditLogs from "@/pages/admin/audit/Logs"
import TransactionDeposit from "@/pages/admin/transactions/Deposit"
import TransactionProducts from "@/pages/admin/transactions/Products"
import TransactionCoupons from "@/pages/admin/transactions/Coupons"
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

        {/* 管理员后台路由 */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="announcements" element={<AdminAnnouncements />} />
          <Route path="tickets" element={<AdminTicketList />} />
          <Route path="commands" element={<AdminCommands />} />
          <Route path="nodes" element={<AdminNodeList />} />
          <Route path="nodes/adjustment" element={<NodeAdjustment />} />
          <Route path="nodes/traffic" element={<NodeTraffic />} />
          <Route path="nodes/banned" element={<BannedIPs />} />
          <Route path="nodes/unbanned" element={<UnbannedIPs />} />
          <Route path="users" element={<AdminUserList />} />
          <Route path="users/relay" element={<UserRelay />} />
          <Route path="users/invite" element={<UserInvite />} />
          <Route path="users/login-history" element={<UserLoginHistory />} />
          <Route path="users/online-ip" element={<UserOnlineIP />} />
          <Route path="audit/rules" element={<AuditRules />} />
          <Route path="audit/logs" element={<AuditLogs />} />
          <Route path="transactions/deposit" element={<TransactionDeposit />} />
          <Route path="transactions/products" element={<TransactionProducts />} />
          <Route path="transactions/coupons" element={<TransactionCoupons />} />
          <Route path="orders" element={<AdminOrderList />} />
          <Route path="settings" element={<AdminSettings />} />
          {/* 管理员其他路由可以后续添加 */}
          <Route path="*" element={<AdminDashboard />} />
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
