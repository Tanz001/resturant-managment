import { useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Mail, Pencil, Phone, Plus, Search, Trash2, UserMinus, UserCheck, Coffee } from 'lucide-react'
import { staffRoles, staffShifts, staffStatuses } from '../../data/dashboard'
import { useRestaurant, useDerived } from '../../store/RestaurantProvider'
import {
  Avatar,
  Button,
  Dropdown,
  EmptyState,
  Field,
  ImagePicker,
  Input,
  Modal,
  NativeSelect,
  SelectMenu,
  useToast,
} from '../../components/dashboard/ui'

const blank = {
  name: '',
  role: 'Waiter',
  shift: 'Evening',
  status: 'on floor',
  email: '',
  phone: '',
  avatar: '',
  active: true,
}

const statusBadge = {
  'on floor': 'dash-badge-emerald',
  kitchen: 'dash-badge-amber',
  door: 'dash-badge-sky',
  bar: 'dash-badge-sky',
  break: 'dash-badge-neutral',
  off: 'dash-badge-neutral',
}

export default function StaffPage() {
  const { state, actions } = useRestaurant()
  const { waiterStats } = useDerived()
  const { toast, ToastView } = useToast()

  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(blank)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const people = useMemo(() => {
    const q = query.trim().toLowerCase()
    return state.staff.filter(
      (s) =>
        (roleFilter === 'all' || s.role === roleFilter) &&
        (!q || s.name.toLowerCase().includes(q) || s.role.toLowerCase().includes(q)),
    )
  }, [state.staff, query, roleFilter])

  const openNew = () => {
    setForm(blank)
    setEditing('new')
  }
  const openEdit = (s) => {
    setForm({ ...blank, ...s })
    setEditing(s)
  }
  const close = () => setEditing(null)

  const save = () => {
    if (!form.name.trim()) {
      toast('Add a name')
      return
    }
    const payload = { ...form, name: form.name.trim() }
    if (editing === 'new') {
      actions.addStaff(payload)
      toast(`${payload.name} added to the team`, 'success')
    } else {
      actions.updateStaff(editing.id, payload)
      toast('Profile updated', 'success')
    }
    close()
  }

  const onDuty = state.staff.filter((s) => s.active && s.status !== 'off').length
  const roles = ['all', ...new Set(state.staff.map((s) => s.role))]

  return (
    <div className="space-y-5">
      <ToastView />

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <p className="text-sm dash-muted">
          {state.staff.length} team members · <span className="dash-accent-text">{onDuty} on duty tonight</span>
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 dash-subtle" strokeWidth={1.75} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search team…"
              className="dash-input h-10 w-52 rounded-lg border-0 pr-3 pl-9 text-sm"
            />
          </label>
          <Button onClick={openNew}>
            <Plus className="size-4" strokeWidth={2} /> Add staff
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {roles.map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRoleFilter(r)}
            className={`rounded-full px-3 py-1.5 text-[11px] tracking-wide capitalize ${
              roleFilter === r ? 'dash-chip-active' : 'dash-chip hover:opacity-80'
            }`}
          >
            {r === 'all' ? 'Everyone' : r}
          </button>
        ))}
      </div>

      {people.length === 0 ? (
        <EmptyState title="No one matches" description="Try a different search or add a new team member." action={<Button onClick={openNew}>Add staff</Button>} />
      ) : (
        <motion.div layout className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          <AnimatePresence initial={false}>
            {people.map((person) => {
              const stats = waiterStats[person.id]
              return (
                <motion.article
                  key={person.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  className={`dash-card p-4 md:p-5 ${person.active ? '' : 'opacity-60'}`}
                >
                  <div className="flex items-start gap-3">
                    <Avatar src={person.avatar} name={person.name} size="lg" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <h3 className="truncate font-medium">{person.name}</h3>
                          <p className="text-xs dash-muted">
                            {person.role} · {person.shift}
                          </p>
                        </div>
                        <Dropdown
                          items={[
                            { label: 'Edit profile', icon: Pencil, onClick: () => openEdit(person) },
                            {
                              label: person.status === 'break' ? 'Back from break' : 'Send on break',
                              icon: Coffee,
                              onClick: () =>
                                actions.updateStaff(person.id, {
                                  status: person.status === 'break' ? defaultStatus(person.role) : 'break',
                                }),
                            },
                            {
                              label: person.active ? 'Deactivate' : 'Reactivate',
                              icon: person.active ? UserMinus : UserCheck,
                              onClick: () => actions.updateStaff(person.id, { active: !person.active, status: person.active ? 'off' : defaultStatus(person.role) }),
                            },
                            'divider',
                            { label: 'Remove from team', icon: Trash2, danger: true, onClick: () => setConfirmDelete(person) },
                          ]}
                        />
                      </div>
                      <div className="mt-3">
                        <SelectMenu
                          size="sm"
                          value={person.status}
                          onChange={(status) => actions.updateStaff(person.id, { status })}
                          options={staffStatuses.map((s) => ({
                            value: s,
                            label: s.charAt(0).toUpperCase() + s.slice(1),
                            badge: statusBadge[s],
                          }))}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-1 text-xs dash-muted">
                    {person.email ? (
                      <p className="flex items-center gap-2 truncate">
                        <Mail className="size-3.5 shrink-0" strokeWidth={1.75} /> {person.email}
                      </p>
                    ) : null}
                    {person.phone ? (
                      <p className="flex items-center gap-2">
                        <Phone className="size-3.5 shrink-0" strokeWidth={1.75} /> {person.phone}
                      </p>
                    ) : null}
                  </div>

                  {person.role === 'Waiter' ? (
                    <div className="mt-4 grid grid-cols-2 gap-2 border-t pt-3 text-xs" style={{ borderColor: 'var(--dash-border)' }}>
                      <div>
                        <p className="dash-subtle">Orders today</p>
                        <p className="mt-0.5 text-base font-medium tabular-nums">{stats?.orders ?? 0}</p>
                      </div>
                      <div>
                        <p className="dash-subtle">Sales today</p>
                        <p className="mt-0.5 text-base font-medium tabular-nums">${(stats?.revenue ?? 0).toLocaleString()}</p>
                      </div>
                    </div>
                  ) : null}
                </motion.article>
              )
            })}
          </AnimatePresence>
        </motion.div>
      )}

      <Modal
        open={editing !== null}
        onClose={close}
        title={editing === 'new' ? 'Add team member' : 'Edit profile'}
        description="Waiters appear in the waiter app and on order tickets."
        size="lg"
        footer={
          <>
            <Button variant="ghost" onClick={close}>
              Cancel
            </Button>
            <Button onClick={save}>{editing === 'new' ? 'Add to team' : 'Save changes'}</Button>
          </>
        }
      >
        <div className="space-y-5">
          <ImagePicker value={form.avatar} onChange={(avatar) => setForm((f) => ({ ...f, avatar }))} shape="rounded-full" hint="Square photos look best" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Full name">
              <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Amelia Laurent" />
            </Field>
            <Field label="Role">
              <NativeSelect value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value, status: defaultStatus(e.target.value) }))}>
                {staffRoles.map((r) => (
                  <option key={r}>{r}</option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Shift">
              <NativeSelect value={form.shift} onChange={(e) => setForm((f) => ({ ...f, shift: e.target.value }))}>
                {staffShifts.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Status">
              <NativeSelect value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}>
                {staffStatuses.map((s) => (
                  <option key={s} value={s}>
                    {s.charAt(0).toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </NativeSelect>
            </Field>
            <Field label="Email">
              <Input type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="name@maisonnoir.example" />
            </Field>
            <Field label="Phone">
              <Input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="+33 6 …" />
            </Field>
          </div>
        </div>
      </Modal>

      <Modal
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        title="Remove team member?"
        description={`${confirmDelete?.name} will be removed. Their past orders stay in reports.`}
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                actions.removeStaff(confirmDelete.id)
                toast('Team member removed')
                setConfirmDelete(null)
              }}
            >
              Remove
            </Button>
          </>
        }
      />
    </div>
  )
}

function defaultStatus(role) {
  if (role === 'Waiter' || role === 'Manager') return 'on floor'
  if (role === 'Host') return 'door'
  if (role === 'Bartender') return 'bar'
  return 'kitchen'
}
