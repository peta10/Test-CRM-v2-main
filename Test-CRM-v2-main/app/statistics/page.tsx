"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getFromLocalStorage } from "@/lib/utils"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts"
import { Users, Calendar, FileText, DollarSign, TrendingUp } from "lucide-react"

interface Customer {
  id: string
  createdAt: string
}

interface Contract {
  id: string
  amount: number
  date: string
}

interface Expense {
  id: string
  amount: number
  category: string
  date: string
}

interface Reminder {
  id: string
  createdAt: string
}

export default function StatisticsPage() {
  const [stats, setStats] = useState({
    customers: 0,
    reminders: 0,
    contracts: 0,
    income: 0,
    expenses: 0,
  })

  const [monthlyData, setMonthlyData] = useState<any[]>([])
  const [expensesByCategory, setExpensesByCategory] = useState<any[]>([])

  useEffect(() => {
    // Load data from localStorage
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

    // Process monthly data
    const monthlyStats = processMonthlyData(contracts, expenses)
    setMonthlyData(monthlyStats)

    // Process expenses by category
    const expensesData = processExpensesByCategory(expenses)
    setExpensesByCategory(expensesData)
  }, [])

  const processMonthlyData = (contracts: Contract[], expenses: Expense[]) => {
    const months: { [key: string]: { name: string; income: number; expenses: number; profit: number } } = {}

    // Initialize months
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    // Get current month and year
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const monthIndex = (currentMonth - i + 12) % 12
      const monthName = monthNames[monthIndex]
      months[`${currentYear}-${monthIndex + 1}`] = {
        name: monthName,
        income: 0,
        expenses: 0,
        profit: 0,
      }
    }

    // Process contracts
    contracts.forEach((contract: Contract) => {
      const date = new Date(contract.date)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`

      if (months[key]) {
        months[key].income += contract.amount
        months[key].profit += contract.amount
      }
    })

    // Process expenses
    expenses.forEach((expense: Expense) => {
      const date = new Date(expense.date)
      const key = `${date.getFullYear()}-${date.getMonth() + 1}`

      if (months[key]) {
        months[key].expenses += expense.amount
        months[key].profit -= expense.amount
      }
    })

    // Convert to array
    return Object.values(months)
  }

  const processExpensesByCategory = (expenses: Expense[]) => {
    const categories: { [key: string]: number } = {}

    expenses.forEach((expense: Expense) => {
      if (!categories[expense.category]) {
        categories[expense.category] = 0
      }
      categories[expense.category] += expense.amount
    })

    return Object.entries(categories).map(([name, value]) => ({ name, value }))
  }

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Statistics & Reports</h1>
        <p className="text-muted-foreground">Statistics and reports of your business</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Customers</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.customers}</p>
            <p className="text-xs text-muted-foreground">Total customers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Contracts</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.contracts}</p>
            <p className="text-xs text-muted-foreground">Total contracts</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Reminders</CardTitle>
            <Calendar className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.reminders}</p>
            <p className="text-xs text-muted-foreground">Active reminders</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Income</CardTitle>
            <TrendingUp className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${stats.income.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Expenses</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${stats.expenses.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total expenses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Net Profit</CardTitle>
            <DollarSign className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">${(stats.income - stats.expenses).toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Income minus expenses</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Monthly Statistics</CardTitle>
          <CardDescription>Income, expenses and profit in the last 6 months</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={monthlyData}
                margin={{
                  top: 20,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="income" name="Income" fill="#4f46e5" />
                <Bar dataKey="expenses" name="Expenses" fill="#ef4444" />
                <Bar dataKey="profit" name="Profit" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Expenses by Category</CardTitle>
          <CardDescription>Distribution of expenses across different categories</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expensesByCategory}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {expensesByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

