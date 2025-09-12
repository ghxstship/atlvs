import { DemoUserSwitcher } from '@/components/DemoUserSwitcher'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function DemoPage() {
  const supabase = createClient()
  
  // Check if user is authenticated
  const { data: { session } } = await supabase.auth.getSession()
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">GHXSTSHIP Demo Environment</h1>
          <p className="text-muted-foreground">
            Test different user roles and permissions in the application
          </p>
        </div>
        
        <DemoUserSwitcher />
        
        {session && (
          <div className="mt-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Currently signed in. You can now navigate to the application.
            </p>
            <div className="flex gap-4 justify-center">
              <a 
                href="/dashboard" 
                className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Go to Dashboard
              </a>
              <a 
                href="/projects" 
                className="inline-flex items-center px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
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
