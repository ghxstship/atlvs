import React from 'react';
import MarketingLayout from './(marketing)/layout'
import MarketingHome from './(marketing)/home/page'

export const metadata = {
  title: 'GHXSTSHIP — Enterprise Event Platform',
  description: 'Modern, multi-tenant, real-time platform for productions, festivals, and complex events.'
}

// Render the marketing layout at the root to include header and footer
export default function RootPage() {
  return (
    <MarketingLayout>
      <MarketingHome />
    </MarketingLayout>
  )
}
