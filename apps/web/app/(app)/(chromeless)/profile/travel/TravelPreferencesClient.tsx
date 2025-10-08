'use client';


import React, { useState, useCallback, useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Plane, Hotel, Car, MapPin, Globe, Save, Plus, X } from 'lucide-react';
import { Badge, Button, Card, CardContent, CardHeader, Input, Select, useToast } from '@ghxstship/ui';

interface TravelPreferences {
  id: string;
  passport_number?: string;
  passport_expiry?: string;
  passport_country?: string;
  tsa_precheck?: string;
  global_entry?: string;
  known_traveler?: string;
  seat_preference?: string;
  meal_preference?: string;
  airline_preferences: string[];
  hotel_preferences: string[];
  car_rental_preferences: string[];
  loyalty_programs: LoyaltyProgram[];
  travel_notes?: string;
  emergency_contact_while_traveling?: string;
}

interface LoyaltyProgram {
  type: 'airline' | 'hotel' | 'car' | 'other';
  company: string;
  number: string;
  status?: string;
}

export default function TravelPreferencesClient() {
  const [preferences, setPreferences] = useState<TravelPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<TravelPreferences>>({});
  const [newAirline, setNewAirline] = useState('');
  const [newHotel, setNewHotel] = useState('');
  const [newCarRental, setNewCarRental] = useState('');
  const [newLoyaltyProgram, setNewLoyaltyProgram] = useState<LoyaltyProgram>({
    type: 'airline',
    company: '',
    number: '',
    status: ''
  });
  const { addToast } = useToast();
  const supabase = createClient();

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchPreferences();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('travel_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      
      if (data) {
        setPreferences(data);
        setFormData(data);
      } else {
        setFormData({
          airline_preferences: [],
          hotel_preferences: [],
          car_rental_preferences: [],
          loyalty_programs: []
        });
        setIsEditing(true);
      }
    } catch (error) {
      console.error('Error fetching travel preferences:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load travel preferences'
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
        user_id: user.id
      };

      if (preferences?.id) {
        const { error } = await supabase
          .from('travel_preferences')
          .update(dataToSave)
          .eq('id', preferences.id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('travel_preferences')
          .insert(dataToSave);

        if (error) throw error;
      }

      addToast({
        type: 'success',
        title: 'Success',
        description: 'Travel preferences saved successfully'
      });
      
      setIsEditing(false);
      fetchPreferences();
    } catch (error) {
      console.error('Error saving travel preferences:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to save travel preferences'
      });
    }
  };

  const addAirline = () => {
    if (newAirline.trim()) {
      setFormData({
        ...formData,
        airline_preferences: [...(formData.airline_preferences || []), newAirline.trim()]
      });
      setNewAirline('');
    }
  };

  const removeAirline = (index: number) => {
    const airlines = [...(formData.airline_preferences || [])];
    airlines.splice(index, 1);
    setFormData({ ...formData, airline_preferences: airlines });
  };

  const addHotel = () => {
    if (newHotel.trim()) {
      setFormData({
        ...formData,
        hotel_preferences: [...(formData.hotel_preferences || []), newHotel.trim()]
      });
      setNewHotel('');
    }
  };

  const removeHotel = (index: number) => {
    const hotels = [...(formData.hotel_preferences || [])];
    hotels.splice(index, 1);
    setFormData({ ...formData, hotel_preferences: hotels });
  };

  const addCarRental = () => {
    if (newCarRental.trim()) {
      setFormData({
        ...formData,
        car_rental_preferences: [...(formData.car_rental_preferences || []), newCarRental.trim()]
      });
      setNewCarRental('');
    }
  };

  const removeCarRental = (index: number) => {
    const rentals = [...(formData.car_rental_preferences || [])];
    rentals.splice(index, 1);
    setFormData({ ...formData, car_rental_preferences: rentals });
  };

  const addLoyaltyProgram = () => {
    if (newLoyaltyProgram.company && newLoyaltyProgram.number) {
      setFormData({
        ...formData,
        loyalty_programs: [...(formData.loyalty_programs || []), newLoyaltyProgram]
      });
      setNewLoyaltyProgram({ type: 'airline', company: '', number: '', status: '' });
    }
  };

  const removeLoyaltyProgram = (index: number) => {
    const programs = [...(formData.loyalty_programs || [])];
    programs.splice(index, 1);
    setFormData({ ...formData, loyalty_programs: programs });
  };

  if (loading) {
    return (
      <div className="stack-md">
        {[1, 2, 3].map(i => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-component-xl" />
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="stack-lg">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-heading-3">Travel Preferences</h2>
          <p className="color-muted">Manage your travel documents and preferences</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)}>Edit Preferences</Button>
        ) : (
          <div className="cluster">
            <Button variant="secondary" onClick={() => {
              setIsEditing(false);
              setFormData(preferences || {});
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              <Save className="w-icon-xs h-icon-xs mr-sm" />
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Passport Information */}
      <Card>
        <CardHeader>
          <h3 className="text-heading-4 flex items-center">
            <Globe className="w-icon-sm h-icon-sm mr-sm color-accent" />
            Passport Information
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <Input               label="Passport Number"
              value={formData.passport_number || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, passport_number: e.target.value })}
              disabled={!isEditing}
            />
            <Input               label="Expiry Date"
              type="date"
              value={formData.passport_expiry || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, passport_expiry: e.target.value })}
              disabled={!isEditing}
            />
            <Input               label="Issuing Country"
              value={formData.passport_country || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, passport_country: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Travel Programs */}
      <Card>
        <CardHeader>
          <h3 className="text-body text-heading-4">Travel Programs</h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <Input               label="TSA PreCheck"
              value={formData.tsa_precheck || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, tsa_precheck: e.target.value })}
              placeholder="Known Traveler Number"
              disabled={!isEditing}
            />
            <Input               label="Global Entry"
              value={formData.global_entry || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, global_entry: e.target.value })}
              placeholder="PASSID"
              disabled={!isEditing}
            />
            <Input               label="Known Traveler Number"
              value={formData.known_traveler || ''}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, known_traveler: e.target.value })}
              disabled={!isEditing}
            />
          </div>
        </CardContent>
      </Card>

      {/* Flight Preferences */}
      <Card>
        <CardHeader>
          <h3 className="text-heading-4 flex items-center">
            <Plane className="w-icon-sm h-icon-sm mr-sm color-secondary" />
            Flight Preferences
          </h3>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
            <label className="text-body-sm form-label">Seat Preference</label>
            <Select
              value={formData.seat_preference || ''}
              onValueChange={(value: string) => setFormData({ ...formData, seat_preference: value })}
              disabled={!isEditing}
            >
              <option value="">Select...</option>
              <option value="window">Window</option>
              <option value="aisle">Aisle</option>
              <option value="middle">Middle</option>
              <option value="exit_row">Exit Row</option>
              <option value="bulkhead">Bulkhead</option>
            </Select>
            <label className="text-body-sm form-label">Meal Preference</label>
            <Select
              value={formData.meal_preference || ''}
              onValueChange={(value: string) => setFormData({ ...formData, meal_preference: value })}
              disabled={!isEditing}
            >
              <option value="">Select...</option>
              <option value="regular">Regular</option>
              <option value="vegetarian">Vegetarian</option>
              <option value="vegan">Vegan</option>
              <option value="kosher">Kosher</option>
              <option value="halal">Halal</option>
              <option value="gluten_free">Gluten Free</option>
            </Select>
          </div>
          <div className="stack-sm">
            <label className="text-body-sm form-label">Preferred Airlines</label>
            <div className="flex flex-wrap gap-sm">
              {(formData.airline_preferences || []).map((airline, index) => (
                <Badge key={index} variant="secondary">
                  {airline}
                  {isEditing && (
                    <button onClick={() => removeAirline(index)} className="ml-sm">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-sm">
                <Input                   value={newAirline}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewAirline(e.target.value)}
                  placeholder="Add airline..."
                  onKeyPress={(e: any) => e.key === 'Enter' && addAirline()}
                />
                <Button>
                  <Plus className="w-icon-xs h-icon-xs" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Hotel Preferences */}
      <Card>
        <CardHeader>
          <h3 className="text-heading-4 flex items-center">
            <Hotel className="w-icon-sm h-icon-sm mr-sm color-success" />
            Hotel Preferences
          </h3>
        </CardHeader>
        <CardContent>
          <div className="stack-sm">
            <div className="flex flex-wrap gap-sm">
              {(formData.hotel_preferences || []).map((hotel, index) => (
                <Badge key={index} variant="secondary">
                  {hotel}
                  {isEditing && (
                    <button onClick={() => removeHotel(index)} className="ml-sm">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-sm">
                <Input                   value={newHotel}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewHotel(e.target.value)}
                  placeholder="Add hotel chain..."
                  onKeyPress={(e: any) => e.key === 'Enter' && addHotel()}
                />
                <Button>
                  <Plus className="w-icon-xs h-icon-xs" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Car Rental Preferences */}
      <Card>
        <CardHeader>
          <h3 className="text-heading-4 flex items-center">
            <Car className="w-icon-sm h-icon-sm mr-sm color-warning" />
            Car Rental Preferences
          </h3>
        </CardHeader>
        <CardContent>
          <div className="stack-sm">
            <div className="flex flex-wrap gap-sm">
              {(formData.car_rental_preferences || []).map((rental, index) => (
                <Badge key={index} variant="secondary">
                  {rental}
                  {isEditing && (
                    <button onClick={() => removeCarRental(index)} className="ml-sm">
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
            </div>
            {isEditing && (
              <div className="flex gap-sm">
                <Input                   value={newCarRental}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewCarRental(e.target.value)}
                  placeholder="Add car rental company..."
                  onKeyPress={(e: any) => e.key === 'Enter' && addCarRental()}
                />
                <Button>
                  <Plus className="w-icon-xs h-icon-xs" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Loyalty Programs */}
      <Card>
        <CardHeader>
          <h3 className="text-body text-heading-4">Loyalty Programs</h3>
        </CardHeader>
        <CardContent>
          <div className="stack-sm">
            {(formData.loyalty_programs || []).map((program, index) => (
              <div key={index} className="p-sm bg-secondary rounded-lg flex justify-between items-center">
                <div>
                  <p className="text-body-sm">{program.company}</p>
                  <p className="text-body-sm color-muted">
                    {program.type} - {program.number}
                    {program.status && ` (${program.status})`}
                  </p>
                </div>
                {isEditing && (
                  <Button
                    variant="ghost"
                   
                    onClick={() => removeLoyaltyProgram(index)}
                  >
                    <X className="w-icon-xs h-icon-xs" />
                  </Button>
                )}
              </div>
            ))}
            {isEditing && (
              <div className="stack-sm p-sm border rounded-lg">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
                  <label className="text-body-sm form-label">Program Type</label>
                  <Select
                    value={newLoyaltyProgram.type}
                    onValueChange={(value: string) => setNewLoyaltyProgram({ 
                      ...newLoyaltyProgram, 
                      type: value as LoyaltyProgram['type'] 
                    })}
                  >
                    <option value="airline">Airline</option>
                    <option value="hotel">Hotel</option>
                    <option value="car">Car Rental</option>
                    <option value="other">Other</option>
                  </Select>
                  <Input                     placeholder="Company name"
                    value={newLoyaltyProgram.company}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLoyaltyProgram({ 
                      ...newLoyaltyProgram, 
                      company: e.target.value 
                    })}
                  />
                  <Input                     placeholder="Member number"
                    value={newLoyaltyProgram.number}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLoyaltyProgram({ 
                      ...newLoyaltyProgram, 
                      number: e.target.value 
                    })}
                  />
                  <Input                     placeholder="Status (optional)"
                    value={newLoyaltyProgram.status}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewLoyaltyProgram({ 
                      ...newLoyaltyProgram, 
                      status: e.target.value 
                    })}
                  />
                </div>
                <Button>
                  <Plus className="w-icon-xs h-icon-xs mr-sm" />
                  Add Loyalty Program
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Travel Notes */}
      <Card>
        <CardHeader>
          <h3 className="text-body text-heading-4">Travel Notes</h3>
        </CardHeader>
        <CardContent>
          <textarea
            value={formData.travel_notes || ''}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFormData({ ...formData, travel_notes: e.target.value })}
            placeholder="Special requirements, preferences, or notes for travel arrangements..."
            rows={4}
            disabled={!isEditing}
          />
        </CardContent>
      </Card>
    </div>
  );
}
