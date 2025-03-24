"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Search, Edit, Trash, Phone, MapPin, User } from "lucide-react"
import { saveToLocalStorage, getFromLocalStorage, fetchFromSupabase, saveToSupabase, updateInSupabase, deleteFromSupabase } from "@/lib/utils"
import { supabase } from "@/lib/supabaseClient"
import Link from "next/link"

interface Customer {
  id: string
  name: string
  mobile: string
  area: string
  notes: string
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [isEditingCustomer, setIsEditingCustomer] = useState(false)
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)
  const [loading, setLoading] = useState(true)

  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    area: "",
    notes: "",
  })

  useEffect(() => {
    async function loadCustomers() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (error) {
          console.error("Error loading customers:", error)
          // Fallback to localStorage if Supabase fails
          const savedCustomers = getFromLocalStorage("customers") || []
          setCustomers(savedCustomers)
        } else {
          setCustomers(data || [])
        }
      } catch (err) {
        console.error("Error:", err)
        // Fallback to localStorage
        const savedCustomers = getFromLocalStorage("customers") || []
        setCustomers(savedCustomers)
      } finally {
        setLoading(false)
      }
    }

    loadCustomers()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAddCustomer = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .insert([
          {
            name: formData.name,
            mobile: formData.mobile,
            area: formData.area,
            notes: formData.notes
          }
        ])
        .select()
      
      if (error) {
        console.error("Error adding customer:", error)
        // Fallback to localStorage
        const newCustomer = {
          id: Date.now().toString(),
          ...formData,
          created_at: new Date().toISOString(),
        }
        const updatedCustomers = [...customers, newCustomer]
        setCustomers(updatedCustomers)
        saveToLocalStorage("customers", updatedCustomers)
      } else if (data) {
        setCustomers([...data, ...customers])
      }
    } catch (err) {
      console.error("Error:", err)
      // Fallback to localStorage
      const newCustomer = {
        id: Date.now().toString(),
        ...formData,
        created_at: new Date().toISOString(),
      }
      const updatedCustomers = [...customers, newCustomer]
      setCustomers(updatedCustomers)
      saveToLocalStorage("customers", updatedCustomers)
    }

    setFormData({
      name: "",
      mobile: "",
      area: "",
      notes: "",
    })

    setIsAddingCustomer(false)
  }

  const handleEditCustomer = async () => {
    if (!currentCustomer) return

    try {
      const { data, error } = await supabase
        .from('customers')
        .update({
          name: formData.name,
          mobile: formData.mobile,
          area: formData.area,
          notes: formData.notes
        })
        .eq('id', currentCustomer.id)
        .select()
      
      if (error) {
        console.error("Error updating customer:", error)
        // Fallback to localStorage
        const updatedCustomers = customers.map((customer) =>
          customer.id === currentCustomer.id ? { ...customer, ...formData } : customer,
        )
        setCustomers(updatedCustomers)
        saveToLocalStorage("customers", updatedCustomers)
      } else if (data) {
        const updatedCustomers = customers.map((customer) =>
          customer.id === currentCustomer.id ? data[0] : customer,
        )
        setCustomers(updatedCustomers)
      }
    } catch (err) {
      console.error("Error:", err)
      // Fallback to localStorage
      const updatedCustomers = customers.map((customer) =>
        customer.id === currentCustomer.id ? { ...customer, ...formData } : customer,
      )
      setCustomers(updatedCustomers)
      saveToLocalStorage("customers", updatedCustomers)
    }

    setFormData({
      name: "",
      mobile: "",
      area: "",
      notes: "",
    })

    setIsEditingCustomer(false)
    setCurrentCustomer(null)
  }

  const handleDeleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)
      
      if (error) {
        console.error("Error deleting customer:", error)
        // Fallback to localStorage
        const updatedCustomers = customers.filter((customer) => customer.id !== id)
        setCustomers(updatedCustomers)
        saveToLocalStorage("customers", updatedCustomers)
      } else {
        const updatedCustomers = customers.filter((customer) => customer.id !== id)
        setCustomers(updatedCustomers)
      }
    } catch (err) {
      console.error("Error:", err)
      // Fallback to localStorage
      const updatedCustomers = customers.filter((customer) => customer.id !== id)
      setCustomers(updatedCustomers)
      saveToLocalStorage("customers", updatedCustomers)
    }
  }

  const startEditCustomer = (customer: Customer) => {
    setCurrentCustomer(customer)
    setFormData({
      name: customer.name,
      mobile: customer.mobile,
      area: customer.area,
      notes: customer.notes,
    })
    setIsEditingCustomer(true)
  }

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile.includes(searchTerm) ||
      customer.area.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">Manage your customer information</p>
        </div>
        <Button onClick={() => setIsAddingCustomer(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Customer
        </Button>
      </div>

      <div className="flex items-center space-x-2">
        <Search className="h-5 w-5 text-muted-foreground" />
        <Input
          placeholder="Search by name, phone number or area"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {isAddingCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Customer</CardTitle>
            <CardDescription>Enter new customer information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="name">Full Name</label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter customer's full name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="mobile">Mobile Number</label>
              <Input
                id="mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Enter customer's mobile number"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="area">Area</label>
              <Input
                id="area"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                placeholder="Enter customer's area"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="notes">Notes</label>
              <Textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsAddingCustomer(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddCustomer}>Add Customer</Button>
          </CardFooter>
        </Card>
      )}

      {isEditingCustomer && currentCustomer && (
        <Card>
          <CardHeader>
            <CardTitle>Edit Customer</CardTitle>
            <CardDescription>Update customer information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="edit-name">Full Name</label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter customer's full name"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-mobile">Mobile Number</label>
              <Input
                id="edit-mobile"
                name="mobile"
                value={formData.mobile}
                onChange={handleInputChange}
                placeholder="Enter customer's mobile number"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-area">Area</label>
              <Input
                id="edit-area"
                name="area"
                value={formData.area}
                onChange={handleInputChange}
                placeholder="Enter customer's area"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="edit-notes">Notes</label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Enter any additional notes"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditingCustomer(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditCustomer}>Save Changes</Button>
          </CardFooter>
        </Card>
      )}

      <div className="grid gap-4">
        {filteredCustomers.map((customer) => (
          <Card key={customer.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <h3 className="font-medium">{customer.name}</h3>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{customer.mobile}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">{customer.area}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Link href={`/customers/${customer.id}`}>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </Link>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => startEditCustomer(customer)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDeleteCustomer(customer.id)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}