'use client';


import React from "react";

import { Badge, Button, Card, UnifiedInput, cn } from '@ghxstship/ui';
import { useState, useEffect } from 'react'
import { createClient } from "../../../../../lib/supabase/client"

interface ClientProps {
  className?: string
}

export default function Client({ className }: ClientProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()
    async function fetchPreferences() {
      try {
        setLoading(true)
        const { data: auth } = await supabase.auth.getUser()
        let items: unknown[] = []
        if (auth?.user) {
          const { data: prefs, error } = await supabase
            .from('user_travel_preferences')
            .select('id, preference_name, status')
            .eq('user_id', auth.user.id)
            .limit(25)
          if (!error && prefs) {
            const mockData: Array<{ id: string; preference_name: string; status: string }> = [
              { id: '1', preference_name: 'Window Seat', status: 'Active' },
              { id: '2', preference_name: 'Aisle Seat', status: 'Active' },
            ]
            items = prefs.map((p: any) => ({
              id: p.id,
              name: p.preference_name || 'Preference',
              status: p.status || 'active'
            }))
          }
        }
        if (isMounted) setData(items)
      } catch (err) {
        // console.error('TravelPreferencesClient fetch error:', err)
        if (isMounted) setData([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchPreferences()
    return () => { isMounted = false }
  }, [])

  if (loading) {
    return (
      <div className={className}>
        <Card className="p-md">
          <div className="animate-pulse space-y-md">
            <div className="h-4 bg-secondary rounded w-1/4"></div>
            <div className="h-4 bg-secondary rounded w-1/2"></div>
            <div className="h-4 bg-secondary rounded w-3/4"></div>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="mb-md">
        <h1 className="text-heading-lg text-heading-3 mb-sm">Travel Preferences</h1>
        <p className="color-foreground-subtle">Manage your travel and accommodation preferences</p>
      </div>

      <div className="mb-md">
        <UnifiedInput onChange={(e: React.ChangeEvent<HTMLInputElement>) => {}} placeholder="Search travel preferences..." className="w-full sm:w-auto sm:max-w-sm" aria- />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
        {data.map((item: any) => (
          <Card key={item.id} className="p-md">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h2 className="text-body text-heading-3">{item.name}</h2>
                <p className="text-body-sm color-foreground-subtle">ID: {item.id}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-sm">
                <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
                <Button variant="default" size="sm" onClick={() => console.log("Edit clicked")}>Edit</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
