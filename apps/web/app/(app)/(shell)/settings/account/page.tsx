'use client';

import React, { useState } from 'react';
import { SettingsLayout } from '@ghxstship/ui/templates';

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general');

  const sections = [
    { id: 'general', label: 'General', icon: 'Settings' },
    { id: 'account', label: 'Account', icon: 'User' },
    { id: 'billing', label: 'Billing', icon: 'CreditCard' },
    { id: 'notifications', label: 'Notifications', icon: 'Bell' },
    { id: 'security', label: 'Security', icon: 'Shield' },
  ];

  return (
    <SettingsLayout
      title="Settings"
      subtitle="Manage your account and application preferences"
      sections={sections}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
      save={{
        hasChanges: false,
        onSave: async () => {
          console.log('Saving settings...');
          await new Promise(resolve => setTimeout(resolve, 1000));
          console.log('Settings saved!');
        },
        onDiscard: () => console.log('Discard changes'),
        saving: false
      }}
    >
      {activeSection === 'general' && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">General Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Display Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-input rounded-md"
                  placeholder="Enter your display name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Timezone</label>
                <select className="w-full px-3 py-2 border border-input rounded-md">
                  <option>UTC-8 (Pacific)</option>
                  <option>UTC-5 (Eastern)</option>
                  <option>UTC+0 (GMT)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TODO: Add other settings sections */}
      {activeSection !== 'general' && (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">
            {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)} settings coming soon
          </p>
        </div>
      )}
    </SettingsLayout>
  );
}
