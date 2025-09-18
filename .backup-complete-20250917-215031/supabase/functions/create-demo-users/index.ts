import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { action } = await req.json()

    if (action === 'create') {
      // Create demo organization first
      const { data: org, error: orgError } = await supabaseClient
        .from('organizations')
        .upsert({
          id: '00000000-0000-0000-0000-000000000001',
          name: 'GHXSTSHIP Demo Org',
          slug: 'ghxstship-demo'
        })
        .select()
        .single()

      if (orgError && orgError.code !== '23505') { // Ignore duplicate key error
        throw new Error(`Failed to create demo organization: ${orgError.message}`)
      }

      const results = []

      for (const demoUser of DEMO_USERS) {
        try {
          // Create auth user
          const { data: authUser, error: authError } = await supabaseClient.auth.admin.createUser({
            email: demoUser.email,
            password: demoUser.password,
            email_confirm: true,
            user_metadata: {
              full_name: demoUser.full_name
            }
          })

          if (authError) {
            console.error(`Failed to create auth user ${demoUser.email}:`, authError)
            results.push({ email: demoUser.email, success: false, error: authError.message })
            continue
          }

          // Create user profile
          const { error: profileError } = await supabaseClient
            .from('users')
            .upsert({
              id: demoUser.id,
              auth_id: authUser.user.id,
              full_name: demoUser.full_name,
              preferred_locale: 'en',
              timezone: 'America/Los_Angeles'
            })

          if (profileError && profileError.code !== '23505') {
            console.error(`Failed to create user profile ${demoUser.email}:`, profileError)
            results.push({ email: demoUser.email, success: false, error: profileError.message })
            continue
          }

          // Create membership
          const { error: membershipError } = await supabaseClient
            .from('memberships')
            .upsert({
              user_id: demoUser.id,
              organization_id: '00000000-0000-0000-0000-000000000001',
              role: demoUser.role,
              status: 'active'
            })

          if (membershipError && membershipError.code !== '23505') {
            console.error(`Failed to create membership ${demoUser.email}:`, membershipError)
            results.push({ email: demoUser.email, success: false, error: membershipError.message })
            continue
          }

          results.push({ email: demoUser.email, success: true, role: demoUser.role })

        } catch (error) {
          console.error(`Error creating demo user ${demoUser.email}:`, error)
          results.push({ email: demoUser.email, success: false, error: error.message })
        }
      }

      return new Response(
        JSON.stringify({ success: true, results }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (action === 'seed-data') {
      // Run the demo data seeding SQL
      const { error: seedError } = await supabaseClient.rpc('seed_demo_data')
      
      if (seedError) {
        throw new Error(`Failed to seed demo data: ${seedError.message}`)
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Demo data seeded successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge function error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
