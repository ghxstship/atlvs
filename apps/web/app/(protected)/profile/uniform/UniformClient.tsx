'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useTranslations } from 'next-intl';
import { createBrowserClient } from '@ghxstship/auth';
import { Card, Badge, Button, Input, Textarea, Select, Drawer } from '@ghxstship/ui';
import { 
  Shirt, 
  Edit, 
  Save, 
  Plus,
  Package,
  Calendar,
  Ruler,
  Trash2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const uniformItemSchema = z.object({
  item_type: z.enum(['shirt', 'pants', 'jacket', 'hat', 'shoes', 'accessories', 'safety-gear', 'other']),
  item_name: z.string().min(1, 'Item name is required'),
  brand: z.string().optional(),
  size: z.string().min(1, 'Size is required'),
  color: z.string().optional(),
  material: z.string().optional(),
  condition: z.enum(['new', 'excellent', 'good', 'fair', 'poor', 'needs-replacement']),
  purchase_date: z.string().optional(),
  cost: z.number().optional(),
  supplier: z.string().optional(),
  care_instructions: z.string().optional(),
  replacement_due: z.string().optional(),
  is_required: z.boolean().default(false),
  notes: z.string().optional()
});

type UniformItemForm = z.infer<typeof uniformItemSchema>;

interface UniformItem {
  id: string;
  item_type: string;
  item_name: string;
  brand?: string;
  size: string;
  color?: string;
  material?: string;
  condition: string;
  purchase_date?: string;
  cost?: number;
  supplier?: string;
  care_instructions?: string;
  replacement_due?: string;
  is_required: boolean;
  notes?: string;
  created_at: string;
}

export default function UniformClient({ orgId, userId }: { orgId: string; userId: string }) {
  const t = useTranslations('profile');
  const sb = createBrowserClient();
  
  const [uniformItems, setUniformItems] = useState<UniformItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<UniformItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  const form = useForm<UniformItemForm>({
    resolver: zodResolver(uniformItemSchema),
    defaultValues: {
      item_type: 'shirt',
      item_name: '',
      brand: '',
      size: '',
      color: '',
      material: '',
      condition: 'new',
      purchase_date: '',
      cost: 0,
      supplier: '',
      care_instructions: '',
      replacement_due: '',
      is_required: false,
      notes: ''
    }
  });

  useEffect(() => {
    loadUniformItems();
  }, [orgId, userId]);

  const loadUniformItems = async () => {
    try {
      setLoading(true);
      
      // Mock uniform items data
      const mockItems: UniformItem[] = [
        {
          id: '1',
          item_type: 'shirt',
          item_name: 'Maritime Officer Dress Shirt',
          brand: 'Nautical Wear Co.',
          size: 'L',
          color: 'Navy Blue',
          material: 'Cotton Blend',
          condition: 'excellent',
          purchase_date: '2024-01-15',
          cost: 85,
          supplier: 'Maritime Uniform Supply',
          care_instructions: 'Machine wash cold, hang dry',
          is_required: true,
          notes: 'Standard dress uniform for formal occasions',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          item_type: 'pants',
          item_name: 'Maritime Officer Trousers',
          brand: 'Nautical Wear Co.',
          size: '34W x 32L',
          color: 'Navy Blue',
          material: 'Wool Blend',
          condition: 'good',
          purchase_date: '2024-01-15',
          cost: 120,
          supplier: 'Maritime Uniform Supply',
          care_instructions: 'Dry clean only',
          replacement_due: '2025-01-15',
          is_required: true,
          notes: 'Matching trousers for dress uniform',
          created_at: '2024-01-15T10:00:00Z'
        },
        {
          id: '3',
          item_type: 'safety-gear',
          item_name: 'Life Jacket - Type III',
          brand: 'SafeSea Marine',
          size: 'Adult Universal',
          color: 'Orange',
          material: 'Nylon with Foam',
          condition: 'excellent',
          purchase_date: '2023-12-01',
          cost: 65,
          supplier: 'Marine Safety Equipment',
          care_instructions: 'Rinse with fresh water after use',
          replacement_due: '2028-12-01',
          is_required: true,
          notes: 'Coast Guard approved, required for all maritime operations',
          created_at: '2023-12-01T14:30:00Z'
        },
        {
          id: '4',
          item_type: 'hat',
          item_name: 'Captain\'s Cap',
          brand: 'Maritime Traditions',
          size: '7 1/4',
          color: 'Navy Blue with Gold',
          material: 'Wool with Gold Braid',
          condition: 'excellent',
          purchase_date: '2023-08-20',
          cost: 150,
          supplier: 'Officer Uniform Specialists',
          care_instructions: 'Professional cleaning only',
          is_required: false,
          notes: 'Ceremonial cap for special occasions',
          created_at: '2023-08-20T09:00:00Z'
        }
      ];
      
      setUniformItems(mockItems);
    } catch (error) {
      console.error('Error loading uniform items:', error);
    } finally {
      setLoading(false);
    }
  };

  const onSubmit = async (data: UniformItemForm) => {
    setSaving(true);
    try {
      if (editingItem) {
        // Update existing item
        const updatedItems = uniformItems.map(item =>
          item.id === editingItem.id
            ? { ...item, ...data }
            : item
        );
        setUniformItems(updatedItems);
      } else {
        // Create new item
        const newItem: UniformItem = {
          id: Date.now().toString(),
          ...data,
          created_at: new Date().toISOString()
        };
        setUniformItems([newItem, ...uniformItems]);
      }

      // Log activity
      await sb
        .from('user_profile_activity')
        .insert({
          user_id: userId,
          organization_id: orgId,
          activity_type: editingItem ? 'uniform_item_updated' : 'uniform_item_added',
          activity_description: editingItem 
            ? `Updated uniform item: ${data.item_name}`
            : `Added new uniform item: ${data.item_name}`,
          performed_by: userId
        });

      setDrawerOpen(false);
      setEditingItem(null);
      form.reset();
    } catch (error) {
      console.error('Error saving uniform item:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item: UniformItem) => {
    setEditingItem(item);
    form.reset({
      item_type: item.item_type as any,
      item_name: item.item_name,
      brand: item.brand || '',
      size: item.size,
      color: item.color || '',
      material: item.material || '',
      condition: item.condition as any,
      purchase_date: item.purchase_date || '',
      cost: item.cost || 0,
      supplier: item.supplier || '',
      care_instructions: item.care_instructions || '',
      replacement_due: item.replacement_due || '',
      is_required: item.is_required,
      notes: item.notes || ''
    });
    setDrawerOpen(true);
  };

  const handleDelete = async (itemId: string) => {
    if (confirm('Are you sure you want to delete this uniform item?')) {
      const item = uniformItems.find(i => i.id === itemId);
      setUniformItems(uniformItems.filter(i => i.id !== itemId));
      
      // Log activity
      if (item) {
        await sb
          .from('user_profile_activity')
          .insert({
            user_id: userId,
            organization_id: orgId,
            activity_type: 'uniform_item_deleted',
            activity_description: `Deleted uniform item: ${item.item_name}`,
            performed_by: userId
          });
      }
    }
  };

  const getItemTypeIcon = (type: string) => {
    const icons = {
      shirt: Shirt,
      pants: Package,
      jacket: Shirt,
      hat: Package,
      shoes: Package,
      accessories: Package,
      'safety-gear': AlertCircle,
      other: Package
    };
    return icons[type as keyof typeof icons] || Package;
  };

  const getItemTypeColor = (type: string) => {
    const colors = {
      shirt: 'blue',
      pants: 'green',
      jacket: 'purple',
      hat: 'orange',
      shoes: 'red',
      accessories: 'pink',
      'safety-gear': 'yellow',
      other: 'gray'
    };
    return colors[type as keyof typeof colors] || 'gray';
  };

  const getConditionColor = (condition: string) => {
    const colors = {
      new: 'success',
      excellent: 'success',
      good: 'primary',
      fair: 'warning',
      poor: 'destructive',
      'needs-replacement': 'destructive'
    };
    return colors[condition as keyof typeof colors] || 'secondary';
  };

  const formatItemType = (type: string) => {
    return type.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const formatCondition = (condition: string) => {
    return condition.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  const calculateTotalValue = () => {
    return uniformItems.reduce((total, item) => total + (item.cost || 0), 0);
  };

  const getItemsNeedingReplacement = () => {
    const today = new Date();
    return uniformItems.filter(item => {
      if (!item.replacement_due) return false;
      const replacementDate = new Date(item.replacement_due);
      const daysUntilReplacement = Math.ceil((replacementDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilReplacement <= 30;
    });
  };

  const filteredItems = filterType === 'all' 
    ? uniformItems 
    : filterType === 'required'
    ? uniformItems.filter(item => item.is_required)
    : uniformItems.filter(item => item.item_type === filterType);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-secondary rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-32 bg-secondary rounded"></div>
            <div className="h-32 bg-secondary rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-heading-4 text-heading-4">Uniform & Equipment</h2>
        <Button 
          onClick={() => {
            setEditingItem(null);
            form.reset();
            setDrawerOpen(true);
          }}
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          Add Uniform Item
        </Button>
      </div>

      {/* Uniform Summary */}
      {uniformItems.length > 0 && (
        <Card>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="h-5 w-5 color-primary" />
              <h3 className="text-body text-heading-4">Uniform Summary</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-heading-3 text-heading-3 color-primary">{uniformItems.length}</div>
                <div className="text-body-sm color-muted">Total Items</div>
              </div>
              <div className="text-center">
                <div className="text-heading-3 text-heading-3 color-success">
                  {uniformItems.filter(item => item.is_required).length}
                </div>
                <div className="text-body-sm color-muted">Required Items</div>
              </div>
              <div className="text-center">
                <div className="text-heading-3 text-heading-3 color-warning">
                  {getItemsNeedingReplacement().length}
                </div>
                <div className="text-body-sm color-muted">Need Replacement</div>
              </div>
              <div className="text-center">
                <div className="text-heading-3 text-heading-3 color-secondary">
                  ${calculateTotalValue().toLocaleString()}
                </div>
                <div className="text-body-sm color-muted">Total Value</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {['all', 'required', 'shirt', 'pants', 'jacket', 'hat', 'shoes', 'safety-gear', 'accessories', 'other'].map((type) => (
          <Button
            key={type}
            variant={filterType === type ? 'primary' : 'outline'}
           
            onClick={() => setFilterType(type)}
          >
            {type === 'all' ? 'All Items' : 
             type === 'required' ? 'Required' : 
             formatItemType(type)}
          </Button>
        ))}
      </div>

      {filteredItems.length === 0 ? (
        <Card>
          <div className="p-8 text-center">
            <Shirt className="h-12 w-12 color-muted mx-auto mb-4" />
            <h3 className="text-body text-heading-4 mb-2">No Uniform Items</h3>
            <p className="color-muted mb-4">
              Keep track of your uniform items, equipment, and their maintenance schedules.
            </p>
            <Button 
              onClick={() => {
                setEditingItem(null);
                form.reset();
                setDrawerOpen(true);
              }}
            >
              Add Your First Item
            </Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const IconComponent = getItemTypeIcon(item.item_type);
            const needsReplacement = item.replacement_due && 
              new Date(item.replacement_due) <= new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
            
            return (
              <Card key={item.id}>
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`h-10 w-10 bg-${getItemTypeColor(item.item_type)}-100 rounded-full flex items-center justify-center`}>
                        <IconComponent className={`h-5 w-5 text-${getItemTypeColor(item.item_type)}-600`} />
                      </div>
                      <div>
                        <h3 className="text-heading-4">{item.item_name}</h3>
                        {item.brand && (
                          <p className="text-body-sm color-muted">{item.brand}</p>
                        )}
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {formatItemType(item.item_type)}
                          </Badge>
                          <Badge variant={getConditionColor(item.condition) as any}>
                            {formatCondition(item.condition)}
                          </Badge>
                          {item.is_required && (
                            <Badge variant="primary">Required</Badge>
                          )}
                          {needsReplacement && (
                            <Badge variant="destructive">Replacement Due</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                       
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                       
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <h4 className="text-body-sm form-label mb-1">Size & Details</h4>
                      <div className="flex items-center gap-1 text-body-sm color-muted">
                        <Ruler className="h-4 w-4" />
                        Size: {item.size}
                      </div>
                      {item.color && (
                        <p className="text-body-sm color-muted">Color: {item.color}</p>
                      )}
                      {item.material && (
                        <p className="text-body-sm color-muted">Material: {item.material}</p>
                      )}
                    </div>

                    {(item.purchase_date || item.cost) && (
                      <div>
                        <h4 className="text-body-sm form-label mb-1">Purchase Info</h4>
                        {item.purchase_date && (
                          <div className="flex items-center gap-1 text-body-sm color-muted">
                            <Calendar className="h-4 w-4" />
                            {new Date(item.purchase_date).toLocaleDateString()}
                          </div>
                        )}
                        {item.cost && (
                          <p className="text-body-sm color-muted">Cost: ${item.cost}</p>
                        )}
                        {item.supplier && (
                          <p className="text-body-sm color-muted">Supplier: {item.supplier}</p>
                        )}
                      </div>
                    )}

                    {item.replacement_due && (
                      <div>
                        <h4 className="text-body-sm form-label mb-1">Replacement</h4>
                        <div className="flex items-center gap-1 text-body-sm color-muted">
                          <Calendar className="h-4 w-4" />
                          Due: {new Date(item.replacement_due).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>

                  {item.care_instructions && (
                    <div className="mb-4 p-3 bg-secondary rounded-lg">
                      <h4 className="text-body-sm form-label mb-1">Care Instructions</h4>
                      <p className="text-body-sm color-muted">{item.care_instructions}</p>
                    </div>
                  )}

                  {item.notes && (
                    <div className="mb-4 p-3 bg-secondary rounded-lg">
                      <h4 className="text-body-sm form-label mb-1">Notes</h4>
                      <p className="text-body-sm color-muted">{item.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={editingItem ? 'Edit Uniform Item' : 'Add New Uniform Item'}
        description={editingItem ? 'Update uniform item details' : 'Add a new uniform or equipment item'}
      >
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              {...form.register('item_type')}
            >
              <option value="shirt">Shirt</option>
              <option value="pants">Pants</option>
              <option value="jacket">Jacket</option>
              <option value="hat">Hat</option>
              <option value="shoes">Shoes</option>
              <option value="accessories">Accessories</option>
              <option value="safety-gear">Safety Gear</option>
              <option value="other">Other</option>
            </Select>

            <Select
              {...form.register('condition')}
            >
              <option value="new">New</option>
              <option value="excellent">Excellent</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="poor">Poor</option>
              <option value="needs-replacement">Needs Replacement</option>
            </Select>
          </div>

          <Input
            label="Item Name"
            placeholder="Enter item name"
            {...form.register('item_name')}
           
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Brand"
              placeholder="Brand or manufacturer"
              {...form.register('brand')}
             
            />

            <Input
              label="Size"
              placeholder="Size (e.g., L, 34W x 32L)"
              {...form.register('size')}
             
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Color"
              placeholder="Color or pattern"
              {...form.register('color')}
             
            />

            <Input
              label="Material"
              placeholder="Material composition"
              {...form.register('material')}
             
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Input
              label="Purchase Date"
              type="date"
              {...form.register('purchase_date')}
             
            />

            <Input
              label="Cost ($)"
              type="number"
              placeholder="0"
              {...form.register('cost', { valueAsNumber: true })}
             
            />

            <Input
              label="Replacement Due"
              type="date"
              {...form.register('replacement_due')}
             
            />
          </div>

          <Input
            label="Supplier"
            placeholder="Supplier or vendor"
            {...form.register('supplier')}
           
          />

          <Textarea
            label="Care Instructions"
            placeholder="How to clean and maintain this item"
            {...form.register('care_instructions')}
           
            rows={2}
          />

          <Textarea
            label="Notes"
            placeholder="Additional notes or specifications"
            {...form.register('notes')}
           
            rows={2}
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_required"
              {...form.register('is_required')}
              className="rounded border-border"
            />
            <label htmlFor="is_required" className="text-body-sm form-label">
              This is a required uniform item
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDrawerOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={saving}>
              <Save className="h-4 w-4 mr-2" />
              {editingItem ? 'Update' : 'Save'} Item
            </Button>
          </div>
        </form>
      </Drawer>
    </div>
  );
}
