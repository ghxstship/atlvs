'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Card, Badge } from '@ghxstship/ui';
import { Plus, Save, Award, Calendar, ExternalLink, Trash2 } from 'lucide-react';

interface Certification {
  id: string;
  name: string;
  issuing_organization: string;
  certification_number?: string;
  issue_date?: string;
  expiry_date?: string;
  status: 'active' | 'expired' | 'suspended' | 'revoked';
  verification_url?: string;
  attachment_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function CertificationsClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    issuing_organization: '',
    certification_number: '',
    issue_date: '',
    expiry_date: '',
    verification_url: '',
    attachment_url: '',
    notes: ''
  });

  useEffect(() => {
    loadCertifications();
  }, [orgId, userId]);

  const loadCertifications = async () => {
    try {
      setLoading(true);
      
      const { data: userData } = await sb
        .from('users')
        .select('id')
        .eq('auth_id', userId)
        .single();

      if (userData) {
        const { data: certificationsData } = await sb
          .from('user_certifications')
          .select('*')
          .eq('user_id', userData.id)
          .eq('organization_id', orgId)
          .order('created_at', { ascending: false });

        setCertifications(certificationsData || []);
      }
    } catch (error) {
      console.error('Error loading certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    try {
      setSaving(true);
      
      const { data: userData } = await sb
        .from('users')
        .select('id')
        .eq('auth_id', userId)
        .single();

      if (userData) {
        const { error } = await sb
          .from('user_certifications')
          .insert({
            ...formData,
            user_id: userData.id,
            organization_id: orgId,
            status: 'active'
          });

        if (error) throw error;
        
        setFormData({
          name: '',
          issuing_organization: '',
          certification_number: '',
          issue_date: '',
          expiry_date: '',
          verification_url: '',
          attachment_url: '',
          notes: ''
        });
        setShowAddForm(false);
        await loadCertifications();
      }
    } catch (error) {
      console.error('Error adding certification:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (certificationId: string) => {
    try {
      const { error } = await sb
        .from('user_certifications')
        .delete()
        .eq('id', certificationId);

      if (error) throw error;
      await loadCertifications();
    } catch (error) {
      console.error('Error deleting certification:', error);
    }
  };

  const getStatusColor = (status: string, expiryDate?: string) => {
    if (status === 'expired') return 'destructive';
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      
      if (expiry < now) return 'destructive';
      if (expiry <= thirtyDaysFromNow) return 'warning';
    }
    return 'default';
  };

  const getStatusText = (status: string, expiryDate?: string) => {
    if (status === 'expired') return 'Expired';
    if (expiryDate) {
      const expiry = new Date(expiryDate);
      const now = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(now.getDate() + 30);
      
      if (expiry < now) return 'Expired';
      if (expiry <= thirtyDaysFromNow) return 'Expiring Soon';
    }
    return 'Active';
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          <h3 className="font-semibold">Certifications</h3>
        </div>
        <Button onClick={() => setShowAddForm(true)} size="sm">
          <Plus className="h-4 w-4 mr-2" />
          Add Certification
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card>
          <div className="p-4">
            <h4 className="font-medium mb-4">Add New Certification</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Certification Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="AWS Solutions Architect"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Issuing Organization *</label>
                <Input
                  value={formData.issuing_organization}
                  onChange={(e) => setFormData(prev => ({ ...prev, issuing_organization: e.target.value }))}
                  placeholder="Amazon Web Services"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Certification Number</label>
                <Input
                  value={formData.certification_number}
                  onChange={(e) => setFormData(prev => ({ ...prev, certification_number: e.target.value }))}
                  placeholder="AWS-SAA-123456"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Issue Date</label>
                <Input
                  type="date"
                  value={formData.issue_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry Date</label>
                <Input
                  type="date"
                  value={formData.expiry_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Verification URL</label>
                <Input
                  value={formData.verification_url}
                  onChange={(e) => setFormData(prev => ({ ...prev, verification_url: e.target.value }))}
                  placeholder="https://verify.aws.com/..."
                />
              </div>
            </div>
            
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full px-3 py-2 border border-input bg-background rounded-md"
                rows={3}
                placeholder="Additional notes about this certification..."
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAdd} disabled={saving || !formData.name || !formData.issuing_organization}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Adding...' : 'Add Certification'}
              </Button>
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Certifications List */}
      <div className="space-y-4">
        {certifications.length === 0 ? (
          <Card>
            <div className="p-8 text-center text-muted-foreground">
              <Award className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No certifications added yet.</p>
              <p className="text-sm">Add your professional certifications to showcase your expertise.</p>
            </div>
          </Card>
        ) : (
          certifications.map((cert) => (
            <Card key={cert.id}>
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{cert.name}</h4>
                      <Badge variant={getStatusColor(cert.status, cert.expiry_date)}>
                        {getStatusText(cert.status, cert.expiry_date)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      Issued by {cert.issuing_organization}
                    </p>
                    
                    {cert.certification_number && (
                      <p className="text-sm">
                        <span className="font-medium">Number:</span> {cert.certification_number}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                      {cert.issue_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Issued: {new Date(cert.issue_date).toLocaleDateString()}
                        </div>
                      )}
                      {cert.expiry_date && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    {cert.notes && (
                      <p className="text-sm mt-2 text-muted-foreground">{cert.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {cert.verification_url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(cert.verification_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(cert.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
