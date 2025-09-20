import { DemoUserSwitcher } from '../_components/DemoUserSwitcher';
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DemoPage() {
  const supabase = await createClient()
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-lg py-2xl px-md">
        <div className="text-center mb-md">
          <h1 className="text-heading-2 text-heading-3 mb-xs">GHXSTSHIP Demo Environment</h1>
          <p className="color-muted">
            Test different user roles and permissions in the application
          </p>
        </div>
        
        <DemoUserSwitcher />
        
        {session && (
          <div className="mt-md text-center">
            <p className="text-body-sm color-muted mb-sm">
              Currently signed in. You can now navigate to the application.
            </p>
            <div className="flex gap-md justify-center">
              <a 
                href="/dashboard" 
                className="inline-flex items-center px-md py-sm bg-accent color-accent-foreground rounded-md hover:bg-accent/90 transition-colors"
              >
                Go to Dashboard
              </a>
              <a 
                href="/projects" 
                className="inline-flex items-center px-md py-sm border border-border rounded-md hover:bg-secondary transition-colors"
              >
                View Projects
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
