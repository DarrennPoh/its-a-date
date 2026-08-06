'use client'

import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'


export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  if (pathname === '/login' || pathname === '/signup') {
    return null
  }


  function handleLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('username')
    router.push('/login')
  }

  return (
  <nav className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
    <div className="flex gap-6">
      <Link href="/dashboard" className="text-gray-700 hover:text-blue-500 font-medium">
        Home
      </Link>
      <Link href="/groups" className="text-gray-700 hover:text-blue-500 font-medium">
        Groups
      </Link>
    </div>

    <button
      onClick={handleLogout}
      className="text-red-500 hover:text-red-700 font-medium"
    >
      Logout
    </button>
  </nav>
)
}