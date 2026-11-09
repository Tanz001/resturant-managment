import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { RestaurantProvider } from './store/RestaurantProvider'
import HomePage from './pages/HomePage'
import MenuPage from './pages/MenuPage'
import DashboardLayout from './components/dashboard/DashboardLayout'
import OverviewPage from './pages/dashboard/OverviewPage'
import OrdersPage from './pages/dashboard/OrdersPage'
import ReservationsPage from './pages/dashboard/ReservationsPage'
import MenuManagerPage from './pages/dashboard/MenuManagerPage'
import TablesPage from './pages/dashboard/TablesPage'
import StaffPage from './pages/dashboard/StaffPage'
import SettingsPage from './pages/dashboard/SettingsPage'
import WaiterLayout from './components/waiter/WaiterLayout'
import TakeOrderPage from './pages/waiter/TakeOrderPage'
import MyOrdersPage from './pages/waiter/MyOrdersPage'
import FloorPage from './pages/waiter/FloorPage'
import GuestTablePage from './pages/guest/GuestTablePage'
import GuestOrderConfirmPage from './pages/guest/GuestOrderConfirmPage'

export default function App() {
  return (
    <RestaurantProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/t/:tableId" element={<GuestTablePage />} />
          <Route path="/t/:tableId/order/:orderId" element={<GuestOrderConfirmPage />} />
          <Route path="/manager" element={<DashboardLayout />}>
            <Route index element={<OverviewPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="reservations" element={<ReservationsPage />} />
            <Route path="menu" element={<MenuManagerPage />} />
            <Route path="tables" element={<TablesPage />} />
            <Route path="staff" element={<StaffPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/waiter" element={<WaiterLayout />}>
            <Route index element={<TakeOrderPage />} />
            <Route path="orders" element={<MyOrdersPage />} />
            <Route path="floor" element={<FloorPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </RestaurantProvider>
  )
}
