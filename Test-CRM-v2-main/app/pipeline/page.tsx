"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"

interface Deal {
  id: string
  title: string
  value: number
  stage: string
  customer_id: string
  assigned_to: string
  notes: string
  created_at: string
  last_updated: string
  status: 'active' | 'won' | 'lost'
  loss_reason?: string
}

interface Stage {
  id: string
  name: string
  order: number
  color: string
}

export default function PipelinePage() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [stages, setStages] = useState<Stage[]>([
    { id: '1', name: 'Lead', order: 1, color: 'bg-gray-100' },
    { id: '2', name: 'Proposal', order: 2, color: 'bg-blue-100' },
    { id: '3', name: 'Negotiation', order: 3, color: 'bg-yellow-100' },
    { id: '4', name: 'Closed', order: 4, color: 'bg-green-100' }
  ])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDeals()
  }, [])

  async function loadDeals() {
    try {
      const { data, error } = await supabase
        .from('deals')
        .select('*')
        .order('last_updated', { ascending: false })

      if (error) throw error
      setDeals(data || [])
    } catch (error) {
      console.error('Error loading deals:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDragStart = (e: React.DragEvent, dealId: string) => {
    e.dataTransfer.setData('dealId', dealId)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, stageId: string) => {
    e.preventDefault()
    const dealId = e.dataTransfer.getData('dealId')
    
    try {
      const { data, error } = await supabase
        .from('deals')
        .update({ 
          stage: stageId,
          last_updated: new Date().toISOString()
        })
        .eq('id', dealId)
        .select()

      if (error) throw error
      
      setDeals(prevDeals => 
        prevDeals.map(deal => 
          deal.id === dealId 
            ? { ...deal, stage: stageId, last_updated: new Date().toISOString() }
            : deal
        )
      )

      // Create follow-up task if deal moved to Proposal stage
      if (stageId === '2') {
        await createFollowUpTask(dealId)
      }
    } catch (error) {
      console.error('Error updating deal stage:', error)
    }
  }

  async function createFollowUpTask(dealId: string) {
    try {
      const { error } = await supabase
        .from('tasks')
        .insert({
          deal_id: dealId,
          title: 'Follow up on proposal',
          due_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          status: 'pending',
          priority: 'high'
        })

      if (error) throw error
    } catch (error) {
      console.error('Error creating follow-up task:', error)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Pipeline</h1>
          <p className="text-muted-foreground">Manage your deals</p>
        </div>
        <Button>New Deal</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stages.map(stage => (
          <div
            key={stage.id}
            className={`p-4 rounded-lg ${stage.color}`}
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, stage.id)}
          >
            <h2 className="font-semibold mb-4">{stage.name}</h2>
            <div className="space-y-4">
              {deals
                .filter(deal => deal.stage === stage.id)
                .map(deal => (
                  <Card
                    key={deal.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, deal.id)}
                    className="cursor-move"
                  >
                    <CardHeader>
                      <CardTitle className="text-sm">{deal.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground">
                        ${deal.value.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Last updated: {new Date(deal.last_updated).toLocaleDateString()}
                      </p>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 