"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, FileText, DollarSign, TrendingUp } from "lucide-react"
import { useEffect, useState } from "react"
import { getFromLocalStorage } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

export default function Home() {
  const [stats, setStats] = useState({
    customers: 0,
    reminders: 0,
    contracts: 0,
    income: 0,
    expenses: 0,
  })
  const [loading, setLoading] = useState(true)
  const [todayReminders, setTodayReminders] = useState<any[]>([])
  const [latestContracts, setLatestContracts] = useState<any[]>([])

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Get customers count
        const { count: customersCount, error: customersError } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
        
        // Get reminders count
        const { count: remindersCount, error: remindersError } = await supabase
          .from('reminders')
          .select('*', { count: 'exact', head: true })
          .eq('is_completed', false)
        
        // Get contracts and total income
        const { data: contracts, error: contractsError } = await supabase
          .from('contracts')
          .select('*')
        
        // Get expenses and total amount
        const { data: expenses, error: expensesError } = await supabase
          .from('expenses')
          .select('*')
        
        // Today's reminders
        const today = new Date()
        const formattedToday = today.toISOString().split('T')[0]
        const { data: todayRemindersList, error: todayRemindersError } = await supabase
          .from('reminders')
          .select('*')
          .eq('date', formattedToday)
          .eq('is_completed', false)
          .order('time', { ascending: true })
          .limit(5)
        
        // Latest contracts
        const { data: latestContractsList, error: latestContractsError } = await supabase
          .from('contracts')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5)
        
        // Calculate stats
        const totalIncome = contracts?.reduce((sum, contract) => sum + (parseFloat(contract.amount) || 0), 0) || 0
        const totalExpenses = expenses?.reduce((sum, expense) => sum + (parseFloat(expense.amount) || 0), 0) || 0
        
        if (customersError || remindersError || contractsError || expensesError) {
          console.error("Error loading dashboard data:", 
            customersError || remindersError || contractsError || expensesError)
          
          // Fallback to localStorage
          const customersFromStorage = getFromLocalStorage("customers") || []
          const remindersFromStorage = getFromLocalStorage("reminders") || []
          const contractsFromStorage = getFromLocalStorage("contracts") || []
          const expensesFromStorage = getFromLocalStorage("expenses") || []

          const totalIncomeFromStorage = contractsFromStorage.reduce(
            (sum: number, contract: any) => sum + (contract.amount || 0), 0)
          
          const totalExpensesFromStorage = expensesFromStorage.reduce(
            (sum: number, expense: any) => sum + (expense.amount || 0), 0)

          setStats({
            customers: customersFromStorage.length,
            reminders: remindersFromStorage.length,
            contracts: contractsFromStorage.length,
            income: totalIncomeFromStorage,
            expenses: totalExpensesFromStorage,
          })
        } else {
          setStats({
            customers: customersCount || 0,
            reminders: remindersCount || 0,
            contracts: contracts?.length || 0,
            income: totalIncome,
            expenses: totalExpenses,
          })
        }
        
        // Set today's reminders and latest contracts
        if (!todayRemindersError && todayRemindersList) {
          setTodayReminders(todayRemindersList)
        }
        
        if (!latestContractsError && latestContractsList) {
          setLatestContracts(latestContractsList)
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err)
        // Fallback to localStorage
        const customers = getFromLocalStorage("customers") || []
        const reminders = getFromLocalStorage("reminders") || []
        const contracts = getFromLocalStorage("contracts") || []
        const expenses = getFromLocalStorage("expenses") || []

        // Calculate total income from contracts
        const totalIncome = contracts.reduce((sum: number, contract: any) => sum + (contract.amount || 0), 0)

        // Calculate total expenses
        const totalExpenses = expenses.reduce((sum: number, expense: any) => sum + (expense.amount || 0), 0)

        setStats({
          customers: customers.length,
          reminders: reminders.length,
          contracts: contracts.length,
          income: totalIncome,
          expenses: totalExpenses,
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Summary of your business status</p>
      </div>

      {loading ? (
        <div className="text-center py-10">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Link href="/customers">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Customers</CardTitle>
                  <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.customers}</p>
                  <p className="text-xs text-muted-foreground">Total customers</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/reminders">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Reminders</CardTitle>
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.reminders}</p>
                  <p className="text-xs text-muted-foreground">Active reminders</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contracts">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Contracts</CardTitle>
                  <FileText className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">{stats.contracts}</p>
                  <p className="text-xs text-muted-foreground">Total contracts</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/contracts">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Income</CardTitle>
                  <TrendingUp className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${stats.income.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total income</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/expenses">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Expenses</CardTitle>
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${stats.expenses.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Total expenses</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/statistics">
              <Card className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-lg">Net Profit</CardTitle>
                  <DollarSign className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold">${(stats.income - stats.expenses).toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">Income minus expenses</p>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Today's Reminders</CardTitle>
                <CardDescription>List of your reminders for today</CardDescription>
              </CardHeader>
              <CardContent>
                {todayReminders.length > 0 ? (
                  <div className="space-y-4">
                    {todayReminders.map((reminder) => (
                      <div key={reminder.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{reminder.title}</p>
                          <p className="text-sm text-muted-foreground">{reminder.time}</p>
                        </div>
                        <Link href="/reminders" className="text-sm text-primary hover:underline">View</Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No reminders for today</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Latest Contracts</CardTitle>
                <CardDescription>Recently added contracts</CardDescription>
              </CardHeader>
              <CardContent>
                {latestContracts.length > 0 ? (
                  <div className="space-y-4">
                    {latestContracts.map((contract) => (
                      <div key={contract.id} className="flex items-center justify-between border-b pb-2">
                        <div>
                          <p className="font-medium">{contract.title}</p>
                          <p className="text-sm text-muted-foreground">${parseFloat(contract.amount).toLocaleString()}</p>
                        </div>
                        <Link href="/contracts" className="text-sm text-primary hover:underline">View</Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-muted-foreground">No contracts added yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}