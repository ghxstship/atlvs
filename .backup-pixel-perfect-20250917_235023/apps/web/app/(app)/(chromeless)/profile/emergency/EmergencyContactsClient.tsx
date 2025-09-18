'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Card, CardHeader, CardContent, Alert } from '@ghxstship/ui';
import { Phone, Mail, User, AlertTriangle, Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { useToast } from '@ghxstship/ui';

interface EmergencyContact {
  id: string;
  name: string;
  relationship: string;
  phone_primary: string;
  phone_secondary?: string;
  email?: string;
  is_primary: boolean;
  notes?: string;
}

export default function EmergencyContactsClient() {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [formData, setFormData] = useState<Partial<EmergencyContact>>({});
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('emergency_contacts')
        .select('*')
        .eq('user_id', user.id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true });

      if (error) throw error;
      setContacts(data || []);
    } catch (error) {
      console.error('Error fetching emergency contacts:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load emergency contacts'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (editingId) {
        const { error } = await supabase
          .from('emergency_contacts')
          .update(formData)
          .eq('id', editingId)
          .eq('user_id', user.id);

        if (error) throw error;
        addToast({
          type: 'success',
          title: 'Success',
          description: 'Emergency contact updated successfully'
        });
      } else {
        const { error } = await supabase
          .from('emergency_contacts')
          .insert({
            ...formData,
            user_id: user.id,
          });

        if (error) throw error;
        addToast({
          type: 'success',
          title: 'Success',
          description: 'Emergency contact added successfully'
        });
      }

      setEditingId(null);
      setIsAdding(false);
      setFormData({});
      fetchContacts();
    } catch (error) {
      console.error('Error saving emergency contact:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save emergency contact'
      });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      addToast({
        type: 'success',
        title: 'Success',
        description: 'Emergency contact deleted successfully'
      });
      fetchContacts();
    } catch (error) {
      console.error('Error deleting emergency contact:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to delete emergency contact'
      });
    }
  };

  const handleEdit = (contact: EmergencyContact) => {
    setEditingId(contact.id);
    setFormData(contact);
    setIsAdding(false);
  };

  const handleCancel = () => {
    setEditingId(null);
    setIsAdding(false);
    setFormData({});
  };

  const handleAdd = () => {
    setIsAdding(true);
    setEditingId(null);
    setFormData({
      name: '',
      relationship: '',
      phone_primary: '',
      phone_secondary: '',
      email: '',
      is_primary: false,
      notes: '',
    });
  };

  if (loading) {
    return (
      <div className="stack-md">
        {[1, 2].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-heading-3 text-heading-3">Emergency Contacts</h2>
          <p className="color-muted">Manage your emergency contact information</p>
        </div>
        <Button onClick={handleAdd} disabled={isAdding}>
          <Plus className="w-4 h-4 mr-sm" />
          Add Contact
        </Button>
      </div>

      {contacts.length === 0 && !isAdding && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <div>
            <h3 className="text-heading-4">No emergency contacts</h3>
            <p className="text-body-sm">Add at least one emergency contact for safety purposes.</p>
          </div>
        </Alert>
      )}

      {isAdding && (
        <Card>
          <CardHeader>
            <h3 className="text-heading-4">New Emergency Contact</h3>
          </CardHeader>
          <CardContent className="stack-md">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <Input
                label="Full Name"
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                required
              />
              <Input
                label="Relationship"
                value={formData.relationship || ''}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                placeholder="Spouse, Parent, Friend, etc."
                required
              />
              <Input
                label="Primary Phone"
                type="tel"
                value={formData.phone_primary || ''}
                onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                placeholder="+1 (555) 123-4567"
                required
              />
              <Input
                label="Secondary Phone"
                type="tel"
                value={formData.phone_secondary || ''}
                onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                placeholder="+1 (555) 987-6543"
              />
              <Input
                label="Email"
                type="email"
                value={formData.email || ''}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="contact@example.com"
              />
              <div className="flex items-center cluster-sm">
                <input
                  type="checkbox"
                  id="is_primary"
                  checked={formData.is_primary || false}
                  onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                  className="rounded border-border"
                />
                <label htmlFor="is_primary" className="text-body-sm">
                  Primary Contact
                </label>
              </div>
            </div>
            <Input
              label="Notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional information..."
            />
            <div className="flex justify-end cluster-sm">
              <Button variant="outline" onClick={handleCancel}>
                <X className="w-4 h-4 mr-sm" />
                Cancel
              </Button>
              <Button onClick={handleSave}>
                <Save className="w-4 h-4 mr-sm" />
                Save Contact
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="stack-md">
        {contacts.map((contact) => (
          <Card key={contact.id} className={contact.is_primary ? 'ring-2 ring-primary' : ''}>
            <CardContent className="p-lg">
              {editingId === contact.id ? (
                <div className="stack-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <Input
                      label="Full Name"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                    <Input
                      label="Relationship"
                      value={formData.relationship || ''}
                      onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                      required
                    />
                    <Input
                      label="Primary Phone"
                      type="tel"
                      value={formData.phone_primary || ''}
                      onChange={(e) => setFormData({ ...formData, phone_primary: e.target.value })}
                      required
                    />
                    <Input
                      label="Secondary Phone"
                      type="tel"
                      value={formData.phone_secondary || ''}
                      onChange={(e) => setFormData({ ...formData, phone_secondary: e.target.value })}
                    />
                    <Input
                      label="Email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <div className="flex items-center cluster-sm">
                      <input
                        type="checkbox"
                        id={`is_primary_${contact.id}`}
                        checked={formData.is_primary || false}
                        onChange={(e) => setFormData({ ...formData, is_primary: e.target.checked })}
                        className="rounded border-border"
                      />
                      <label htmlFor={`is_primary_${contact.id}`} className="text-body-sm">
                        Primary Contact
                      </label>
                    </div>
                  </div>
                  <Input
                    label="Notes"
                    value={formData.notes || ''}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  />
                  <div className="flex justify-end cluster-sm">
                    <Button variant="outline" onClick={handleCancel}>
                      <X className="w-4 h-4 mr-sm" />
                      Cancel
                    </Button>
                    <Button onClick={handleSave}>
                      <Save className="w-4 h-4 mr-sm" />
                      Save Changes
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start">
                  <div className="stack-sm">
                    <div className="flex items-center cluster-sm">
                      <User className="w-5 h-5 color-muted" />
                      <span className="text-heading-4 text-body">{contact.name}</span>
                      {contact.is_primary && (
                        <span className="px-sm py-xs bg-primary/10 color-primary text-body-sm rounded-full">
                          Primary
                        </span>
                      )}
                    </div>
                    <p className="text-body-sm color-muted">{contact.relationship}</p>
                    <div className="stack-xs">
                      <div className="flex items-center cluster-sm">
                        <Phone className="w-4 h-4 color-muted" />
                        <span className="text-body-sm">{contact.phone_primary}</span>
                      </div>
                      {contact.phone_secondary && (
                        <div className="flex items-center cluster-sm">
                          <Phone className="w-4 h-4 color-muted" />
                          <span className="text-body-sm">{contact.phone_secondary}</span>
                        </div>
                      )}
                      {contact.email && (
                        <div className="flex items-center cluster-sm">
                          <Mail className="w-4 h-4 color-muted" />
                          <span className="text-body-sm">{contact.email}</span>
                        </div>
                      )}
                    </div>
                    {contact.notes && (
                      <p className="text-body-sm color-muted mt-sm">{contact.notes}</p>
                    )}
                  </div>
                  <div className="flex cluster-sm">
                    <Button
                      variant="ghost"
                     
                      onClick={() => handleEdit(contact)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                     
                      onClick={() => handleDelete(contact.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
