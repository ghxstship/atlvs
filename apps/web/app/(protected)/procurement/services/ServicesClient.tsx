'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Button, Input, Card, Badge } from '@ghxstship/ui';
import { Plus, Save, Wrench, DollarSign, Edit, Trash2, Search, Clock } from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  category: string;
  rate: number;
  currency: string;
  unit: string;
  supplier?: string;
  status: 'active' | 'inactive' | 'discontinued';
  created_at: string;
  updated_at: string;
}

export default function ServicesClient({ orgId }: { orgId: string }) {
  const t = useTranslations('procurement');
  const sb = createBrowserClient();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  type ServiceStatus = 'active' | 'inactive' | 'discontinued';
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    rate: 0,
    currency: 'USD',
    unit: 'hour',
    supplier: '',
    status: 'active' as ServiceStatus
  });

  useEffect(() => {
    loadServices();
  }, [orgId]);

  useEffect(() => {
    filterServices();
  }, [services, searchQuery]);

  const loadServices = async () => {
    try {
      setLoading(true);
      
      const { data: servicesData } = await sb
        .from('services')
        .select('*')
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      setServices(servicesData || []);
    } catch (error) {
      console.error('Error loading services:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterServices = () => {
    if (!searchQuery.trim()) {
      setFilteredServices(services);
      return;
    }

    const filtered = services.filter(service =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.unit.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.supplier?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredServices(filtered);
  };

  const handleCreate = async () => {
    try {
      setSaving(true);
      
      const { error } = await sb
        .from('services')
        .insert({
          ...formData,
          organization_id: orgId
        });

      if (error) throw error;
      
      resetForm();
      setShowCreateForm(false);
      await loadServices();
    } catch (error) {
      console.error('Error creating service:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async () => {
    if (!editingService) return;
    
    try {
      setSaving(true);
      
      const { error } = await sb
        .from('services')
        .update(formData)
        .eq('id', editingService.id);

      if (error) throw error;
      
      resetForm();
      setEditingService(null);
      await loadServices();
    } catch (error) {
      console.error('Error updating service:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (serviceId: string) => {
    try {
      const { error } = await sb
        .from('services')
        .delete()
        .eq('id', serviceId);

      if (error) throw error;
      await loadServices();
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      rate: 0,
      currency: 'USD',
      unit: 'hour',
      supplier: '',
      status: 'active'
    });
  };

  const startEdit = (service: Service) => {
    setFormData({
      name: service.name,
      description: service.description,
      category: service.category,
      rate: service.rate,
      currency: service.currency,
      unit: service.unit,
      supplier: service.supplier || '',
      status: service.status
    });
    setEditingService(service);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'discontinued': return 'destructive';
      default: return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-secondary rounded w-3/4"></div>
          <div className="h-4 bg-secondary rounded w-1/2"></div>
          <div className="h-4 bg-secondary rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wrench className="h-5 w-5" />
          <h3 className="text-heading-4">Services Catalog</h3>
        </div>
        <Button onClick={() => setShowCreateForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 color-muted" />
        <Input
          placeholder="Search services by name, category, unit, or supplier..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Create/Edit Form */}
      {(showCreateForm || editingService) && (
        <Card>
          <div className="p-4">
            <h4 className="form-label mb-4">
              {editingService ? 'Edit Service' : 'Add New Service'}
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <label className="text-body-sm form-label">Service Name *</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Service name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-body-sm form-label">Category</label>
                <Input
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Consulting, Development, Design, etc."
                />
              </div>
              
              <div className="space-y-2 md:col-span-2">
                <label className="text-body-sm form-label">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                  rows={3}
                  placeholder="Service description..."
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-body-sm form-label">Rate *</label>
                <Input
                  type="number"
                  step="0.01"
                  value={formData.rate}
                  onChange={(e) => setFormData(prev => ({ ...prev, rate: parseFloat(e.target.value) || 0 }))}
                  placeholder="0.00"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-body-sm form-label">Currency</label>
                <select 
                  value={formData.currency} 
                  onChange={(e) => setFormData(prev => ({ ...prev, currency: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-body-sm form-label">Unit</label>
                <select 
                  value={formData.unit} 
                  onChange={(e) => setFormData(prev => ({ ...prev, unit: e.target.value }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="hour">Hour</option>
                  <option value="day">Day</option>
                  <option value="week">Week</option>
                  <option value="month">Month</option>
                  <option value="project">Project</option>
                  <option value="fixed">Fixed Price</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-body-sm form-label">Supplier</label>
                <Input
                  value={formData.supplier}
                  onChange={(e) => setFormData(prev => ({ ...prev, supplier: e.target.value }))}
                  placeholder="Service provider name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-body-sm form-label">Status</label>
                <select 
                  value={formData.status} 
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as ServiceStatus }))}
                  className="w-full px-3 py-2 border border-input bg-background rounded-md"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="discontinued">Discontinued</option>
                </select>
              </div>
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={editingService ? handleUpdate : handleCreate} 
                disabled={saving || !formData.name}
              >
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : (editingService ? 'Update Service' : 'Add Service')}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  resetForm();
                  setShowCreateForm(false);
                  setEditingService(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.length === 0 ? (
          <div className="col-span-full">
            <Card>
              <div className="p-8 text-center color-muted">
                <Wrench className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{searchQuery ? 'No services found matching your search.' : 'No services in catalog.'}</p>
                <p className="text-body-sm">
                  {searchQuery ? 'Try adjusting your search terms.' : 'Add your first service to get started.'}
                </p>
              </div>
            </Card>
          </div>
        ) : (
          filteredServices.map((service) => (
            <Card key={service.id}>
              <div className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="form-label">{service.name}</h4>
                  <Badge variant={getStatusColor(service.status)}>
                    {service.status}
                  </Badge>
                </div>
                
                {service.category && (
                  <p className="text-body-sm color-muted mb-2 uppercase tracking-wide">
                    {service.category}
                  </p>
                )}
                
                <p className="text-body-sm color-muted mb-3 line-clamp-2">
                  {service.description}
                </p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1 text-body text-heading-4">
                    <DollarSign className="h-4 w-4" />
                    {service.rate.toLocaleString()} {service.currency}
                  </div>
                  <div className="flex items-center gap-1 text-body-sm color-muted">
                    <Clock className="h-3 w-3" />
                    per {service.unit}
                  </div>
                </div>
                
                {service.supplier && (
                  <div className="text-body-sm color-muted mb-3">
                    <strong>Provider:</strong> {service.supplier}
                  </div>
                )}
                
                <div className="flex items-center gap-2">
                  <Button
                   
                    variant="outline"
                    onClick={() => startEdit(service)}
                    className="flex-1"
                  >
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                  <Button
                   
                    variant="outline"
                    onClick={() => handleDelete(service.id)}
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
