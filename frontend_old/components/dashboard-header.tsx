import { Bell, Search, Settings, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import Link from 'next/link'

export function DashboardHeader() {
  return (
    <header className="bg-white border-b border-gray-200 py-4 px-6 flex items-center justify-between">
      <div className="flex items-center space-x-2">
        <div className="h-10 w-10 relative">
        <Link href="#">
          <div className="h-10 w-10 relative">
            <Image src="/logo.png" alt="Julius Baer Logo" fill className="object-contain" />
          </div>
        </Link>
        </div>
        <div className="hidden md:block text-xl font-semibold text-gray-800 ml-2"></div>
      </div>

      <div className="flex-1 max-w-md mx-4 hidden md:block">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input type="search" placeholder="Search clients..." className="pl-8 bg-gray-50 border-gray-200" />
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-gray-500">
          <Settings className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="bg-gray-100 rounded-full">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  )
}
