"use client"

import * as React from "react"
import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"

interface IntegrationStatus {
  slack: boolean
  payment: boolean
}

interface SettingsSectionProps {
  title: string
  description: string
  children: ReactNode
}

const SettingsSection = React.forwardRef<HTMLDivElement, SettingsSectionProps>(
  ({ title, description, children }, ref) => (
    <div ref={ref} className="flex items-center justify-between">
      <div>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center space-x-2">
        {children}
      </div>
    </div>
  )
)

SettingsSection.displayName = "SettingsSection"

export default function SettingsPage() {
  const [darkMode, setDarkMode] = React.useState(false)
  const [integrations, setIntegrations] = React.useState<IntegrationStatus>({
    slack: false,
    payment: false
  })

  const handleIntegrationToggle = React.useCallback(
    (integration: keyof IntegrationStatus) => {
      setIntegrations((prev) => ({
        ...prev,
        [integration]: !prev[integration]
      }))
    },
    []
  )

  return (
    <main className="space-y-6">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Customize your CRM experience</p>
        </div>
      </header>

      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="team">Team Management</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the CRM looks</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingsSection
                title="Dark Mode"
                description="Toggle dark mode theme"
              >
                <Switch
                  id="dark-mode"
                  checked={darkMode}
                  onCheckedChange={setDarkMode}
                  aria-label="Toggle dark mode"
                />
              </SettingsSection>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>External Services</CardTitle>
              <CardDescription>Connect with other platforms</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <SettingsSection
                title="Slack Integration"
                description="Send notifications to Slack"
              >
                <Button 
                  variant="outline"
                  onClick={() => handleIntegrationToggle('slack')}
                  aria-label={integrations.slack ? 'Disconnect Slack' : 'Connect Slack'}
                >
                  {integrations.slack ? 'Disconnect' : 'Connect'}
                </Button>
              </SettingsSection>

              <SettingsSection
                title="Payment Gateway"
                description="Configure payment processing"
              >
                <Button 
                  variant="outline"
                  onClick={() => handleIntegrationToggle('payment')}
                  aria-label={integrations.payment ? 'Disconnect payment gateway' : 'Setup payment gateway'}
                >
                  {integrations.payment ? 'Disconnect' : 'Setup'}
                </Button>
              </SettingsSection>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </main>
  )
} 