import { Separator } from '@/components/ui/separator'

export default function TopBar({ title, children }) {
  return (
    <div className="mb-6">
      <div className="flex h-[60px] items-center justify-between">
        <h1 className="text-xl font-semibold text-foreground">{title}</h1>
        {children && (
          <div className="flex items-center gap-2">{children}</div>
        )}
      </div>
      <Separator />
    </div>
  )
}
