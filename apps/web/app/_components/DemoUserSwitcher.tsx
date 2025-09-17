'use client'

import { useState } from 'react'
import { Button } from '@ghxstship/ui'
import { Badge } from '@ghxstship/ui'
import { Card } from '@ghxstship/ui'
import { Users, Crown, Shield, Settings, Edit, Eye, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface DemoUser {
  type: string
  name: string
  role: string
}

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  manager: Settings,
  contributor: Edit,
  viewer: Eye
}

const ROLE_COLORS = {
  owner: 'color-primary',
  admin: 'color-error',
  manager: 'color-primary',
  contributor: 'color-success',
  viewer: 'color-muted'
}

export function DemoUserSwitcher() {
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const demoUsers: DemoUser[] = [
    { type: 'owner', name: 'Alex Chen (Owner)', role: 'owner' },
    { type: 'admin', name: 'Sarah Johnson (Admin)', role: 'admin' },
    { type: 'manager', name: 'Mike Rodriguez (Manager)', role: 'manager' },
    { type: 'contributor', name: 'Emma Thompson (Contributor)', role: 'contributor' },
    { type: 'viewer', name: 'David Park (Viewer)', role: 'viewer' }
  ]

  const handleUserSwitch = async (userType: string) => {
    setIsLoading(true)
    
    try {
      // First sign out current user
      await supabase.auth.signOut()
      
      // Sign in as demo user
      const response = await fetch('/api/demo/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ userType })
      })

      const result = await response.json()

      if (result.success) {
        setCurrentUser(userType)
        // Refresh the page to update auth state
        router.refresh()
        window.location.reload()
      } else {
        console.error('Failed to switch user:', result.error)
        alert('Failed to switch user. Please try again.')
      }
    } catch (error) {
      console.error('Error switching user:', error)
      alert('An error occurred while switching users.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-2 mb-4">
        <Users className="h-5 w-5 text-muted-foreground" />
        <h3 className="text-lg font-semibold">Demo User Switcher</h3>
      </div>
      
      <p className="text-sm text-muted-foreground mb-6">
        Switch between different user roles to test permissions and access levels in the GHXSTSHIP application.
      </p>

      <div className="grid gap-3">
        {demoUsers.map((user) => {
          const Icon = ROLE_ICONS[user.role as keyof typeof ROLE_ICONS]
          const isCurrentUser = currentUser === user.type
          
          return (
            <div
              key={user.type}
              className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Icon className="h-4 w-4 text-muted-foreground" />
                <div>
                  <div className="font-medium">{user.name}</div>
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}`}
                  >
                    {user.role.toUpperCase()}
                  </Badge>
                </div>
              </div>
              
              <Button
                variant={isCurrentUser ? "primary" : "outline"}
                size="sm"
                onClick={() => handleUserSwitch(user.type)}
                disabled={isLoading}
                className="min-w-[80px]"
              >
                {isLoading ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : isCurrentUser ? (
                  'Current'
                ) : (
                  'Switch'
                )}
              </Button>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Role Permissions:</h4>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li><strong>Owner:</strong> Full access to all features and settings</li>
          <li><strong>Admin:</strong> Manage users, projects, and most settings</li>
          <li><strong>Manager:</strong> Create and manage projects, view reports</li>
          <li><strong>Contributor:</strong> Create tasks, update assigned work</li>
          <li><strong>Viewer:</strong> Read-only access to assigned projects</li>
        </ul>
      </div>
    </Card>
  )
}
