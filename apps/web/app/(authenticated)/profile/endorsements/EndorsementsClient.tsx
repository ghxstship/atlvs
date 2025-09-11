'use client';

import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Button, Textarea, Card, CardHeader, CardContent, Badge } from '@ghxstship/ui';
import { Star, ThumbsUp, Award, MessageSquare, Plus, User } from 'lucide-react';
import { useToast } from '@ghxstship/ui';

interface Endorsement {
  id: string;
  from_user_id: string;
  from_user_name: string;
  from_user_role?: string;
  from_user_avatar?: string;
  relationship: string;
  skills: string[];
  message: string;
  rating: number;
  is_public: boolean;
  created_at: string;
}

export default function EndorsementsClient() {
  const [endorsements, setEndorsements] = useState<Endorsement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [newEndorsement, setNewEndorsement] = useState({
    to_user_email: '',
    relationship: '',
    message: '',
    rating: 5,
    is_public: true,
  });
  const { addToast } = useToast();
  const supabase = createClient();

  const availableSkills = [
    'Leadership', 'Communication', 'Problem Solving', 'Teamwork', 'Project Management',
    'Technical Skills', 'Creativity', 'Time Management', 'Adaptability', 'Critical Thinking',
    'Customer Service', 'Sales', 'Marketing', 'Design', 'Development', 'Analysis',
    'Strategy', 'Innovation', 'Mentoring', 'Negotiation', 'Presentation', 'Writing'
  ];

  useEffect(() => {
    fetchEndorsements();
  }, []);

  const fetchEndorsements = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('endorsements')
        .select('*')
        .eq('to_user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setEndorsements(data || []);
    } catch (error) {
      console.error('Error fetching endorsements:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to load endorsements'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRequestEndorsement = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // In a real app, this would send an email or notification
      const { error } = await supabase
        .from('endorsement_requests')
        .insert({
          from_user_id: user.id,
          to_user_email: newEndorsement.to_user_email,
          relationship: newEndorsement.relationship,
          message: newEndorsement.message,
          requested_skills: selectedSkills,
        });

      if (error) throw error;

      addToast({
        type: 'success',
        title: 'Success',
        description: 'Endorsement request sent successfully'
      });

      setShowAddForm(false);
      setNewEndorsement({
        to_user_email: '',
        relationship: '',
        message: '',
        rating: 5,
        is_public: true,
      });
      setSelectedSkills([]);
    } catch (error) {
      console.error('Error requesting endorsement:', error);
      addToast({
        type: 'error',
        title: 'Error',
        description: 'Failed to send endorsement request'
      });
    }
  };

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    );
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating
                ? 'fill-warning text-warning'
                : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    );
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
          <h2 className="text-2xl font-bold">Endorsements</h2>
          <p className="text-muted-foreground">Professional recommendations from colleagues</p>
        </div>
        <Button onClick={() => setShowAddForm(!showAddForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Request Endorsement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Endorsements</p>
                <p className="text-2xl font-bold">{endorsements.length}</p>
              </div>
              <Award className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Average Rating</p>
                <p className="text-2xl font-bold">
                  {endorsements.length > 0
                    ? (endorsements.reduce((acc, e) => acc + e.rating, 0) / endorsements.length).toFixed(1)
                    : '0.0'}
                </p>
              </div>
              <Star className="w-8 h-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Public Endorsements</p>
                <p className="text-2xl font-bold">
                  {endorsements.filter(e => e.is_public).length}
                </p>
              </div>
              <ThumbsUp className="w-8 h-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Request Endorsement Form */}
      {showAddForm && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold">Request an Endorsement</h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email of Endorser</label>
              <input
                type="email"
                className="w-full mt-1 px-3 py-2 border-border rounded-lg"
                value={newEndorsement.to_user_email}
                onChange={(e) => setNewEndorsement({ ...newEndorsement, to_user_email: e.target.value })}
                placeholder="colleague@example.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Your Relationship</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border-border rounded-lg"
                value={newEndorsement.relationship}
                onChange={(e) => setNewEndorsement({ ...newEndorsement, relationship: e.target.value })}
                placeholder="e.g., Direct Manager, Team Member, Client"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Skills to Endorse</label>
              <div className="flex flex-wrap gap-2 mt-2">
                {availableSkills.map(skill => (
                  <Badge
                    key={skill}
                    variant={selectedSkills.includes(skill) ? 'default' : 'outline'}
                    className="cursor-pointer"
                    onClick={() => toggleSkill(skill)}
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Message (Optional)</label>
              <Textarea
                value={newEndorsement.message}
                onChange={(e) => setNewEndorsement({ ...newEndorsement, message: e.target.value })}
                placeholder="Add a personal message to your endorsement request..."
                rows={3}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowAddForm(false)}>
                Cancel
              </Button>
              <Button onClick={handleRequestEndorsement}>
                Send Request
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Endorsements List */}
      {endorsements.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Award className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No endorsements yet</p>
            <p className="text-sm text-muted-foreground mt-2">
              Request endorsements from colleagues to build your professional profile
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {endorsements.map((endorsement) => (
            <Card key={endorsement.id}>
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      {endorsement.from_user_avatar ? (
                        <img
                          src={endorsement.from_user_avatar}
                          alt={endorsement.from_user_name}
                          className="w-full h-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="w-6 h-6 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold">{endorsement.from_user_name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {endorsement.from_user_role || endorsement.relationship}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        {renderStars(endorsement.rating)}
                        <span className="text-sm text-muted-foreground">
                          {new Date(endorsement.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  {endorsement.is_public ? (
                    <Badge variant="success">Public</Badge>
                  ) : (
                    <Badge variant="secondary">Private</Badge>
                  )}
                </div>

                {endorsement.skills.length > 0 && (
                  <div className="mb-4">
                    <p className="text-sm font-medium mb-2">Endorsed Skills</p>
                    <div className="flex flex-wrap gap-2">
                      {endorsement.skills.map((skill, index) => (
                        <Badge key={index} variant="outline">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {endorsement.message && (
                  <div className="p-4 bg-muted rounded-lg">
                    <MessageSquare className="w-4 h-4 text-muted-foreground mb-2" />
                    <p className="text-sm italic">"{endorsement.message}"</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
