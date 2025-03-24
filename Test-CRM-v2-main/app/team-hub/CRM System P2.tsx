"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

interface ChatMessage {
  id: string
  userId: string
  channelId: string
  content: string
  mentions: string[]
  timestamp: string
  attachments?: string[]
}

interface Channel {
  id: string
  name: string
  type: 'sales' | 'marketing' | 'support' | 'general'
  members: string[]
}

interface SalesMetric {
  userId: string
  deals_closed: number
  revenue_generated: number
  tasks_completed: number
  period: 'weekly' | 'monthly' | 'quarterly'
  rank: number
}

export default function TeamHubPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [channels, setChannels] = useState<Channel[]>([])
  const [metrics, setMetrics] = useState<SalesMetric[]>([])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Team Hub</h1>
          <p className="text-muted-foreground">Collaborate with your team</p>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-8">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Team Chat</CardTitle>
              <CardDescription>Internal communication channels</CardDescription>
            </CardHeader>
            <CardContent className="h-[600px] flex flex-col">
              <div className="flex-1 overflow-y-auto space-y-4">
                {/* Chat messages */}
              </div>
              <div className="pt-4 border-t">
                <Input placeholder="Type your message..." />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="col-span-4 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sales Leaderboard</CardTitle>
              <CardDescription>Top performers this month</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Leaderboard content */}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active Channels</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Channel list */}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 