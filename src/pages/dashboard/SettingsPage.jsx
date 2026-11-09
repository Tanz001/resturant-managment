import { useState } from 'react'
import { useRestaurant } from '../../store/RestaurantProvider'
import { Button, Field, Input, Modal, useToast } from '../../components/dashboard/ui'

export default function SettingsPage() {
  const { state, actions } = useRestaurant()
  const { toast, ToastView } = useToast()
  const [form, setForm] = useState(state.settings)
  const [confirmReset, setConfirmReset] = useState(false)

  const save = (e) => {
    e.preventDefault()
    actions.updateSettings(form)
    toast('Settings saved', 'success')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <ToastView />
      <p className="text-sm dash-muted">Restaurant profile. Data is stored locally in this browser for the demo.</p>
      <form className="dash-card space-y-4 p-5 md:p-6" onSubmit={save}>
        <Field label="Restaurant name">
          <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </Field>
        <Field label="Address">
          <Input value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Service hours">
            <Input value={form.hours} onChange={(e) => setForm((f) => ({ ...f, hours: e.target.value }))} />
          </Field>
          <Field label="Currency">
            <Input value={form.currency} onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} />
          </Field>
        </div>
        <Button type="submit" size="lg" className="mt-2">
          Save changes
        </Button>
      </form>

      <div className="dash-card p-5 md:p-6">
        <h2 className="text-sm font-medium">Demo data</h2>
        <p className="mt-1 text-xs dash-muted">
          Orders, menu changes and staff edits are saved in this browser. Reset to restore the original demo dataset.
        </p>
        <Button variant="danger" className="mt-4" onClick={() => setConfirmReset(true)}>
          Reset demo data
        </Button>
      </div>

      <Modal
        open={confirmReset}
        onClose={() => setConfirmReset(false)}
        title="Reset demo data?"
        description="All local changes will be replaced with the original sample data."
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmReset(false)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                actions.reset()
                setConfirmReset(false)
                toast('Demo data reset')
              }}
            >
              Reset
            </Button>
          </>
        }
      />
    </div>
  )
}
