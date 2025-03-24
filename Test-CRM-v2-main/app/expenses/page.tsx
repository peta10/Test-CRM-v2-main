"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash, DollarSign, Calendar, Tag } from "lucide-react"
import { saveToLocalStorage, getFromLocalStorage } from "@/lib/utils"

interface Expense {
  id: string
  title: string
  category: string
  description: string
  amount: number
  date: string
  createdAt: string
}

export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddingExpense, setIsAddingExpense] = useState(false)
  const [isEditingExpense, setIsEditingExpense] = useState(false)
  const [currentExpense, setCurrentExpense] = useState<Expense | null>(null)

  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    amount: "",
    date: "",
  })

  useEffect(() => {
    const savedExpenses = getFromLocalStorage("expenses") || []
    setExpenses(savedExpenses)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddExpense = () => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      title: formData.title,
      category: formData.category,
      description: formData.description,
      amount: Number(formData.amount),
      date: formData.date,
      createdAt: new Date().toISOString(),
    }

    const updatedExpenses = [...expenses, newExpense]
    setExpenses(updatedExpenses)
    saveToLocalStorage("expenses", updatedExpenses)

    setFormData({
      title: "",
      category: "",
      description: "",
      amount: "",
      date: "",
    })

    setIsAddingExpense(false)
  }

  const handleEditExpense = () => {
    if (!currentExpense) return

    const updatedExpenses = expenses.map((expense) =>
      expense.id === currentExpense.id
        ? {
            ...expense,
            title: formData.title,
            category: formData.category,
            description: formData.description,
            amount: Number(formData.amount),
            date: formData.date,
          }
        : expense,
    )

    setExpenses(updatedExpenses)
    saveToLocalStorage("expenses", updatedExpenses)

    setFormData({
      title: "",
      category: "",
      description: "",
      amount: "",
      date: "",
    })

    setIsEditingExpense(false)
    setCurrentExpense(null)
  }

  const handleDeleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id)
    setExpenses(updatedExpenses)
    saveToLocalStorage("expenses", updatedExpenses)
  }

  const startEditExpense = (expense: Expense) => {
    setCurrentExpense(expense)
    setFormData({
      title: expense.title,
      category: expense.category,
      description: expense.description,
      amount: expense.amount.toString(),
      date: expense.date,
    })
    setIsEditingExpense(true)
  }

  const filteredExpenses = expenses.filter(
    (expense) =>
      expense.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Sort expenses by date (newest first)
  const sortedExpenses = [...filteredExpenses].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })

  // Calculate total amount
  const totalAmount = sortedExpenses.reduce((sum, expense) => sum + expense.amount, 0)

  // Get unique categories
  const categories = Array.from(new Set(expenses.map((expense) => expense.category)))

  // Calculate expenses by category
  const expensesByCategory = categories
    .map((category) => {
      const amount = expenses
        .filter((expense) => expense.category === category)
        .reduce((sum, expense) => sum + expense.amount, 0)

      return { category, amount }
    })
    .sort((a, b) => b.amount - a.amount)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Expenses</h1>
          <p className="text-muted-foreground">Manage your expenses</p>
        </div>
        <Button onClick={() => setIsAddingExpense(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Expense
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search expenses"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Expenses Summary</CardTitle>
          <CardDescription>Overall statistics of expenses</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground">Total Expenses Count</p>
            <p className="text-3xl font-bold">{expenses.length}</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-muted rounded-lg">
            <p className="text-muted-foreground">Total Expenses Amount</p>
            <p className="text-3xl font-bold">${totalAmount.toLocaleString()}</p>
          </div>
        </CardContent>
      </Card>

      {expensesByCategory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Expenses by Category</CardTitle>
            <CardDescription>Total expenses in each category</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expensesByCategory.map((item) => (
                <div key={item.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4" />
                    <span>{item.category}</span>
                  </div>
                  <span className="font-bold">${item.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {isAddingExpense && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Expense</CardTitle>
            <CardDescription>Enter new expense information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="title">Expense Title</label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter expense title"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="category">Category</label>
              <Input
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="Enter expense category"
                list="categories"
              />
              <datalist id="categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <label htmlFor="description">Description</label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter expense description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="amount">Amount ($)</label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter expense amount"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="date">Date</label>
                <Input id="date" name="date" type="date" value={formData.date} onChange={handleInputChange} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsAddingExpense(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddExpense}>Save</Button>
          </CardFooter>
        </Card>
      )}

      {isEditingExpense && currentExpense && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Expense</CardTitle>
            <CardDescription>Update expense information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-title">Expense Title</label>
              <Input id="edit-title" name="title" value={formData.title} onChange={handleInputChange} />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-category">Category</label>
              <Input
                id="edit-category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                list="edit-categories"
              />
              <datalist id="edit-categories">
                {categories.map((category) => (
                  <option key={category} value={category} />
                ))}
              </datalist>
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-description">Description</label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-amount">Amount ($)</label>
                <Input
                  id="edit-amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-date">Date</label>
                <Input id="edit-date" name="date" type="date" value={formData.date} onChange={handleInputChange} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setIsEditingExpense(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditExpense}>Save Changes</Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedExpenses.length > 0 ? (
          sortedExpenses.map((expense) => (
            <Card key={expense.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  {expense.title}
                </CardTitle>
                <CardDescription className="flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  {expense.category}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {expense.date}
                </div>
                <div className="flex items-center gap-2 mb-2 text-sm font-bold">
                  <DollarSign className="h-4 w-4" />${expense.amount.toLocaleString()}
                </div>
                <p className="text-sm">{expense.description}</p>
              </CardContent>
              <CardFooter className="flex justify-end gap-2">
                <Button variant="outline" size="icon" onClick={() => startEditExpense(expense)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="icon" onClick={() => handleDeleteExpense(expense.id)}>
                  <Trash className="h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          ))
        ) : (
          <p className="col-span-full text-center py-10 text-muted-foreground">No expenses found. Add a new expense.</p>
        )}
      </div>
    </div>
  )
}

