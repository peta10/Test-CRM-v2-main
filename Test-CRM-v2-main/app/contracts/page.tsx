"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash, FileText, Calendar, DollarSign, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { getFromLocalStorage } from "@/lib/utils"
import Link from "next/link"

interface Contract {
  id: string
  customer_id: string
  title: string
  amount: number
  status: string
  description: string
  start_date: string
  end_date: string
  created_at: string
}

interface Customer {
  id: string
  name: string
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingContract, setEditingContract] = useState<Contract | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    customer_id: "",
    title: "",
    amount: "",
    status: "draft",
    description: "",
    start_date: "",
    end_date: "",
  })

  useEffect(() => {
    async function loadData() {
      setLoading(true)
      try {
        // Load contracts
        const { data: contractsData, error: contractsError } = await supabase
          .from('contracts')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (contractsError) {
          console.error("Error loading contracts:", contractsError)
          // Fallback to localStorage
          const storedContracts = getFromLocalStorage("contracts") || []
          setContracts(storedContracts)
        } else if (contractsData) {
          setContracts(contractsData)
        }

        // Load customers
        const { data: customersData, error: customersError } = await supabase
          .from('customers')
          .select('id, name')
        
        if (customersError) {
          console.error("Error loading customers:", customersError)
          // Fallback to localStorage
          const storedCustomers = getFromLocalStorage("customers") || []
          setCustomers(storedCustomers)
        } else if (customersData) {
          setCustomers(customersData)
        }
      } catch (err) {
        console.error("Error loading data:", err)
        // Fallback to localStorage
        const storedContracts = getFromLocalStorage("contracts") || []
        const storedCustomers = getFromLocalStorage("customers") || []
        setContracts(storedContracts)
        setCustomers(storedCustomers)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const newContract = {
        ...formData,
        amount: parseFloat(formData.amount),
        created_at: new Date().toISOString(),
      }

      const { data, error } = await supabase
        .from('contracts')
        .insert([newContract])
        .select()
        .single()

      if (error) {
        console.error("Error creating contract:", error)
        // Fallback to localStorage
        const contracts = getFromLocalStorage("contracts") || []
        const newContractWithId = { ...newContract, id: Date.now().toString() }
        localStorage.setItem("contracts", JSON.stringify([newContractWithId, ...contracts]))
        setContracts((prev) => [newContractWithId, ...prev])
      } else if (data) {
        setContracts((prev) => [data, ...prev])
      }

      setShowAddForm(false)
      setFormData({
        customer_id: "",
        title: "",
        amount: "",
        status: "draft",
        description: "",
        start_date: "",
        end_date: "",
      })
    } catch (err) {
      console.error("Error:", err)
      // Fallback to localStorage
      const contracts = getFromLocalStorage("contracts") || []
      const newContractWithId = { ...newContract, id: Date.now().toString() }
      localStorage.setItem("contracts", JSON.stringify([newContractWithId, ...contracts]))
      setContracts((prev) => [newContractWithId, ...prev])
    }
  }

  const handleUpdateContract = async () => {
    if (!editingContract) return

    try {
      const { data, error } = await supabase
        .from('contracts')
        .update({
          ...formData,
          amount: parseFloat(formData.amount)
        })
        .eq('id', editingContract.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating contract:", error)
        // Fallback to localStorage
        const contracts = getFromLocalStorage("contracts") || []
        const updatedContracts = contracts.map((c: Contract) =>
          c.id === editingContract.id ? { ...c, ...formData, amount: parseFloat(formData.amount) } : c
        )
        localStorage.setItem("contracts", JSON.stringify(updatedContracts))
        setContracts(updatedContracts)
      } else if (data) {
        setContracts((prev) =>
          prev.map((c) => (c.id === editingContract.id ? data : c))
        )
      }
    } catch (err) {
      console.error("Error:", err)
      // Fallback to localStorage
      const contracts = getFromLocalStorage("contracts") || []
      const updatedContracts = contracts.map((c: Contract) =>
        c.id === editingContract.id ? { ...c, ...formData, amount: parseFloat(formData.amount) } : c
      )
      localStorage.setItem("contracts", JSON.stringify(updatedContracts))
      setContracts(updatedContracts)
    }

    setEditingContract(null)
    setFormData({
      customer_id: "",
      title: "",
      amount: "",
      status: "draft",
      description: "",
      start_date: "",
      end_date: "",
    })
  }

  const handleDeleteContract = async (id: string) => {
    try {
      const { error } = await supabase
        .from('contracts')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error("Error deleting contract:", error)
        // Fallback to localStorage
        const contracts = getFromLocalStorage("contracts") || []
        const updatedContracts = contracts.filter((c: Contract) => c.id !== id)
        localStorage.setItem("contracts", JSON.stringify(updatedContracts))
        setContracts(updatedContracts)
      } else {
        setContracts((prev) => prev.filter((c) => c.id !== id))
      }
    } catch (err) {
      console.error("Error:", err)
      // Fallback to localStorage
      const contracts = getFromLocalStorage("contracts") || []
      const updatedContracts = contracts.filter((c: Contract) => c.id !== id)
      localStorage.setItem("contracts", JSON.stringify(updatedContracts))
      setContracts(updatedContracts)
    }
  }

  const filteredContracts = contracts.filter((contract) =>
    contract.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    contract.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading contracts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contracts</h1>
          <p className="text-muted-foreground">Manage your contracts and agreements</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Contract
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search contracts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {showAddForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer</label>
                  <select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter contract description..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
                <Button type="submit">Add Contract</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredContracts.map((contract) => (
          <Card key={contract.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold">{contract.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {customers.find((c) => c.id === contract.customer_id)?.name || "Unknown Customer"}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/contracts/${contract.id}`}>
                    <Button variant="ghost" size="icon">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingContract(contract)
                      setFormData({
                        customer_id: contract.customer_id,
                        title: contract.title,
                        amount: contract.amount.toString(),
                        status: contract.status,
                        description: contract.description,
                        start_date: contract.start_date,
                        end_date: contract.end_date,
                      })
                    }}
                  >
                    <FileText className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDeleteContract(contract.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-4">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>${contract.amount.toLocaleString()}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {new Date(contract.start_date).toLocaleDateString()} -{" "}
                    {new Date(contract.end_date).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="capitalize">{contract.status}</span>
                </div>
              </div>

              {contract.description && (
                <p className="mt-4 text-sm text-muted-foreground">{contract.description}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {editingContract && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Contract</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateContract(); }} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer</label>
                  <select
                    name="customer_id"
                    value={formData.customer_id}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="">Select a customer</option>
                    {customers.map((customer) => (
                      <option key={customer.id} value={customer.id}>
                        {customer.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Amount</label>
                  <Input
                    name="amount"
                    type="number"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  >
                    <option value="draft">Draft</option>
                    <option value="pending">Pending</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    name="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    name="end_date"
                    type="date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter contract description..."
                />
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setEditingContract(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

