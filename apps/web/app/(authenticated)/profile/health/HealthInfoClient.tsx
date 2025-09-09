'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button, Input, Select, Textarea, Card, CardHeader, CardContent, Badge } from '@ghxstship/ui';
import { Heart, Activity, Pill, AlertCircle, Save, Plus, X, Edit2, Trash2 } from 'lucide-react';
import { useToast } from '@ghxstship/ui';

interface HealthInfo {
  id: string;
  blood_type?: string;
  height?: string;
  weight?: string;
  allergies: string[];
  medications: Medication[];
  medical_conditions: string[];
  dietary_restrictions: string[];
  emergency_notes?: string;
  insurance_provider?: string;
  insurance_policy_number?: string;
  physician_name?: string;
  physician_phone?: string;
  last_updated?: string;
}

interface Medication {
  name: string;
  dosage: string;
  frequency: string;
  reason?: string;
}

export default function HealthInfoClient() {
  const [healthInfo, setHealthInfo] = useState<HealthInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<HealthInfo>>({});
  const [newAllergy, setNewAllergy] = useState('');
  const [newCondition, setNewCondition] = useState('');
  const [newRestriction, setNewRestriction] = useState('');
  const [newMedication, setNewMedication] = useState<Medication>({
    name: '',
    dosage: '',
    frequency: '',
    reason: '',
  });
  const { addToast } = useToast();
  const supabase = createClient();

  useEffect(() => {
    fetchHealthInfo();
  }, []);

  const fetchHealthInfo = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('health_info')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setHealthInfo(data);
        setFormData(data);
      } else {
        setFormData({
          allergies: [],
          medications: [],
          medical_conditions: [],
          dietary_restrictions: [],
        });
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching health info:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load health information',
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
        last_updated: new Date().toISOString(),
      };

      if (healthInfo?.id) {
        const { error } = await supabase
          .from('health_info')
          .update(dataToSave)
          .eq('id', healthInfo.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('health_info')
          .insert(dataToSave);

        if (error) throw error;
      }

      addToast({
        type: 'success',
        title: 'Success',
        description: 'Health information saved successfully',
      });
      
      setIsEditing(false);
      fetchHealthInfo();
    } catch (error) {
      console.error('Error saving health info:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save health information',
      });
    }
  };

  const addAllergy = () => {
    if (newAllergy.trim()) {
      setFormData({
        ...formData,
        allergies: [...(formData.allergies || []), newAllergy.trim()],
      });
      setNewAllergy('');
    }
  };

  const removeAllergy = (index: number) => {
    const allergies = [...(formData.allergies || [])];
    allergies.splice(index, 1);
    setFormData({ ...formData, allergies });
  };

  const addCondition = () => {
    if (newCondition.trim()) {
      setFormData({
        ...formData,
        medical_conditions: [...(formData.medical_conditions || []), newCondition.trim()],
      });
      setNewCondition('');
    }
  };

  const removeCondition = (index: number) => {
    const conditions = [...(formData.medical_conditions || [])];
    conditions.splice(index, 1);
    setFormData({ ...formData, medical_conditions: conditions });
  };

  const addRestriction = () => {
    if (newRestriction.trim()) {
      setFormData({
        ...formData,
        dietary_restrictions: [...(formData.dietary_restrictions || []), newRestriction.trim()],
      });
      setNewRestriction('');
    }
  };

  const removeRestriction = (index: number) => {
    const restrictions = [...(formData.dietary_restrictions || [])];
    restrictions.splice(index, 1);
    setFormData({ ...formData, dietary_restrictions: restrictions });
  };

  const addMedication = () => {
    if (newMedication.name && newMedication.dosage && newMedication.frequency) {
      setFormData({
        ...formData,
        medications: [...(formData.medications || []), newMedication],
      });
      setNewMedication({ name: '', dosage: '', frequency: '', reason: '' });
    }
  };

  const removeMedication = (index: number) => {
    const medications = [...(formData.medications || [])];
    medications.splice(index, 1);
    setFormData({ ...formData, medications });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-32" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Health Information</h2>
          <p className="text-muted-foreground">Manage your medical and health details</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-2" />
            Edit
          </Button>
        )}
      </div>

      {/* Basic Health Info */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold flex items-center">
            <Heart className="w-5 h-5 mr-2 text-red-500" />
            Basic Information
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Blood Type</label>
              <Select
                value={formData.blood_type || ''}
                onValueChange={(value: string) => setFormData({ ...formData, blood_type: value })}
                disabled={!isEditing}
              >
              <option value="">Select...</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </Select>
            </div>
            <Input
              label="Height"
              value={formData.height || ''}
              onChange={(e) => setFormData({ ...formData, height: e.target.value })}
              placeholder="e.g., 5'10&quot; or 178cm"
              disabled={!isEditing}
            />
            <Input
              label="Weight"
              value={formData.weight || ''}
              onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="e.g., 165 lbs or 75kg"
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-orange-500" />
            Allergies
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(formData.allergies || []).map((allergy, index) => (
                <Badge key={index} variant="destructive">
                  {allergy}
                  {isEditing && (
                    <button
                      onClick={() => removeAllergy(index)}
                      className="ml-2 hover:text-white"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newAllergy}
                  onChange={(e) => setNewAllergy(e.target.value)}
                  placeholder="Add allergy..."
                  onKeyPress={(e) => e.key === 'Enter' && addAllergy()}
                />
                <Button onClick={addAllergy} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medications */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold flex items-center">
            <Pill className="w-5 h-5 mr-2 text-blue-500" />
            Current Medications
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {(formData.medications || []).map((med, index) => (
              <div key={index} className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold">{med.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {med.dosage} - {med.frequency}
                    </p>
                    {med.reason && (
                      <p className="text-sm text-muted-foreground">Reason: {med.reason}</p>
                    )}
                  </div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMedication(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isEditing && (
              <div className="space-y-2 p-3 border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <Input
                    placeholder="Medication name"
                    value={newMedication.name}
                    onChange={(e) => setNewMedication({ ...newMedication, name: e.target.value })}
                  />
                  <Input
                    placeholder="Dosage"
                    value={newMedication.dosage}
                    onChange={(e) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  />
                  <Input
                    placeholder="Frequency"
                    value={newMedication.frequency}
                    onChange={(e) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                  />
                  <Input
                    placeholder="Reason (optional)"
                    value={newMedication.reason}
                    onChange={(e) => setNewMedication({ ...newMedication, reason: e.target.value })}
                  />
                </div>
                <Button onClick={addMedication} size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Medication
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Medical Conditions */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold flex items-center">
            <Activity className="w-5 h-5 mr-2 text-purple-500" />
            Medical Conditions
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(formData.medical_conditions || []).map((condition, index) => (
                <Badge key={index} variant="outline">
                  {condition}
                  {isEditing && (
                    <button
                      onClick={() => removeCondition(index)}
                      className="ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newCondition}
                  onChange={(e) => setNewCondition(e.target.value)}
                  placeholder="Add medical condition..."
                  onKeyPress={(e) => e.key === 'Enter' && addCondition()}
                />
                <Button onClick={addCondition} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Dietary Restrictions */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Dietary Restrictions</h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {(formData.dietary_restrictions || []).map((restriction, index) => (
                <Badge key={index} variant="secondary">
                  {restriction}
                  {isEditing && (
                    <button
                      onClick={() => removeRestriction(index)}
                      className="ml-2"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-2">
                <Input
                  value={newRestriction}
                  onChange={(e) => setNewRestriction(e.target.value)}
                  placeholder="Add dietary restriction..."
                  onKeyPress={(e) => e.key === 'Enter' && addRestriction()}
                />
                <Button onClick={addRestriction} size="sm">
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Insurance & Physician Info */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Insurance & Physician</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Insurance Provider"
              value={formData.insurance_provider || ''}
              onChange={(e) => setFormData({ ...formData, insurance_provider: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              label="Policy Number"
              value={formData.insurance_policy_number || ''}
              onChange={(e) => setFormData({ ...formData, insurance_policy_number: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              label="Primary Physician"
              value={formData.physician_name || ''}
              onChange={(e) => setFormData({ ...formData, physician_name: e.target.value })}
              disabled={!isEditing}
            />
            <Input
              label="Physician Phone"
              type="tel"
              value={formData.physician_phone || ''}
              onChange={(e) => setFormData({ ...formData, physician_phone: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Notes */}
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Emergency Notes</h3>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.emergency_notes || ''}
            onChange={(e) => setFormData({ ...formData, emergency_notes: e.target.value })}
            placeholder="Any additional information for emergency responders..."
            rows={4}
            disabled={!isEditing}
          />
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end space-x-2">
          <Button
            variant="outline"
            onClick={() => {
              setIsEditing(false);
              setFormData(healthInfo || {});
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Health Information
          </Button>
        </div>
      )}
    </div>
  );
}
