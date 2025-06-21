import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface DataStatProps {
  icon?: ReactNode
  value: ReactNode
  label: string
  className?: string
}

export function DataStat({ icon, value, label, className }: DataStatProps) {
  return (
    <div className={cn('rounded-lg bg-linear-border/20 p-4 text-center', className)}>
      {icon && <div className="mb-2 flex justify-center">{icon}</div>}
      <div className="text-2xl font-bold text-linear-text">{value}</div>
      <div className="text-xs text-linear-text-tertiary">{label}</div>
    </div>
  )
}
