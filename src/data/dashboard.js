export const managerNav = [
  { id: 'overview', label: 'Overview', path: '/manager', icon: 'LayoutDashboard' },
  { id: 'orders', label: 'Orders', path: '/manager/orders', icon: 'UtensilsCrossed' },
  { id: 'reservations', label: 'Reservations', path: '/manager/reservations', icon: 'CalendarDays' },
  { id: 'menu', label: 'Menu', path: '/manager/menu', icon: 'BookOpen' },
  { id: 'tables', label: 'Tables', path: '/manager/tables', icon: 'Armchair' },
  { id: 'staff', label: 'Staff', path: '/manager/staff', icon: 'Users' },
  { id: 'settings', label: 'Settings', path: '/manager/settings', icon: 'Settings' },
]

export const waiterNav = [
  { id: 'take', label: 'Take order', path: '/waiter', icon: 'NotebookPen' },
  { id: 'mine', label: 'My orders', path: '/waiter/orders', icon: 'ClipboardList' },
  { id: 'floor', label: 'Floor', path: '/waiter/floor', icon: 'Armchair' },
]

export const kpis = [
  {
    id: 'revenue',
    label: 'Today’s revenue',
    value: '$8,420',
    delta: '+12.4%',
    positive: true,
    hint: 'vs yesterday',
  },
  {
    id: 'covers',
    label: 'Covers seated',
    value: '146',
    delta: '+8',
    positive: true,
    hint: 'vs yesterday',
  },
  {
    id: 'orders',
    label: 'Open orders',
    value: '18',
    delta: '3 late',
    positive: false,
    hint: 'kitchen queue',
  },
  {
    id: 'reservations',
    label: 'Reservations',
    value: '32',
    delta: '6 pending',
    positive: true,
    hint: 'tonight',
  },
]

export const revenueSeries = [
  { day: 'Mon', revenue: 5200, covers: 98 },
  { day: 'Tue', revenue: 6100, covers: 112 },
  { day: 'Wed', revenue: 5800, covers: 105 },
  { day: 'Thu', revenue: 7200, covers: 128 },
  { day: 'Fri', revenue: 9100, covers: 162 },
  { day: 'Sat', revenue: 10400, covers: 188 },
  { day: 'Sun', revenue: 8420, covers: 146 },
]

export const categoryMix = [
  { name: 'Mains', value: 38, color: '#245A4F' },
  { name: 'Seafood', value: 22, color: '#4F8A7A' },
  { name: 'Starters', value: 16, color: '#8FA89E' },
  { name: 'Desserts', value: 12, color: '#C4A484' },
  { name: 'Drinks', value: 12, color: '#5C6B73' },
]

export const hourlyCovers = [
  { hour: '17', covers: 8 },
  { hour: '18', covers: 22 },
  { hour: '19', covers: 41 },
  { hour: '20', covers: 38 },
  { hour: '21', covers: 24 },
  { hour: '22', covers: 13 },
]

export const liveOrders = [
  {
    id: '1042',
    table: '4',
    items: 3,
    total: 186,
    status: 'preparing',
    waiter: 'Amelia',
    time: '12 min',
  },
  {
    id: '1043',
    table: '8',
    items: 2,
    total: 94,
    status: 'new',
    waiter: 'Jonas',
    time: '2 min',
  },
  {
    id: '1044',
    table: '12',
    items: 5,
    total: 248,
    status: 'ready',
    waiter: 'Amelia',
    time: '24 min',
  },
  {
    id: '1045',
    table: '2',
    items: 4,
    total: 172,
    status: 'preparing',
    waiter: 'Sofia',
    time: '9 min',
  },
  {
    id: '1046',
    table: '7',
    items: 1,
    total: 68,
    status: 'late',
    waiter: 'Jonas',
    time: '31 min',
  },
  {
    id: '1047',
    table: '11',
    items: 6,
    total: 312,
    status: 'served',
    waiter: 'Sofia',
    time: '48 min',
  },
]

export const reservations = [
  {
    id: 'r1',
    name: 'Clara Dupont',
    guests: 2,
    time: '19:00',
    date: 'Tonight',
    status: 'confirmed',
    notes: 'Window table',
  },
  {
    id: 'r2',
    name: 'Marcus Chen',
    guests: 4,
    time: '19:30',
    date: 'Tonight',
    status: 'pending',
    notes: 'Anniversary',
  },
  {
    id: 'r3',
    name: 'Elena Rossi',
    guests: 6,
    time: '20:00',
    date: 'Tonight',
    status: 'confirmed',
    notes: '',
  },
  {
    id: 'r4',
    name: 'James Okonkwo',
    guests: 2,
    time: '20:30',
    date: 'Tonight',
    status: 'seated',
    notes: 'Allergies: shellfish',
  },
  {
    id: 'r5',
    name: 'Priya Shah',
    guests: 3,
    time: '21:00',
    date: 'Tonight',
    status: 'pending',
    notes: '',
  },
  {
    id: 'r6',
    name: 'Thomas Berg',
    guests: 8,
    time: '19:00',
    date: 'Tomorrow',
    status: 'confirmed',
    notes: 'Private alcove',
  },
]

export const menuAdminItems = [
  { id: 'ribeye', name: 'Charred Ribeye', category: 'Land', price: 68, available: true, sold: 24 },
  { id: 'sable', name: 'Sable & Citrus', category: 'Sea', price: 74, available: true, sold: 18 },
  { id: 'cocoa', name: 'Velvet Cocoa', category: 'Sweet', price: 28, available: true, sold: 31 },
  { id: 'foie', name: 'Torchon of foie', category: 'Beginnings', price: 36, available: true, sold: 12 },
  { id: 'lobster', name: 'Butter-poached lobster', category: 'Sea', price: 82, available: false, sold: 0 },
  { id: 'duck', name: 'Duck breast', category: 'Land', price: 58, available: true, sold: 15 },
  { id: 'risotto', name: 'Saffron risotto', category: 'Garden', price: 34, available: true, sold: 21 },
  { id: 'negroni', name: 'Noir Negroni', category: 'Drinks', price: 18, available: true, sold: 40 },
]

export const tables = [
  { id: '1', seats: 2, status: 'free' },
  { id: '2', seats: 2, status: 'occupied' },
  { id: '3', seats: 4, status: 'reserved' },
  { id: '4', seats: 4, status: 'occupied' },
  { id: '5', seats: 4, status: 'free' },
  { id: '6', seats: 6, status: 'reserved' },
  { id: '7', seats: 2, status: 'occupied' },
  { id: '8', seats: 4, status: 'occupied' },
  { id: '9', seats: 8, status: 'free' },
  { id: '10', seats: 2, status: 'free' },
  { id: '11', seats: 4, status: 'occupied' },
  { id: '12', seats: 6, status: 'occupied' },
]

export const staff = [
  { id: 's1', name: 'Amelia Laurent', role: 'Waiter', shift: 'Evening', status: 'on floor' },
  { id: 's2', name: 'Jonas Meyer', role: 'Waiter', shift: 'Evening', status: 'on floor' },
  { id: 's3', name: 'Sofia Almeida', role: 'Waiter', shift: 'Evening', status: 'break' },
  { id: 's4', name: 'Elise Moreau', role: 'Head chef', shift: 'Evening', status: 'kitchen' },
  { id: 's5', name: 'Noah Park', role: 'Sous chef', shift: 'Evening', status: 'kitchen' },
  { id: 's6', name: 'Camille Roux', role: 'Host', shift: 'Evening', status: 'door' },
]

export const orderStatusStyles = {
  new: { label: 'New', className: 'dash-badge-sky' },
  preparing: { label: 'Preparing', className: 'dash-badge-amber' },
  ready: { label: 'Ready', className: 'dash-badge-emerald' },
  late: { label: 'Late', className: 'dash-badge-rose' },
  served: { label: 'Served', className: 'dash-badge-neutral' },
  cancelled: { label: 'Cancelled', className: 'dash-badge-rose' },
}

export const orderStatusFlow = ['new', 'preparing', 'ready', 'served']

export const staffRoles = ['Waiter', 'Host', 'Head chef', 'Sous chef', 'Line cook', 'Bartender', 'Manager']
export const staffShifts = ['Lunch', 'Evening', 'Double', 'Off']
export const staffStatuses = ['on floor', 'kitchen', 'door', 'bar', 'break', 'off']

export const reservationStatusStyles = {
  confirmed: { label: 'Confirmed', className: 'dash-badge-emerald' },
  pending: { label: 'Pending', className: 'dash-badge-amber' },
  seated: { label: 'Seated', className: 'dash-badge-gold' },
  cancelled: { label: 'Cancelled', className: 'dash-badge-rose' },
}

export const tableStatusStyles = {
  free: { label: 'Free', className: 'dash-badge-emerald border border-current/20' },
  occupied: { label: 'Occupied', className: 'dash-badge-gold border border-current/20' },
  reserved: { label: 'Reserved', className: 'dash-badge-sky border border-current/20' },
}
