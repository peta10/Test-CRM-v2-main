"use client"

import { useEffect, useState, ChangeEvent, FormEvent } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { FileText, Calendar, DollarSign, User, ArrowLeft } from "lucide-react"
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

interface FormData {
  customer_id: string
  title: string
  amount: string
  status: string
  description: string
  start_date: string
  end_date: string
}

export default function ContractDetailsPage() {
  const params = useParams()
  const [contract, setContract] = useState<Contract | null>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    customer_id: "",
    title: "",
    amount: "",
    status: "draft",
    description: "",
    start_date: "",
    end_date: "",
  })

  useEffect(() => {
    async function loadContractData() {
      setLoading(true)
      try {
        // Load contract details
        const { data: contractData, error: contractError } = await supabase
          .from('contracts')
          .select('*')
          .eq('id', params.id)
          .single()

        if (contractError) {
          console.error("Error loading contract:", contractError)
          // Fallback to localStorage
          const contracts = getFromLocalStorage("contracts") || []
          const contractFromStorage = contracts.find((c: Contract) => c.id === params.id)
          if (contractFromStorage) {
            setContract(contractFromStorage)
            setFormData({
              customer_id: contractFromStorage.customer_id,
              title: contractFromStorage.title,
              amount: contractFromStorage.amount.toString(),
              status: contractFromStorage.status,
              description: contractFromStorage.description,
              start_date: contractFromStorage.start_date,
              end_date: contractFromStorage.end_date,
            })
          }
        } else if (contractData) {
          setContract(contractData)
          setFormData({
            customer_id: contractData.customer_id,
            title: contractData.title,
            amount: contractData.amount.toString(),
            status: contractData.status,
            description: contractData.description,
            start_date: contractData.start_date,
            end_date: contractData.end_date,
          })

          // Load customer details
          const { data: customerData, error: customerError } = await supabase
            .from('customers')
            .select('id, name')
            .eq('id', contractData.customer_id)
            .single()

          if (customerError) {
            console.error("Error loading customer:", customerError)
            // Fallback to localStorage
            const customers = getFromLocalStorage("customers") || []
            const customerFromStorage = customers.find((c: Customer) => c.id === contractData.customer_id)
            if (customerFromStorage) {
              setCustomer(customerFromStorage)
            }
          } else if (customerData) {
            setCustomer(customerData)
          }
        }
      } catch (err) {
        console.error("Error loading contract data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadContractData()
  }, [params.id])

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev: FormData) => ({ ...prev, [name]: value }))
  }

  const handleUpdateContract = async () => {
    if (!contract) return

    try {
      const { data, error } = await supabase
        .from('contracts')
        .update({
          ...formData,
          amount: parseFloat(formData.amount)
        })
        .eq('id', contract.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating contract:", error)
        // Fallback to localStorage
        const contracts = getFromLocalStorage("contracts") || []
        const updatedContracts = contracts.map((c: Contract) =>
          c.id === contract.id ? { ...c, ...formData, amount: parseFloat(formData.amount) } : c
        )
        localStorage.setItem("contracts", JSON.stringify(updatedContracts))
        setContract({ ...contract, ...formData, amount: parseFloat(formData.amount) })
      } else if (data) {
        setContract(data)
      }
    } catch (err) {
      console.error("Error:", err)
      // Fallback to localStorage
      const contracts = getFromLocalStorage("contracts") || []
      const updatedContracts = contracts.map((c: Contract) =>
        c.id === contract.id ? { ...c, ...formData, amount: parseFloat(formData.amount) } : c
      )
      localStorage.setItem("contracts", JSON.stringify(updatedContracts))
      setContract({ ...contract, ...formData, amount: parseFloat(formData.amount) })
    }

    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading contract details...</p>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Contract not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link href="/contracts">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold">{contract.title}</h1>
          <p className="text-muted-foreground">Contract Details</p>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
          {isEditing ? "Cancel" : "Edit"}
        </Button>
        {isEditing && (
          <Button onClick={handleUpdateContract}>Save Changes</Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
          <CardDescription>Basic information about the contract</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Customer</label>
              {isEditing ? (
                <select
                  name="customer_id"
                  value={formData.customer_id}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="">Select a customer</option>
                  {/* Add customer options here */}
                </select>
              ) : (
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{customer?.name || "Unknown Customer"}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              {isEditing ? (
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{contract.title}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Amount</label>
              {isEditing ? (
                <Input
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <span>${contract.amount.toLocaleString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              {isEditing ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleInputChange}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="draft">Draft</option>
                  <option value="pending">Pending</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              ) : (
                <span className="capitalize">{contract.status}</span>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date</label>
              {isEditing ? (
                <Input
                  name="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(contract.start_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">End Date</label>
              {isEditing ? (
                <Input
                  name="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                />
              ) : (
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{new Date(contract.end_date).toLocaleDateString()}</span>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            {isEditing ? (
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
              />
            ) : (
              <p className="text-muted-foreground">{contract.description || "No description"}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 