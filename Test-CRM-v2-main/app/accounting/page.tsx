"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { FileText, TrendingUp, DollarSign, PieChart } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

interface Transaction {
  id: string
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  category: string
  status: 'pending' | 'completed'
}

interface AccountsReceivable {
  id: string
  customer_id: string
  amount: number
  due_date: string
  status: 'pending' | 'paid' | 'overdue'
}

export default function AccountingPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [accountsReceivable, setAccountsReceivable] = useState<AccountsReceivable[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAccountingData()
  }, [])

  async function loadAccountingData() {
    try {
      // Load transactions
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })

      if (transactionsError) throw transactionsError
      setTransactions(transactionsData || [])

      // Load accounts receivable
      const { data: arData, error: arError } = await supabase
        .from('accounts_receivable')
        .select('*')
        .order('due_date', { ascending: true })

      if (arError) throw arError
      setAccountsReceivable(arData || [])
    } catch (error) {
      console.error('Error loading accounting data:', error)
    } finally {
      setLoading(false)
    }
  }

  const calculateCashFlow = () => {
    const income = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
    
    const expenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    return income - expenses
  }

  const calculateRevenue = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)
  }

  const totalReceivables = accountsReceivable
    .filter(ar => ar.status === 'pending')
    .reduce((sum, ar) => sum + ar.amount, 0)

  const generateReport = () => {
    const report = {
      date: new Date().toISOString(),
      cashFlow: calculateCashFlow(),
      revenue: calculateRevenue(),
      receivables: totalReceivables,
      transactions: transactions,
      accountsReceivable: accountsReceivable
    }

    // You could implement report generation logic here
    console.log('Generating report:', report)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Accounting</h1>
          <p className="text-muted-foreground">Manage your financial data</p>
        </div>
        <Button onClick={generateReport}>
          <FileText className="mr-2 h-4 w-4" />
          Generate Report
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cash Flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateCashFlow().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Net cash movement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${calculateRevenue().toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total income</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accounts Receivable</CardTitle>
            <PieChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalReceivables.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Outstanding payments</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="transactions">
        <TabsList>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="receivables">Accounts Receivable</TabsTrigger>
        </TabsList>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Overview of your latest financial transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.map(transaction => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-4 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{transaction.description}</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`font-medium ${transaction.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                    {transaction.type === 'income' ? '+' : '-'}${transaction.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="receivables" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Accounts Receivable</CardTitle>
              <CardDescription>Track outstanding payments</CardDescription>
            </CardHeader>
            <CardContent>
              {accountsReceivable.map(ar => (
                <div
                  key={ar.id}
                  className="flex items-center justify-between py-4 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">Customer ID: {ar.customer_id}</p>
                    <p className="text-sm text-muted-foreground">
                      Due: {new Date(ar.due_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={`font-medium ${ar.status === 'overdue' ? 'text-red-600' : 'text-blue-600'}`}>
                    ${ar.amount.toLocaleString()}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 