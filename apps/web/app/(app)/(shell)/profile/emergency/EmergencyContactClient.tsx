'use client';


import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button, Drawer, UnifiedInput, Select } from '@ghxstship/ui';
import { Phone, Plus, Edit, Trash2, User, AlertTriangle } from 'lucide-react';

const emergencyContactSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  relationship: z.string().min(1, 'Relationship is required'),
  phone_primary: z.string().min(1, 'Primary phone is required'),
  phone_secondary: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  is_primary: z.boolean().default(false),
  notes: z.string().optional()
});

type EmergencyContactForm = z.infer<typeof emergencyContactSchema>;

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone_primary: string;
  phone_secondary?: string;
  email?: string;
  address?: string;
  is_primary: boolean;
  notes?: string;
  created_at: string;
}

export default function EmergencyContactClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<EmergencyContact | null>(null);
  const [saving, setSaving] = useState(false);

  const form = useForm<EmergencyContactForm>({
    resolver: zodResolver(emergencyContactSchema),
    defaultValues: {
      name: '',
      relationship: '',
      phone_primary: '',
      phone_secondary: '',
      email: '',
      address: '',
      is_primary: false,
      notes: ''
    }
  });

  useEffect(() => {
    loadEmergencyContacts();
  }, [orgId, userId]);

  const loadEmergencyContacts = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await sb
        .from('emergency_contacts')
        .select('*')
        .eq('organization_id', orgId)
        .eq('user_id', userId)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error loading emergency contacts:', error);
    } finally {
      setLoading(false);
    }
  };

  const openDrawer = (contact?: EmergencyContact) => {
    if (contact) {
      setEditingContact(contact);
      form.reset({
        name: contact.name,
        relationship: contact.relationship,
        phone_primary: contact.phone_primary,
        phone_secondary: contact.phone_secondary || '',
        email: contact.email || '',
        address: contact.address || '',
        is_primary: contact.is_primary,
        notes: contact.notes || ''
      });
    } else {
      setEditingContact(null);
      form.reset();
    }
    setDrawerOpen(true);
  };

  const onSubmit = async (data: EmergencyContactForm) => {
    setSaving(true);
    try {
      if (editingContact) {
        const { error } = await sb
          .from('emergency_contacts')
          .update(data)
          .eq('id', editingContact.id);

        if (error) throw error;
      } else {
        const { error } = await sb
          .from('emergency_contacts')
          .insert({
            ...data,
            user_id: userId,
            organization_id: orgId
          });

        if (error) throw error;
      }

      setDrawerOpen(false);
      loadEmergencyContacts();
    } catch (error) {
      console.error('Error saving emergency contact:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteContact = async (contactId: string) => {
    if (!confirm('Are you sure you want to delete this emergency contact?')) return;

    try {
      const { error } = await sb
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);

      if (error) throw error;
      loadEmergencyContacts();
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
    }
  };

  if (loading) {
    return (
      <div className="stack-md">
        {[...Array(2)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-component-lg bg-secondary rounded-lg"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-4 text-heading-4">Emergency Contacts</h2>
        <Button onClick={() => openDrawer()} className="flex items-center gap-sm">
          <Plus className="h-icon-xs w-icon-xs" />
          Add Contact
        </Button>
      </div>

      <div className="stack-md">
        {contacts.length > 0 ? (
          contacts.map((contact: any) => (
            <Card key={contact.id}>
              <div className="p-lg">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-md">
                    <div className="p-sm bg-destructive/10 rounded-lg">
                      <AlertTriangle className="h-icon-md w-icon-md color-destructive" />
                    </div>
                    
                    <div>
                      <div className="flex items-center gap-sm mb-sm">
                        <h3 className="text-body text-heading-4">{contact.name}</h3>
                        {contact.is_primary && (
                          <Badge variant="destructive">Primary</Badge>
                        )}
                      </div>
                      
                      <div className="stack-xs text-body-sm color-muted">
                        <div className="flex items-center gap-sm">
                          <User className="h-icon-xs w-icon-xs" />
                          <span>{contact.relationship}</span>
                        </div>
                        
                        <div className="flex items-center gap-sm">
                          <Phone className="h-icon-xs w-icon-xs" />
                          <span>{contact.phone_primary}</span>
                          {contact.phone_secondary && (
                            <span>• {contact.phone_secondary}</span>
                          )}
                        </div>
                        
                        {contact.email && (
                          <div className="flex items-center gap-sm">
                            <span>✉</span>
                            <span>{contact.email}</span>
                          </div>
                        )}
                        
                        {contact.address && (
                          <div className="text-body-sm mt-sm">
                            <strong>Address:</strong> {contact.address}
                          </div>
                        )}
                        
                        {contact.notes && (
                          <div className="text-body-sm mt-sm">
                            <strong>Notes:</strong> {contact.notes}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-sm">
                    <Button
                      variant="outline"
                     
                      onClick={() => openDrawer(contact)}
                    >
                      <Edit className="h-icon-xs w-icon-xs" />
                    </Button>
                    <Button
                      variant="outline"
                     
                      onClick={() => deleteContact(contact.id)}
                    >
                      <Trash2 className="h-icon-xs w-icon-xs" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : (
          <Card>
            <div className="p-xl text-center">
              <AlertTriangle className="h-icon-2xl w-icon-2xl mx-auto mb-md color-muted opacity-50" />
              <h3 className="text-body form-label mb-sm">No Emergency Contacts</h3>
              <p className="color-muted mb-md">
                Add emergency contacts for safety and security purposes.
              </p>
              <Button onClick={() => openDrawer()}>
                <Plus className="h-icon-xs w-icon-xs mr-sm" />
                Add Emergency Contact
              </Button>
            </div>
          </Card>
        )}
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingContact ? 'Edit Emergency Contact' : 'Add Emergency Contact'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="stack-lg">
          <div className="grid grid-cols-1 gap-md">
            <UnifiedInput               label="Full Name"
              placeholder="Enter contact's full name"
              {...form.register('name')}
              error={form.formState.errors.name?.message}
              required
            />

            <UnifiedInput               label="Relationship"
              placeholder="e.g., Spouse, Parent, Sibling, Friend"
              {...form.register('relationship')}
              error={form.formState.errors.relationship?.message}
              required
            />

            <div className="grid grid-cols-2 gap-md">
              <UnifiedInput                 label="Primary Phone"
                placeholder="Enter primary phone number"
                {...form.register('phone_primary')}
                error={form.formState.errors.phone_primary?.message}
                required
              />

              <UnifiedInput                 label="Secondary Phone"
                placeholder="Enter secondary phone (optional)"
                {...form.register('phone_secondary')}
                error={form.formState.errors.phone_secondary?.message}
              />
            </div>

            <UnifiedInput               label="Email"
              type="email"
              placeholder="Enter email address (optional)"
              {...form.register('email')}
              error={form.formState.errors.email?.message}
            />

            <UnifiedInput               label="Address"
              placeholder="Enter full address (optional)"
              {...form.register('address')}
              error={form.formState.errors.address?.message}
            />

            <UnifiedInput               label="Notes"
              placeholder="Any additional notes (optional)"
              {...form.register('notes')}
              error={form.formState.errors.notes?.message}
            />

            <div className="flex items-center gap-sm">
              <input
                type="checkbox"
                id="is_primary"
                {...form.register('is_primary')}
                className="rounded border-border"
              />
              <label htmlFor="is_primary" className="text-body-sm form-label">
                Set as primary emergency contact
              </label>
            </div>
          </div>

          <div className="flex justify-end gap-sm pt-md border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              {editingContact ? 'Update Contact' : 'Add Contact'}
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
