'use client';

import { useState } from 'react'
import { Button } from '@ghxstship/ui'
import { Card } from '@ghxstship/ui'
import { Badge } from '@ghxstship/ui'
import { Users, Crown, Shield, Settings, Edit, Eye, Loader2, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface DemoUser {
  id: string
  email: string
  password: string
  full_name: string
  role: string
}

const DEMO_USERS: DemoUser[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'owner@ghxstship.demo',
    password: 'demo123!',
    full_name: 'Alex Chen (Owner)',
    role: 'owner'
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'admin@ghxstship.demo',
    password: 'demo123!',
    full_name: 'Sarah Johnson (Admin)',
    role: 'admin'
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'manager@ghxstship.demo',
    password: 'demo123!',
    full_name: 'Mike Rodriguez (Manager)',
    role: 'manager'
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'contributor@ghxstship.demo',
    password: 'demo123!',
    full_name: 'Emma Thompson (Contributor)',
    role: 'contributor'
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'viewer@ghxstship.demo',
    password: 'demo123!',
    full_name: 'David Park (Viewer)',
    role: 'viewer'
  }
]

const ROLE_ICONS = {
  owner: Crown,
  admin: Shield,
  manager: Settings,
  contributor: Edit,
  viewer: Eye
}

const ROLE_COLORS = {
  owner: 'bg-secondary/10 color-secondary border-secondary/30',
  admin: 'bg-destructive/10 color-destructive border-destructive/30',
  manager: 'bg-primary/10 color-primary border-primary/30',
  contributor: 'bg-success/10 color-success border-success/30',
  viewer: 'bg-muted/30 color-muted border-muted/30'
}

const DEMO_ORG_ID = '00000000-0000-0000-0000-000000000001'

export function DemoSetupClient() {
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<Array<{email: string, success: boolean, error?: string}>>([])
  const [step, setStep] = useState<'setup' | 'results'>('setup')
  const supabase = createClient()

  const createDemoOrganization = async () => {
    const { data, error } = await supabase
      .from('organizations')
      .upsert({
        id: DEMO_ORG_ID,
        name: 'GHXSTSHIP Demo Org',
        slug: 'ghxstship-demo'
      })
      .select()

    if (error && error.code !== '23505') {
      throw new Error(`Failed to create demo organization: ${error.message}`)
    }
    
    return data
  }

  const createDemoUser = async (demoUser: DemoUser) => {
    try {
      // Create user profile first (this will be linked when auth user is created)
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: demoUser.id,
          auth_id: demoUser.id, // Temporary, will be updated when auth user is created
          full_name: demoUser.full_name,
          preferred_locale: 'en',
          timezone: 'America/Los_Angeles'
        })

      if (profileError && profileError.code !== '23505') {
        console.warn(`Profile creation warning for ${demoUser.email}:`, profileError.message)
      }

      // Create membership
      const { error: membershipError } = await supabase
        .from('memberships')
        .upsert({
          user_id: demoUser.id,
          organization_id: DEMO_ORG_ID,
          role: demoUser.role,
          status: 'active'
        })

      if (membershipError && membershipError.code !== '23505') {
        console.warn(`Membership creation warning for ${demoUser.email}:`, membershipError.message)
      }

      return { success: true, email: demoUser.email }

    } catch (error) {
      return { success: false, email: demoUser.email, error: error.message }
    }
  }

  const seedDemoData = async () => {
    try {
      // Create demo projects
      const { error: projectsError } = await supabase
        .from('projects')
        .upsert([
          {
            id: 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
            organization_id: DEMO_ORG_ID,
            name: 'Summer Music Festival 2025',
            status: 'planning',
            starts_at: '2025-07-15',
            ends_at: '2025-07-20',
            created_by: '11111111-1111-1111-1111-111111111111'
          },
          {
            id: 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
            organization_id: DEMO_ORG_ID,
            name: 'Corporate Conference Q2',
            status: 'active',
            starts_at: '2025-04-10',
            ends_at: '2025-04-12',
            created_by: '22222222-2222-2222-2222-222222222222'
          }
        ])

      if (projectsError && projectsError.code !== '23505') {
        console.warn('Projects seeding warning:', projectsError.message)
      }

      // Create demo companies
      const { error: companiesError } = await supabase
        .from('companies')
        .upsert([
          {
            organization_id: DEMO_ORG_ID,
            name: 'Starlight Productions',
            website: 'https://starlight.example.com',
            contact_email: 'contact@starlight.example.com'
          },
          {
            organization_id: DEMO_ORG_ID,
            name: 'Atlas Logistics',
            website: 'https://atlas.example.com',
            contact_email: 'info@atlas.example.com'
          }
        ])

      if (companiesError && companiesError.code !== '23505') {
        console.warn('Companies seeding warning:', companiesError.message)
      }

    } catch (error) {
      console.error('Failed to seed demo data:', error.message)
      throw error
    }
  }

  const handleSetup = async () => {
    setIsLoading(true)
    setResults([])
    
    try {
      // Create demo organization
      await createDemoOrganization()
      
      // Create demo users
      const userResults = []
      for (const demoUser of DEMO_USERS) {
        const result = await createDemoUser(demoUser)
        userResults.push(result)
      }
      
      // Seed demo data
      await seedDemoData()
      
      setResults(userResults)
      setStep('results')
      
    } catch (error) {
      console.error('Setup failed:', error)
      setResults([{ email: 'Setup', success: false, error: error.message }])
      setStep('results')
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'results') {
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)

    return (
      <Card className="p-lg max-w-2xl mx-auto">
        <div className="flex items-center gap-sm mb-md">
          <CheckCircle className="h-5 w-5 color-success" />
          <h3 className="text-body text-heading-4">Setup Complete</h3>
        </div>

        <div className="stack-md">
          {successful.length > 0 && (
            <div>
              <h4 className="form-label color-success mb-sm">Successfully Created ({successful.length})</h4>
              <div className="stack-sm">
                {successful.map((result: any) => (
                  <div key={result.email} className="flex items-center gap-sm text-body-sm">
                    <CheckCircle className="h-4 w-4 color-success" />
                    <span>{result.email}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {failed.length > 0 && (
            <div>
              <h4 className="form-label color-destructive mb-sm">Failed ({failed.length})</h4>
              <div className="stack-sm">
                {failed.map((result: any) => (
                  <div key={result.email} className="text-body-sm">
                    <div className="flex items-center gap-sm">
                      <XCircle className="h-4 w-4 color-destructive" />
                      <span>{result.email}</span>
                    </div>
                    {result.error && (
                      <p className="text-body-sm color-destructive ml-lg">{result.error}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-lg p-md bg-primary/10 rounded-lg">
          <div className="flex items-start gap-sm">
            <AlertCircle className="h-4 w-4 color-primary mt-0.5" />
            <div className="text-body-sm">
              <p className="form-label color-primary">Next Steps:</p>
              <ol className="list-decimal list-inside color-primary mt-xs stack-xs">
                <li>Create auth users manually in Supabase Auth dashboard</li>
                <li>Use the emails and password "demo123!" for each user</li>
                <li>Visit <a href="/demo" className="underline">/demo</a> to test user switching</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="flex gap-sm mt-lg">
          <Button onClick={() => setStep('setup')} variant="outline">
            Run Setup Again
          </Button>
          <Button asChild>
            <a href="/demo">Test Demo Users</a>
          </Button>
        </div>
      </Card>
    )
  }

  return (
    <Card className="p-lg max-w-2xl mx-auto">
      <div className="flex items-center gap-sm mb-md">
        <Users className="h-5 w-5 color-muted" />
        <h3 className="text-body text-heading-4">Create Demo Users</h3>
      </div>
      
      <p className="text-body-sm color-muted mb-lg">
        This will create demo user profiles and memberships for testing different roles and permissions.
        You'll need to manually create the auth users in Supabase Auth dashboard afterwards.
      </p>

      <div className="stack-sm mb-lg">
        <h4 className="form-label">Users to be created:</h4>
        {DEMO_USERS.map((user: any) => {
          const Icon = ROLE_ICONS[user.role as keyof typeof ROLE_ICONS]
          
          return (
            <div
              key={user.id}
              className="flex items-center justify-between p-sm border rounded-lg"
            >
              <div className="flex items-center gap-sm">
                <Icon className="h-4 w-4 color-muted" />
                <div>
                  <div className="form-label">{user.full_name}</div>
                  <div className="text-body-sm color-muted">{user.email}</div>
                </div>
              </div>
              
              <Badge 
                variant="outline" 
                className={`text-body-sm ${ROLE_COLORS[user.role as keyof typeof ROLE_COLORS]}`}
              >
                {user.role.toUpperCase()}
              </Badge>
            </div>
          )
        })}
      </div>

      <Button 
        onClick={handleSetup} 
        disabled={isLoading}
        className="w-full"
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-sm" />
            Creating Demo Users...
          </>
        ) : (
          'Create Demo Users'
        )}
      </Button>
    </Card>
  )
}
