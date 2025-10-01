import { DemoSetupClient } from './DemoSetupClient'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DemoSetupPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated and has admin access
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth/signin')
  }

  // Check if user has admin role
  const { data: membership } = await supabase
    .from('memberships')
    .select('role')
    .eq('user_id', session.user.id)
    .single()

  if (!membership || !['owner', 'admin'].includes(membership.role)) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-xsxl px-md">
        <div className="text-center mb-xl">
          <h1 className="text-heading-2 text-heading-3 mb-sm">Demo Users Setup</h1>
          <p className="color-muted">
            Create authenticated demo users for testing different roles and permissions
          </p>
        </div>
        
        <DemoSetupClient />
      </div>
    </div>
  )
}
