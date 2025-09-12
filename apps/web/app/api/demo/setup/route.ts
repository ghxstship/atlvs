import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient()
    
    // Check if user has admin permissions
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { action } = await request.json()

    if (action === 'create-users') {
      // Call the edge function to create demo users
      const { data, error } = await supabase.functions.invoke('create-demo-users', {
        body: { action: 'create' }
      })

      if (error) {
        return NextResponse.json(
          { error: 'Failed to create demo users', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json(data)
    }

    if (action === 'seed-data') {
      // Apply the demo data SQL
      const { error } = await supabase.rpc('seed_demo_data')
      
      if (error) {
        return NextResponse.json(
          { error: 'Failed to seed demo data', details: error.message },
          { status: 500 }
        )
      }

      return NextResponse.json({ success: true, message: 'Demo data seeded successfully' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })

  } catch (error) {
    console.error('Demo setup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
