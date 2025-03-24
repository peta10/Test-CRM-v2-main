"use client"

import * as React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge, type BadgeProps } from "@/components/ui/badge"

type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified'

interface Lead {
  id: string
  name: string
  email: string
  company: string
  source: string
  status: LeadStatus
  score: number
  last_activity: string
  notes: string
}

type StatusColorMap = Record<LeadStatus, string>

export default function LeadsPage(): JSX.Element {
  const [leads, setLeads] = React.useState<Lead[]>([])

  const statusColors: StatusColorMap = {
    new: 'bg-blue-100 text-blue-800',
    contacted: 'bg-yellow-100 text-yellow-800',
    qualified: 'bg-green-100 text-green-800',
    unqualified: 'bg-red-100 text-red-800'
  }

  const getStatusColor = (status: LeadStatus): string => {
    return statusColors[status]
  }

  const renderLead = (lead: Lead) => (
    <div key={lead.id} className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <h3 className="font-medium">{lead.name}</h3>
        <p className="text-sm text-muted-foreground">{lead.company}</p>
      </div>
      <div className="flex items-center space-x-4">
        <Badge variant="secondary" className={getStatusColor(lead.status)}>
          {lead.status}
        </Badge>
        <Button variant="ghost" size="sm">
          View Details
        </Button>
      </div>
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Lead Management</h1>
          <p className="text-muted-foreground">Track and qualify leads</p>
        </div>
        <div className="space-x-2">
          <Button variant="outline">Import Leads</Button>
          <Button>Add Lead</Button>
        </div>
      </div>

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Lead Pipeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leads.map(renderLead)}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 