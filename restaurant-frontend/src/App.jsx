import { Routes, Route } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import MenuManagement from './pages/MenuManagement'
import OrderPage from './pages/OrderPage'
import OrdersList from './pages/OrdersList'
import KitchenBoard from './pages/KitchenBoard'

export default function App() {
  return (
    <div className="app">
      <Sidebar />
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/menu" element={<MenuManagement />} />
          <Route path="/order" element={<OrderPage />} />
          <Route path="/orders" element={<OrdersList />} />
          <Route path="/kitchen" element={<KitchenBoard />} />
        </Routes>
      </main>
    </div>
  )
}
