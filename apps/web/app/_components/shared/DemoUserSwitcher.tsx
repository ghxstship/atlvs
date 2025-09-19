'use client';


import React from "react";

import { Badge, Button, Card, cn } from '@ghxstship/ui';
import { useState } from 'react'

const demoUsers = [
  { id: 1, name: 'Captain Jack', role: 'admin', status: 'active' },
  { id: 2, name: 'First Mate Sarah', role: 'manager', status: 'active' },
  { id: 3, name: 'Crew Member Tom', role: 'member', status: 'active' }
]

export default function DemoUserSwitcher() {
  const [currentUser, setCurrentUser] = useState(demoUsers[0])

  return (
    <Card className="p-md">
      <h1 className="text-heading-4 mb-md">Demo User Switcher</h1>
      <div className="space-y-sm">
        {demoUsers.map((user: any) => (
          <div key={user.id} className="flex items-center justify-between p-sm rounded border">
            <div>
              <span className="form-label">{user.name}</span>
              <Badge variant="outline" className="ml-sm">{user.role}</Badge>
            </div>
            <Button
              size="sm"
              variant={currentUser.id === user.id ? "primary" : "outline"}
              onClick={() => setCurrentUser(user)}
              className="font-display tracking-wide"
            >
              {currentUser.id === user.id ? 'Current' : 'Switch'}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  )
}
