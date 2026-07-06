import { Link } from 'react-router-dom'
import { Hospital, LogIn } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function PublicHeader() {
  return (
    <header className="sticky top-0 z-20 border-b border-blue-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4">
        <Link to="/" className="flex items-center gap-3 text-slate-900">
          <span className="rounded-xl bg-blue-600 p-2 text-white">
            <Hospital className="h-6 w-6" />
          </span>
          <span>
            <span className="block text-lg font-bold leading-none">New Hospital</span>
            <span className="text-xs text-slate-500">Care that connects</span>
          </span>
        </Link>
        <Button variant="outline" asChild className="border-blue-200 text-blue-700 hover:bg-blue-50">
          <Link to="/login"><LogIn /> Staff login</Link>
        </Button>
      </div>
    </header>
  )
}
