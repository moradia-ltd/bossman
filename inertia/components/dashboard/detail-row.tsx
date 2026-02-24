import { Label } from '../ui/label'

function DetailRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className='grid gap-1'>
      <Label className='text-muted-foreground text-xs font-medium'>{label}</Label>
      <div className='text-sm font-medium'>{value ?? '—'}</div>
    </div>
  )
}

export default DetailRow
