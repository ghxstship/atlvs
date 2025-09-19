'use client';


import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
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
          <h2 className="text-heading-3">Health Information</h2>
          <p className="color-muted">Manage your medical and health details</p>
        </div>
        {!isEditing && (
          <Button onClick={() => setIsEditing(true)}>
            <Edit2 className="w-4 h-4 mr-sm" />
            Edit
          </Button>
        )}
      </div>

      {/* Basic Health Info */}
      <Card>
        <CardHeader>
          <h3 className="text-heading-4 flex items-center">
            <Heart className="w-5 h-5 mr-sm color-destructive" />
            Basic Information
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <div>
              <label className="block text-body-sm form-label color-foreground mb-xs">Blood Type</label>
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
            <UnifiedInput               label="Height"
              value={formData.height || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, height: e.target.value })}
              placeholder="e.g., 5'10&quot; or 178cm"
              disabled={!isEditing}
            />
            <UnifiedInput               label="Weight"
              value={formData.weight || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, weight: e.target.value })}
              placeholder="e.g., 165 lbs or 75kg"
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Allergies */}
      <Card>
        <CardHeader>
          <h3 className="text-heading-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-sm color-warning" />
            Allergies
          </h3>
        </CardHeader>
        <CardContent>
          <div className="stack-sm">
            <div className="flex flex-wrap gap-sm">
              {(formData.allergies || []).map((allergy, index) => (
                <Badge key={index} variant="destructive">
                  {allergy}
                  {isEditing && (
                    <button
                      onClick={() => removeAllergy(index)}
                      className="ml-sm hover:text-background"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-sm">
                <UnifiedInput                   value={newAllergy}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAllergy(e.target.value)}
                  placeholder="Add allergy..."
                  onKeyPress={(e: any) => e.key === 'Enter' && addAllergy()}
                />
                <Button>
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
          <h3 className="text-heading-4 flex items-center">
            <Pill className="w-5 h-5 mr-sm color-primary" />
            Current Medications
          </h3>
        </CardHeader>
        <CardContent>
          <div className="stack-sm">
            {(formData.medications || []).map((med, index) => (
              <div key={index} className="p-sm bg-secondary rounded-lg">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-body-sm">{med.name}</p>
                    <p className="text-body-sm color-muted">
                      {med.dosage} - {med.frequency}
                    </p>
                    {med.reason && (
                      <p className="text-body-sm color-muted">Reason: {med.reason}</p>
                    )}
                  </div>
                  {isEditing && (
                    <Button
                      variant="ghost"
                     
                      onClick={() => removeMedication(index)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
            {isEditing && (
              <div className="stack-sm p-sm border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  <UnifiedInput                     placeholder="Medication name"
                    value={newMedication.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMedication({ ...newMedication, name: e.target.value })}
                  />
                  <UnifiedInput                     placeholder="Dosage"
                    value={newMedication.dosage}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMedication({ ...newMedication, dosage: e.target.value })}
                  />
                  <UnifiedInput                     placeholder="Frequency"
                    value={newMedication.frequency}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMedication({ ...newMedication, frequency: e.target.value })}
                  />
                  <UnifiedInput                     placeholder="Reason (optional)"
                    value={newMedication.reason}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewMedication({ ...newMedication, reason: e.target.value })}
                  />
                </div>
                <Button>
                  <Plus className="w-4 h-4 mr-sm" />
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
          <h3 className="text-heading-4 flex items-center">
            <Activity className="w-5 h-5 mr-sm color-secondary" />
            Medical Conditions
          </h3>
        </CardHeader>
        <CardContent>
          <div className="stack-sm">
            <div className="flex flex-wrap gap-sm">
              {(formData.medical_conditions || []).map((condition, index) => (
                <Badge key={index} variant="outline">
                  {condition}
                  {isEditing && (
                    <button
                      onClick={() => removeCondition(index)}
                      className="ml-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-sm">
                <UnifiedInput                   value={newCondition}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCondition(e.target.value)}
                  placeholder="Add medical condition..."
                  onKeyPress={(e: any) => e.key === 'Enter' && addCondition()}
                />
                <Button>
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
          <h3 className="text-body text-heading-4">Dietary Restrictions</h3>
        </CardHeader>
        <CardContent>
          <div className="stack-sm">
            <div className="flex flex-wrap gap-sm">
              {(formData.dietary_restrictions || []).map((restriction, index) => (
                <Badge key={index} variant="secondary">
                  {restriction}
                  {isEditing && (
                    <button
                      onClick={() => removeRestriction(index)}
                      className="ml-sm"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-sm">
                <UnifiedInput                   value={newRestriction}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewRestriction(e.target.value)}
                  placeholder="Add dietary restriction..."
                  onKeyPress={(e: any) => e.key === 'Enter' && addRestriction()}
                />
                <Button>
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
          <h3 className="text-body text-heading-4">Insurance & Physician</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
            <UnifiedInput               label="Insurance Provider"
              value={formData.insurance_provider || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, insurance_provider: e.target.value })}
              disabled={!isEditing}
            />
            <UnifiedInput               label="Policy Number"
              value={formData.insurance_policy_number || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, insurance_policy_number: e.target.value })}
              disabled={!isEditing}
            />
            <UnifiedInput               label="Primary Physician"
              value={formData.physician_name || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, physician_name: e.target.value })}
              disabled={!isEditing}
            />
            <UnifiedInput               label="Physician Phone"
              type="tel"
              value={formData.physician_phone || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, physician_phone: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Emergency Notes */}
      <Card>
        <CardHeader>
          <h3 className="text-body text-heading-4">Emergency Notes</h3>
        </CardHeader>
        <CardContent>
          <Textarea
            value={formData.emergency_notes || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, emergency_notes: e.target.value })}
            placeholder="Any additional information for emergency responders..."
            rows={4}
            disabled={!isEditing}
          />
        </CardContent>
      </Card>

      {isEditing && (
        <div className="flex justify-end cluster-sm">
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
            <Save className="w-4 h-4 mr-sm" />
            Save Health Information
          </Button>
        </div>
      )}
    </div>
  );
}
