import { useState } from 'react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import { motion } from 'motion/react'
import { tableStatusStyles } from '../../data/dashboard'
import { OPEN_STATUSES, minutesAgo, orderTotal, useDerived, useRestaurant } from '../../store/RestaurantProvider'
import { printOrderReceipt } from '../../components/dashboard/OrderReceipt'
import { OrderDrawer } from '../dashboard/OrdersPage'

export default function FloorPage() {
  const { state, actions } = useRestaurant()
  const { tableStatus } = useDerived()
  const { waiter } = useOutletContext()
  const navigate = useNavigate()
  const [selected, setSelected] = useState(null)
  const now = Date.now()

  const openFor = (id) => state.orders.find((o) => o.table === id && OPEN_STATUSES.includes(o.status))
  const selectedOrder = selected ? state.orders.find((o) => o.id === selected) : null

  return (
    <div className="space-y-5">
      <p className="text-sm dash-muted">Live floor. Tap a free table to start an order, or an occupied one to see its ticket.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6">
        {state.tables.map((t) => {
          const status = tableStatus[t.id]
          const st = tableStatusStyles[status]
          const order = openFor(t.id)
          const mine = order?.waiterId === waiter?.id
          return (
            <motion.button
              key={t.id}
              type="button"
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => (order ? setSelected(order.id) : navigate('/waiter'))}
              className={`dash-card p-4 text-left ${st.className}`}
            >
              <div className="flex items-start justify-between">
                <p className="text-xs opacity-80">Table</p>
                <span className="text-[10px] font-medium uppercase tracking-wide">{st.label}</span>
              </div>
              <p className="mt-1 font-[family-name:var(--font-dash-serif)] text-3xl">{t.id}</p>
              <p className="mt-3 text-xs opacity-80">{t.seats} seats</p>
              {order ? (
                <p className="mt-1 truncate text-xs">
                  {mine ? 'You' : order.waiterName} · {minutesAgo(order.createdAt, now)} min · ${orderTotal(order)}
                </p>
              ) : (
                <p className="mt-1 text-xs opacity-60">Tap to seat</p>
              )}
            </motion.button>
          )
        })}
      </div>

      <OrderDrawer
        order={selectedOrder}
        waiter={selectedOrder ? state.staff.find((s) => s.id === selectedOrder.waiterId) : null}
        restaurant={state.settings}
        onClose={() => setSelected(null)}
        onStatus={(s) => selectedOrder && actions.setOrderStatus(selectedOrder.id, s)}
        onUpdate={(patch) => selectedOrder && actions.updateOrder(selectedOrder.id, patch)}
        onPrint={() =>
          selectedOrder &&
          printOrderReceipt(selectedOrder, {
            restaurant: state.settings,
            waiter: state.staff.find((s) => s.id === selectedOrder.waiterId),
          })
        }
      />
    </div>
  )
}
