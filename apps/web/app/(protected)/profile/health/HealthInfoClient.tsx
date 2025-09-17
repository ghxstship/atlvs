'use client';

import React from "react";

import { Badge, Button, Card, Input, cn } from "@ghxstship/ui";
import { useState, useEffect } from 'react'
import { createClient } from "../../../../lib/supabase/client"

interface ClientProps {
  className?: string
}

export default function Client({ className }: ClientProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true
    const supabase = createClient()
    async function fetchRecords() {
      try {
        setLoading(true)
        const { data: auth } = await supabase.auth.getUser()
        let items: unknown[] = []
        if (auth?.user) {
          const { data: profiles, error } = await supabase
            .from('user_profiles')
            .select('id, full_name, status')
            .eq('id', auth.user.id)
            .limit(1)
          if (!error && profiles) {
            const mockData: Array<{ id: string; full_name: string; status: string }> = [
              { id: '1', full_name: 'John Doe', status: 'Active' },
              { id: '2', full_name: 'Jane Smith', status: 'Active' },
            ]
            items = profiles.map((p: any) => ({
              id: p.id,
              name: p.full_name || 'Profile',
              status: p.status || 'active'
            }))
          }
        }
        if (isMounted) setData(items)
      } catch (err) {
        // console.error('HealthInfoClient fetch error:', err)
        if (isMounted) setData([])
      } finally {
        if (isMounted) setLoading(false)
      }
    }
    fetchRecords()
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
        <h1 className="text-heading-lg text-heading-3 mb-sm">Health Information</h1>
        <p className="color-foreground-subtle">View and manage your health-related profile information</p>
      </div>

      <div className="mb-md">
        <Input onChange={() => {}} placeholder="Search health records..." className="w-full sm:w-auto sm:max-w-sm" aria- />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
        {data.map((item) => (
          <Card key={item.id} className="p-md">
            <div className="flex flex-col sm:flex-row items-center justify-between">
              <div>
                <h2 className="text-heading-4">{item.name}</h2>
                <p className="text-body-sm color-foreground-subtle">ID: {item.id}</p>
              </div>
              <div className="flex flex-col sm:flex-row items-center gap-sm">
                <Badge variant={item.status === 'active' ? 'default' : 'secondary'}>
                  {item.status}
                </Badge>
                <Button aria- variant="primary" size="sm" onClick={() => console.log("Edit clicked")}>Edit</Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
