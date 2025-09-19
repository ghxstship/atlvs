'use client';


import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button, UnifiedInput, Select, Card, CardHeader, CardContent } from '@ghxstship/ui';
import { Shirt, Save, Edit2 } from 'lucide-react';
import { useToast } from '@ghxstship/ui';

interface UniformSizing {
  id: string;
  shirt_size?: string;
  pants_size?: string;
  jacket_size?: string;
  shoe_size?: string;
  hat_size?: string;
  glove_size?: string;
  gender_fit?: string;
  special_requirements?: string;
  measurements?: {
    chest?: string;
    waist?: string;
    hips?: string;
    inseam?: string;
    sleeve?: string;
    neck?: string;
  };
}

export default function UniformSizingClient() {
  const [sizing, setSizing] = useState<UniformSizing | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UniformSizing>>({});
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchSizing();
  }, []);

  const fetchSizing = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('uniform_sizing')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setSizing(data);
        setFormData(data);
      } else {
        setFormData({
          measurements: {}
        });
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching uniform sizing:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load uniform sizing',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dataToSave = {
        ...formData,
        user_id: user.id,
      };

      if (sizing?.id) {
        const { error } = await supabase
          .from('uniform_sizing')
          .update(dataToSave)
          .eq('id', sizing.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('uniform_sizing')
          .insert(dataToSave);

        if (error) throw error;
      }

      addToast({
        type: 'success',
        title: 'Success',
        description: 'Uniform sizing saved successfully',
      });
      
      setIsEditing(false);
      fetchSizing();
    } catch (error) {
      console.error('Error saving uniform sizing:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save uniform sizing',
      });
    }
  };

  const updateMeasurement = (key: string, value: string) => {
    setFormData({
      ...formData,
      measurements: {
        ...(formData.measurements || {}),
        [key]: value,
      },
    });
  };

  if (loading) {
    return (
      <div className="stack-md">
        {[1, 2, 3].map(i => (
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
          <h2 className="text-heading-3">Uniform Sizing</h2>
          <p className="color-muted">Manage your uniform and clothing sizes</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-sm" />
            Edit Sizing
          </Button>
        ) : (
          <div className="cluster">
            <Button variant="outline" onClick={() => {
              setIsEditing(false);
              setFormData(sizing || {});
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-4 h-4 mr-sm" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Standard Sizes */}
      <Card>
        <CardHeader>
          <h3 className="text-heading-4 flex items-center">
            <Shirt className="w-5 h-5 mr-sm color-primary" />
            Standard Sizes
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <label className="text-body-sm form-label">Shirt Size</label>
            <Select
              value={formData.shirt_size || ''}
              onValueChange={(value: string) => setFormData({ ...formData, shirt_size: value })}
              disabled={!isEditing}
            >
              <option value="">Select...</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="2XL">2XL</option>
              <option value="3XL">3XL</option>
              <option value="4XL">4XL</option>
            </Select>
            <UnifiedInput               label="Pants Size"
              value={formData.pants_size || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, pants_size: e.target.value })}
              placeholder="e.g., 32x30"
              disabled={!isEditing}
            />
            <label className="text-body-sm form-label">Jacket Size</label>
            <Select
              value={formData.jacket_size || ''}
              onValueChange={(value: string) => setFormData({ ...formData, jacket_size: value })}
              disabled={!isEditing}
            >
              <option value="">Select...</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="2XL">2XL</option>
              <option value="3XL">3XL</option>
              <option value="4XL">4XL</option>
            </Select>
            <UnifiedInput               label="Shoe Size"
              value={formData.shoe_size || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, shoe_size: e.target.value })}
              placeholder="e.g., 10.5"
              disabled={!isEditing}
            />
            <UnifiedInput               label="Hat Size"
              value={formData.hat_size || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, hat_size: e.target.value })}
              placeholder="e.g., 7 1/4"
              disabled={!isEditing}
            />
            <label className="text-body-sm form-label">Glove Size</label>
            <Select
              value={formData.glove_size || ''}
              onValueChange={(value: string) => setFormData({ ...formData, glove_size: value })}
              disabled={!isEditing}
            >
              <option value="">Select...</option>
              <option value="XS">XS</option>
              <option value="S">S</option>
              <option value="M">M</option>
              <option value="L">L</option>
              <option value="XL">XL</option>
              <option value="2XL">2XL</option>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Fit Preference */}
      <Card>
        <CardHeader>
          <h3 className="text-body text-heading-4">Fit Preference</h3>
        </CardHeader>
        <CardContent>
          <label className="text-body-sm form-label">Gender Fit</label>
          <Select
            value={formData.gender_fit || ''}
            onValueChange={(value: string) => setFormData({ ...formData, gender_fit: value })}
            disabled={!isEditing}
          >
            <option value="">Select...</option>
            <option value="mens">Men's</option>
            <option value="womens">Women's</option>
            <option value="unisex">Unisex</option>
          </Select>
        </CardContent>
      </Card>

      {/* Detailed Measurements */}
      <Card>
        <CardHeader>
          <h3 className="text-body text-heading-4">Detailed Measurements</h3>
          <p className="text-body-sm color-muted">Optional measurements for custom fitting</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <UnifiedInput               label="Chest"
              value={formData.measurements?.chest || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMeasurement('chest', e.target.value)}
              placeholder="e.g., 42 inches"
              disabled={!isEditing}
            />
            <UnifiedInput               label="Waist"
              value={formData.measurements?.waist || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMeasurement('waist', e.target.value)}
              placeholder="e.g., 34 inches"
              disabled={!isEditing}
            />
            <UnifiedInput               label="Hips"
              value={formData.measurements?.hips || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMeasurement('hips', e.target.value)}
              placeholder="e.g., 40 inches"
              disabled={!isEditing}
            />
            <UnifiedInput               label="Inseam"
              value={formData.measurements?.inseam || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMeasurement('inseam', e.target.value)}
              placeholder="e.g., 30 inches"
              disabled={!isEditing}
            />
            <UnifiedInput               label="Sleeve Length"
              value={formData.measurements?.sleeve || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMeasurement('sleeve', e.target.value)}
              placeholder="e.g., 33 inches"
              disabled={!isEditing}
            />
            <UnifiedInput               label="Neck"
              value={formData.measurements?.neck || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateMeasurement('neck', e.target.value)}
              placeholder="e.g., 16 inches"
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Special Requirements */}
      <Card>
        <CardHeader>
          <h3 className="text-body text-heading-4">Special Requirements</h3>
        </CardHeader>
        <CardContent>
          <UnifiedInput             value={formData.special_requirements || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, special_requirements: e.target.value })}
            placeholder="Any special uniform requirements or notes..."
            disabled={!isEditing}
          />
        </CardContent>
      </Card>
    </div>
  );
}
