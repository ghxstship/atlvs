'use client';


import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, UnifiedInput, Card, Badge } from '@ghxstship/ui';
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
      <div className="stack-md">
        <div className="animate-pulse stack-md">
          <div className="h-icon-xs bg-secondary rounded w-3/4"></div>
          <div className="h-icon-xs bg-secondary rounded w-1/2"></div>
          <div className="h-icon-xs bg-secondary rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="stack-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-sm">
          <Award className="h-icon-sm w-icon-sm" />
          <h3 className="text-body text-heading-4">Certifications</h3>
        </div>
        <Button onClick={() => setShowAddForm(true)}>
          <Plus className="h-icon-xs w-icon-xs mr-sm" />
          Add Certification
        </Button>
      </div>

      {/* Add Form */}
      {showAddForm && (
        <Card>
          <div className="p-md">
            <h4 className="form-label mb-md">Add New Certification</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
              <div className="stack-sm">
                <label className="text-body-sm form-label">Certification Name *</label>
                <UnifiedInput                   value={formData.name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="AWS Solutions Architect"
                />
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">Issuing Organization *</label>
                <UnifiedInput                   value={formData.issuing_organization}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, issuing_organization: e.target.value }))}
                  placeholder="Amazon Web Services"
                />
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">Certification Number</label>
                <UnifiedInput                   value={formData.certification_number}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, certification_number: e.target.value }))}
                  placeholder="AWS-SAA-123456"
                />
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">Issue Date</label>
                <UnifiedInput                   type="date"
                  value={formData.issue_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, issue_date: e.target.value }))}
                />
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">Expiry Date</label>
                <UnifiedInput                   type="date"
                  value={formData.expiry_date}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, expiry_date: e.target.value }))}
                />
              </div>
              
              <div className="stack-sm">
                <label className="text-body-sm form-label">Verification URL</label>
                <UnifiedInput                   value={formData.verification_url}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, verification_url: e.target.value }))}
                  placeholder="https://verify.aws.com/..."
                />
              </div>
            </div>
            
            <div className="stack-sm mb-md">
              <label className="text-body-sm form-label">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                className="w-full  px-md py-sm border border-input bg-background rounded-md"
                rows={3}
                placeholder="Additional notes about this certification..."
              />
            </div>
            
            <div className="flex gap-sm">
              <Button onClick={handleAdd} disabled={saving || !formData.name || !formData.issuing_organization}>
                <Save className="h-icon-xs w-icon-xs mr-sm" />
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
      <div className="stack-md">
        {certifications.length === 0 ? (
          <Card>
            <div className="p-xl text-center color-muted">
              <Award className="h-icon-2xl w-icon-2xl mx-auto mb-md opacity-50" />
              <p>No certifications added yet.</p>
              <p className="text-body-sm">Add your professional certifications to showcase your expertise.</p>
            </div>
          </Card>
        ) : (
          certifications.map((cert: any) => (
            <Card key={cert.id}>
              <div className="p-md">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-sm mb-sm">
                      <h4 className="form-label">{cert.name}</h4>
                      <Badge variant={getStatusColor(cert.status, cert.expiry_date)}>
                        {getStatusText(cert.status, cert.expiry_date)}
                      </Badge>
                    </div>
                    
                    <p className="text-body-sm color-muted mb-sm">
                      Issued by {cert.issuing_organization}
                    </p>
                    
                    {cert.certification_number && (
                      <p className="text-body-sm">
                        <span className="form-label">Number:</span> {cert.certification_number}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-md text-body-sm color-muted mt-sm">
                      {cert.issue_date && (
                        <div className="flex items-center gap-xs">
                          <Calendar className="h-3 w-3" />
                          Issued: {new Date(cert.issue_date).toLocaleDateString()}
                        </div>
                      )}
                      {cert.expiry_date && (
                        <div className="flex items-center gap-xs">
                          <Calendar className="h-3 w-3" />
                          Expires: {new Date(cert.expiry_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    {cert.notes && (
                      <p className="text-body-sm mt-sm color-muted">{cert.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-sm">
                    {cert.verification_url && (
                      <Button
                       
                        variant="outline"
                        onClick={() => window.open(cert.verification_url, '_blank')}
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                    <Button
                     
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
