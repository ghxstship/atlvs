'use client';


import { useState, useEffect } from 'react';
import { Card, Badge, Button, UnifiedInput } from '@ghxstship/ui';
import { DynamicProgressBar } from "../../../../_components/ui"
import { Users, Calendar, Clock, Award, Search, Filter, BookOpen, Target, CheckCircle, AlertTriangle, User, Plus } from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useTranslations } from 'next-intl';

interface TrainingProgram {
  id: string;
  name: string;
  description: string;
  category: 'safety' | 'technical' | 'compliance' | 'leadership' | 'certification';
  duration: number; // in hours
  required: boolean;
  expiryMonths?: number;
  createdAt?: string;
}

interface TrainingSession {
  id: string;
  programId: string;
  programName: string;
  instructorId?: string;
  instructorName?: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  location: string;
  maxParticipants: number;
  enrolledCount: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  createdAt?: string;
}

interface TrainingRecord {
  id: string;
  personId: string;
  personName: string;
  programId: string;
  programName: string;
  sessionId?: string;
  completedDate?: string;
  expiryDate?: string;
  score?: number;
  status: 'enrolled' | 'in_progress' | 'completed' | 'expired' | 'failed';
  certificateUrl?: string;
  notes?: string;
}

interface TrainingClientProps {
  orgId: string;
}

const TRAINING_CATEGORIES = [
  { id: 'safety', name: 'Safety', color: 'bg-destructive' },
  { id: 'technical', name: 'Technical', color: 'bg-primary' },
  { id: 'compliance', name: 'Compliance', color: 'bg-warning' },
  { id: 'leadership', name: 'Leadership', color: 'bg-secondary' },
  { id: 'certification', name: 'Certification', color: 'bg-success' }
] as const;

export default function TrainingClient({ orgId }: TrainingClientProps) {
  const t = useTranslations('pipeline.training');
  const supabase = createBrowserClient();
  const [programs, setPrograms] = useState<TrainingProgram[]>([]);
  const [sessions, setSessions] = useState<TrainingSession[]>([]);
  const [records, setRecords] = useState<TrainingRecord[]>([]);
  const [people, setPeople] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'programs' | 'sessions' | 'records'>('programs');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    loadData();
  }, [orgId]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Load people
      const { data: peopleData } = await supabase
        .from('people')
        .select('id, first_name, last_name, email')
        .eq('organization_id', orgId);

      setPeople(peopleData || []);

      // Mock data for demonstration
      const mockPrograms: TrainingProgram[] = [
        {
          id: '1',
          name: 'Safety Orientation',
          description: 'Basic safety protocols and emergency procedures',
          category: 'safety',
          duration: 4,
          required: true,
          expiryMonths: 12
        },
        {
          id: '2',
          name: 'Equipment Operation Certification',
          description: 'Certification for operating heavy equipment',
          category: 'certification',
          duration: 8,
          required: true,
          expiryMonths: 24
        },
        {
          id: '3',
          name: 'Leadership Development',
          description: 'Management and leadership skills training',
          category: 'leadership',
          duration: 16,
          required: false
        }
      ];

      const mockSessions: TrainingSession[] = [
        {
          id: '1',
          programId: '1',
          programName: 'Safety Orientation',
          instructorName: 'Captain Barbossa',
          scheduledDate: '2024-01-25',
          startTime: '09:00',
          endTime: '13:00',
          location: 'Training Room A',
          maxParticipants: 20,
          enrolledCount: 15,
          status: 'scheduled'
        },
        {
          id: '2',
          programId: '2',
          programName: 'Equipment Operation Certification',
          instructorName: 'Will Turner',
          scheduledDate: '2024-01-28',
          startTime: '08:00',
          endTime: '16:00',
          location: 'Equipment Yard',
          maxParticipants: 10,
          enrolledCount: 8,
          status: 'scheduled'
        }
      ];

      const mockRecords: TrainingRecord[] = [
        {
          id: '1',
          personId: peopleData?.[0]?.id || 'mock-1',
          personName: peopleData?.[0] ? `${peopleData[0].first_name} ${peopleData[0].last_name}` : 'Jack Sparrow',
          programId: '1',
          programName: 'Safety Orientation',
          completedDate: '2024-01-15',
          expiryDate: '2025-01-15',
          score: 95,
          status: 'completed'
        },
        {
          id: '2',
          personId: peopleData?.[1]?.id || 'mock-2',
          personName: peopleData?.[1] ? `${peopleData[1].first_name} ${peopleData[1].last_name}` : 'Elizabeth Swann',
          programId: '2',
          programName: 'Equipment Operation Certification',
          status: 'enrolled'
        }
      ];

      setPrograms(mockPrograms);
      setSessions(mockSessions);
      setRecords(mockRecords);
    } catch (error) {
      console.error('Error loading training data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="success" className="flex items-center gap-xs"><CheckCircle className="w-3 h-3" />Completed</Badge>;
      case 'in_progress':
        return <Badge variant="warning" className="flex items-center gap-xs"><Clock className="w-3 h-3" />In Progress</Badge>;
      case 'scheduled':
        return <Badge variant="outline" className="flex items-center gap-xs"><Calendar className="w-3 h-3" />Scheduled</Badge>;
      case 'expired':
        return <Badge variant="destructive" className="flex items-center gap-xs"><AlertTriangle className="w-3 h-3" />Expired</Badge>;
      case 'enrolled':
        return <Badge variant="secondary" className="flex items-center gap-xs"><User className="w-3 h-3" />Enrolled</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getCategoryColor = (category: TrainingProgram['category']) => {
    const categoryInfo = TRAINING_CATEGORIES.find(cat => cat.id === category);
    return categoryInfo?.color || 'bg-secondary-foreground';
  };

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 font-anton uppercase">Training Pipeline</h1>
          <p className="text-body-sm color-muted">Manage training programs, sessions, and completion records</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="flex items-center gap-sm">
          <Plus className="w-4 h-4" />
          Add Training
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex cluster-xs bg-secondary p-xs rounded-lg">
        {[
          { id: 'programs', label: 'Programs', icon: BookOpen },
          { id: 'sessions', label: 'Sessions', icon: Calendar },
          { id: 'records', label: 'Records', icon: User }
        ].map((tab: any) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-sm px-sm py-sm rounded-md text-body-sm form-label transition-colors ${
                activeTab === tab.id
                  ? 'bg-background color-foreground shadow-surface'
                  : 'color-muted hover:color-foreground'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {loading ? (
        <Card>
          <div className="p-xl text-center color-muted">Loading training data...</div>
        </Card>
      ) : (
        <>
          {/* Programs Tab */}
          {activeTab === 'programs' && (
            <div className="stack-md">
              {programs.map(program => (
                <Card key={program.id}>
                  <div className="p-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-sm mb-sm">
                          <div className={`w-3 h-3 rounded-full ${getCategoryColor(program.category)}`} />
                          <h3 className="text-body text-heading-4">{program.name}</h3>
                          {program.required && <Badge variant="destructive">Required</Badge>}
                        </div>
                        <p className="text-body-sm color-muted mb-sm">{program.description}</p>
                        <div className="flex items-center gap-md text-body-sm color-muted">
                          <span>Duration: {program.duration} hours</span>
                          <span>Category: {TRAINING_CATEGORIES.find(cat => cat.id === program.category)?.name}</span>
                          {program.expiryMonths && <span>Expires: {program.expiryMonths} months</span>}
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === 'sessions' && (
            <div className="stack-md">
              {sessions.map(session => (
                <Card key={session.id}>
                  <div className="p-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-body text-heading-4 mb-xs">{session.programName}</h3>
                        <div className="text-body-sm color-muted mb-sm">
                          Instructor: {session.instructorName || 'TBD'}
                        </div>
                        <div className="grid grid-cols-2 gap-md text-body-sm">
                          <div>
                            <span className="form-label">Date:</span> {new Date(session.scheduledDate).toLocaleDateString()}
                          </div>
                          <div>
                            <span className="form-label">Time:</span> {session.startTime} - {session.endTime}
                          </div>
                          <div>
                            <span className="form-label">Location:</span> {session.location}
                          </div>
                          <div>
                            <span className="form-label">Capacity:</span> {session.enrolledCount}/{session.maxParticipants}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-sm">
                        {getStatusBadge(session.status)}
                        <div className="text-right">
                          <DynamicProgressBar
                            percentage={(session.enrolledCount / session.maxParticipants) * 100}
                            variant="info"
                            size="sm"
                            showLabel={false}
                          />
                          <div className="text-body-sm color-muted mt-xs">
                            {Math.round((session.enrolledCount / session.maxParticipants) * 100)}% full
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {/* Records Tab */}
          {activeTab === 'records' && (
            <div className="stack-md">
              {records.map(record => (
                <Card key={record.id}>
                  <div className="p-md">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-body text-heading-4 mb-xs">{record.personName}</h3>
                        <p className="text-body-sm color-muted mb-sm">{record.programName}</p>
                        <div className="grid grid-cols-2 gap-md text-body-sm">
                          {record.completedDate && (
                            <div>
                              <span className="form-label">Completed:</span> {new Date(record.completedDate).toLocaleDateString()}
                            </div>
                          )}
                          {record.expiryDate && (
                            <div>
                              <span className="form-label">Expires:</span> {new Date(record.expiryDate).toLocaleDateString()}
                            </div>
                          )}
                          {record.score && (
                            <div>
                              <span className="form-label">Score:</span> {record.score}%
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-sm">
                        {getStatusBadge(record.status)}
                        {record.score && (
                          <div className="text-right">
                            <DynamicProgressBar
                              percentage={record.score}
                              variant={record.score >= 80 ? 'success' : record.score >= 60 ? 'warning' : 'error'}
                              size="sm"
                              showLabel={false}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
