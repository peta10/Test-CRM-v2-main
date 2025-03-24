"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Phone, MapPin, User, Mail, Calendar, FileText, MessageSquare } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { getFromLocalStorage } from "@/lib/utils"
import Link from "next/link"

interface Customer {
  id: string
  name: string
  mobile: string
  area: string
  notes: string
  created_at: string
}

interface Contract {
  id: string
  customer_id: string
  title: string
  amount: number
  status: string
  created_at: string
}

interface Communication {
  id: string
  customer_id: string
  type: string
  content: string
  created_at: string
}

export default function CustomerDetailsPage() {
  const params = useParams()
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [contracts, setContracts] = useState<Contract[]>([])
  const [communications, setCommunications] = useState<Communication[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    area: "",
    notes: "",
  })

  useEffect(() => {
    async function loadCustomerData() {
      setLoading(true)
      try {
        // Load customer details
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select('*')
          .eq('id', params.id)
          .single()

        if (customerError) {
          console.error("Error loading customer:", customerError)
          // Fallback to localStorage
          const customers = getFromLocalStorage("customers") || []
          const customerFromStorage = customers.find((c: Customer) => c.id === params.id)
          if (customerFromStorage) {
            setCustomer(customerFromStorage)
            setFormData({
              name: customerFromStorage.name,
              mobile: customerFromStorage.mobile,
              area: customerFromStorage.area,
              notes: customerFromStorage.notes,
            })
          }
        } else if (customerData) {
          setCustomer(customerData)
          setFormData({
            name: customerData.name,
            mobile: customerData.mobile,
            area: customerData.area,
            notes: customerData.notes,
          })
        }

        // Load customer's contracts
        const { data: contractsData, error: contractsError } = await supabase
          .from('contracts')
          .select('*')
          .eq('customer_id', params.id)
          .order('created_at', { ascending: false })

        if (contractsError) {
          console.error("Error loading contracts:", contractsError)
          // Fallback to localStorage
          const contracts = getFromLocalStorage("contracts") || []
          const customerContracts = contracts.filter((c: Contract) => c.customer_id === params.id)
          setContracts(customerContracts)
        } else if (contractsData) {
          setContracts(contractsData)
        }

        // Load customer's communications
        const { data: communicationsData, error: communicationsError } = await supabase
          .from('communications')
          .select('*')
          .eq('customer_id', params.id)
          .order('created_at', { ascending: false })

        if (communicationsError) {
          console.error("Error loading communications:", communicationsError)
          // Fallback to localStorage
          const communications = getFromLocalStorage("communications") || []
          const customerCommunications = communications.filter((c: Communication) => c.customer_id === params.id)
          setCommunications(customerCommunications)
        } else if (communicationsData) {
          setCommunications(communicationsData)
        }
      } catch (err) {
        console.error("Error loading customer data:", err)
      } finally {
        setLoading(false)
      }
    }

    loadCustomerData()
  }, [params.id])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleUpdateCustomer = async () => {
    if (!customer) return

    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          mobile: formData.mobile,
          area: formData.area,
          notes: formData.notes,
        })
        .eq('id', customer.id)
        .select()
        .single()

      if (error) {
        console.error("Error updating customer:", error)
        // Fallback to localStorage
        const customers = getFromLocalStorage("customers") || []
        const updatedCustomers = customers.map((c: Customer) =>
          c.id === customer.id ? { ...c, ...formData } : c
        )
        localStorage.setItem("customers", JSON.stringify(updatedCustomers))
        setCustomer({ ...customer, ...formData })
      } else if (data) {
        setCustomer(data)
      }
    } catch (err) {
      console.error("Error:", err)
      // Fallback to localStorage
      const customers = getFromLocalStorage("customers") || []
      const updatedCustomers = customers.map((c: Customer) =>
        c.id === customer.id ? { ...c, ...formData } : c
      )
      localStorage.setItem("customers", JSON.stringify(updatedCustomers))
      setCustomer({ ...customer, ...formData })
    }

    setIsEditing(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Loading customer details...</p>
      </div>
    )
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Customer not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">{customer.name}</h1>
          <p className="text-muted-foreground">Customer Details</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline" onClick={() => setIsEditing(!isEditing)}>
            {isEditing ? "Cancel" : "Edit"}
          </Button>
          {isEditing && (
            <Button onClick={handleUpdateCustomer}>Save Changes</Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="details" className="space-y-4">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="contracts">Contracts</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Basic information about the customer</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Name</label>
                  {isEditing ? (
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Mobile</label>
                  {isEditing ? (
                    <Input
                      name="mobile"
                      value={formData.mobile}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.mobile}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Area</label>
                  {isEditing ? (
                    <Input
                      name="area"
                      value={formData.area}
                      onChange={handleInputChange}
                    />
                  ) : (
                    <div className="flex items-center space-x-2">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{customer.area}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Created At</label>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(customer.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                {isEditing ? (
                  <Textarea
                    name="notes"
                    value={formData.notes}
                    onChange={handleInputChange}
                  />
                ) : (
                  <p className="text-muted-foreground">{customer.notes || "No notes"}</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contracts</CardTitle>
              <CardDescription>List of contracts associated with this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {contracts.length > 0 ? (
                <div className="space-y-4">
                  {contracts.map((contract) => (
                    <div
                      key={contract.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div>
                        <h3 className="font-medium">{contract.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          Amount: ${contract.amount.toLocaleString()}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Status: {contract.status}
                        </p>
                      </div>
                      <Link href={`/contracts/${contract.id}`}>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No contracts found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="communications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Communications</CardTitle>
              <CardDescription>History of communications with this customer</CardDescription>
            </CardHeader>
            <CardContent>
              {communications.length > 0 ? (
                <div className="space-y-4">
                  {communications.map((communication) => (
                    <div
                      key={communication.id}
                      className="flex items-start space-x-4 p-4 border rounded-lg"
                    >
                      <div className="mt-1">
                        {communication.type === "email" ? (
                          <Mail className="h-4 w-4 text-muted-foreground" />
                        ) : communication.type === "sms" ? (
                          <MessageSquare className="h-4 w-4 text-muted-foreground" />
                        ) : (
                          <FileText className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-muted-foreground">
                          {new Date(communication.created_at).toLocaleString()}
                        </p>
                        <p className="mt-1">{communication.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No communications found</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 