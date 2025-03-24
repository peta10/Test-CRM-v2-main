"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Users, Calendar, FileText, DollarSign, BarChart, Home } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import { useState, useEffect } from "react"

export default function Sidebar() {
  const pathname = usePathname()
  const [currentTime, setCurrentTime] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: Home,
    },
    {
      name: "Customer Management",
      href: "/customers",
      icon: Users,
    },
    {
      name: "Reminders & Notes",
      href: "/reminders",
      icon: Calendar,
    },
    {
      name: "Contracts & Sales",
      href: "/contracts",
      icon: FileText,
    },
    {
      name: "Expenses",
      href: "/expenses",
      icon: DollarSign,
    },
    {
      name: "Statistics & Reports",
      href: "/statistics",
      icon: BarChart,
    },
  ]

  return (
    <div className="flex flex-col h-screen w-64 bg-primary text-primary-foreground border-r">
      <div className="p-4 border-b border-primary-foreground/20">
        <h1 className="text-xl font-bold">Customer Management System</h1>
        <div className="mt-2 text-sm">
          <p>{formatDate(currentTime)}</p> 
        </div>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 transition-colors",
                  pathname === item.href ? "bg-primary-foreground text-primary" : "hover:bg-primary-foreground/10",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-primary-foreground/20">
        <p className="text-sm text-center">Version 1.0.0</p>
      </div>
    </div>
  )
}