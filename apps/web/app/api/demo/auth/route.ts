import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// Demo user credentials for each role type
const DEMO_USERS = {
  owner: {
    id: '11111111-1111-1111-1111-111111111111',
    email: 'owner@ghxstship.demo',
    password: 'demo123!',
    name: 'Alex Chen (Owner)',
    role: 'owner'
  },
  admin: {
    id: '22222222-2222-2222-2222-222222222222',
    email: 'admin@ghxstship.demo',
    password: 'demo123!',
    name: 'Sarah Johnson (Admin)',
    role: 'admin'
  },
  manager: {
    id: '33333333-3333-3333-3333-333333333333',
    email: 'manager@ghxstship.demo',
    password: 'demo123!',
    name: 'Mike Rodriguez (Manager)',
    role: 'manager'
  },
  contributor: {
    id: '44444444-4444-4444-4444-444444444444',
    email: 'contributor@ghxstship.demo',
    password: 'demo123!',
    name: 'Emma Thompson (Contributor)',
    role: 'contributor'
  },
  viewer: {
    id: '55555555-5555-5555-5555-555555555555',
    email: 'viewer@ghxstship.demo',
    password: 'demo123!',
    name: 'David Park (Viewer)',
    role: 'viewer'
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userType } = await request.json()
    
    if (!userType || !DEMO_USERS[userType as keyof typeof DEMO_USERS]) {
      return NextResponse.json(
        { error: 'Invalid user type' },
        { status: 400 }
      )
    }

    const demoUser = DEMO_USERS[userType as keyof typeof DEMO_USERS]
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    // Sign in as the demo user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: demoUser.email,
      password: demoUser.password
    })

    if (authError) {
      console.error('Demo auth error:', authError)
      return NextResponse.json(
        { error: 'Authentication failed', details: authError.message },
        { status: 401 }
      )
    }

    // Get user profile and membership info
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select(`
        *,
        memberships!inner(
          role,
          status,
          organization:organizations(
            id,
            name,
            slug
          )
        )
      `)
      .eq('auth_id', authData.user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch user profile' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: profile.id,
        name: profile.full_name,
        email: authData.user.email,
        role: profile.memberships[0]?.role,
        organization: profile.memberships[0]?.organization
      },
      session: authData.session
    })

  } catch (error) {
    console.error('Demo auth API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    availableUsers: Object.keys(DEMO_USERS).map(key => ({
      type: key,
      name: DEMO_USERS[key as keyof typeof DEMO_USERS].name,
      role: DEMO_USERS[key as keyof typeof DEMO_USERS].role
    }))
  })
}
