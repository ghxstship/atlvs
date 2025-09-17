import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';
import { z } from 'zod';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const CreateTrainingProgramSchema = z.object({
  name: z.string().min(1, 'Program name is required'),
  description: z.string().optional(),
  type: z.enum(['safety', 'technical', 'compliance', 'orientation', 'certification', 'continuing_education']),
  category: z.string().optional(),
  status: z.enum(['draft', 'active', 'archived']).default('draft'),
  duration: z.object({
    hours: z.number().positive(),
    days: z.number().positive().optional(),
    weeks: z.number().positive().optional()
  }),
  modules: z.array(z.object({
    name: z.string(),
    description: z.string().optional(),
    order: z.number().positive(),
    type: z.enum(['video', 'document', 'quiz', 'practical', 'assessment', 'webinar']),
    duration: z.number().positive(), // in minutes
    required: z.boolean().default(true),
    passingScore: z.number().min(0).max(100).optional(),
    materials: z.array(z.object({
      name: z.string(),
      type: z.string(),
      url: z.string().optional(),
      size: z.number().optional()
    })).optional(),
    prerequisites: z.array(z.string()).optional() // module IDs
  })),
  requirements: z.object({
    roles: z.array(z.string()).optional(),
    departments: z.array(z.string()).optional(),
    certifications: z.array(z.string()).optional(),
    experience: z.string().optional(),
    renewalPeriod: z.number().optional() // in months
  }).optional(),
  certification: z.object({
    issueCertificate: z.boolean().default(false),
    certificateName: z.string().optional(),
    validityPeriod: z.number().optional(), // in months
    renewalRequired: z.boolean().default(false),
    ceuCredits: z.number().optional()
  }).optional(),
  delivery: z.object({
    method: z.enum(['online', 'in_person', 'hybrid', 'self_paced']),
    location: z.string().optional(),
    instructor: z.string().optional(),
    maxParticipants: z.number().positive().optional(),
    schedule: z.array(z.object({
      date: z.string(),
      startTime: z.string(),
      endTime: z.string(),
      location: z.string().optional()
    })).optional()
  }),
  assessment: z.object({
    required: z.boolean().default(true),
    passingScore: z.number().min(0).max(100).default(70),
    maxAttempts: z.number().positive().default(3),
    timeLimit: z.number().positive().optional() // in minutes
  }).optional(),
  metadata: z.record(z.any()).optional(),
});

const UpdateTrainingProgramSchema = CreateTrainingProgramSchema.partial();

const EnrollParticipantSchema = z.object({
  programId: z.string().uuid('Invalid program ID'),
  personId: z.string().uuid('Invalid person ID'),
  enrollmentDate: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'critical']).default('medium'),
  assignedBy: z.string().uuid().optional(),
  notes: z.string().optional(),
});

async function getAuthenticatedUser() {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Unauthorized');
  }

  const { data: membership } = await supabase
    .from('memberships')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .eq('status', 'active')
    .single();

  if (!membership) {
    throw new Error('No active organization membership');
  }

  return { user, orgId: membership.organization_id, role: membership.role, supabase };
}

export async function GET(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const personId = searchParams.get('personId');
    const programId = searchParams.get('programId');
    const includeModules = searchParams.get('includeModules') === 'true';

    // If fetching training enrollments for a person
    if (personId) {
      const { data: enrollments, error } = await supabase
        .from('training_enrollments')
        .select(`
          *,
          program:training_programs(id, name, type, duration),
          person:people(id, name, email),
          progress:training_progress(
            module:training_modules(name, type, duration),
            status,
            score,
            completed_at,
            attempts
          ),
          certificates:training_certificates(
            certificate_name,
            issued_at,
            expires_at,
            certificate_url
          )
        `)
        .eq('person_id', personId)
        .eq('organization_id', orgId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Training enrollments fetch error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      return NextResponse.json({ enrollments: enrollments || [] });
    }

    // If fetching a specific program
    if (programId) {
      const { data: program, error } = await supabase
        .from('training_programs')
        .select(`
          *,
          modules:training_modules(*),
          enrollments:training_enrollments(
            person:people(id, name, email),
            status,
            progress,
            enrolled_at,
            completed_at
          )
        `)
        .eq('id', programId)
        .eq('organization_id', orgId)
        .single();

      if (error || !program) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }

      return NextResponse.json({ program });
    }

    // Otherwise, fetch all programs
    let query = supabase
      .from('training_programs')
      .select(`
        *,
        ${includeModules ? 'modules:training_modules(*),' : ''}
        enrollments:training_enrollments(count)
      `)
      .eq('organization_id', orgId)
      .order('created_at', { ascending: false });

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);

    const { data: programs, error } = await query;

    if (error) {
      console.error('Training programs fetch error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    // Calculate metrics
    const metrics = {
      totalPrograms: programs?.length || 0,
      activePrograms: programs?.filter((p: any) => p.status === 'active').length || 0,
      totalEnrollments: programs?.reduce((sum: number, p: any) => sum + (p.enrollments?.[0]?.count || 0), 0) || 0,
      completionRate: 0 // Would need additional query to calculate
    };

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'pipeline.training.list',
      resource_type: 'training_program',
      details: { 
        count: programs?.length || 0,
        filters: { type, status, personId, programId, includeModules }
      },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      programs: programs || [], 
      metrics
    });

  } catch (error: any) {
    console.error('Training GET error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    
    // Check if this is enrolling a participant or creating a program
    if (body.programId && body.personId) {
      // Enroll participant in training program
      const enrollmentData = EnrollParticipantSchema.parse(body);

      // Verify program belongs to organization
      const { data: program } = await supabase
        .from('training_programs')
        .select('id, name, status, modules:training_modules(*)')
        .eq('id', enrollmentData.programId)
        .eq('organization_id', orgId)
        .eq('status', 'active')
        .single();

      if (!program) {
        return NextResponse.json({ error: 'Active program not found' }, { status: 404 });
      }

      // Verify person belongs to organization
      const { data: person } = await supabase
        .from('people')
        .select('id, name, email')
        .eq('id', enrollmentData.personId)
        .eq('organization_id', orgId)
        .single();

      if (!person) {
        return NextResponse.json({ error: 'Person not found' }, { status: 404 });
      }

      // Check if already enrolled
      const { data: existing } = await supabase
        .from('training_enrollments')
        .select('id')
        .eq('program_id', enrollmentData.programId)
        .eq('person_id', enrollmentData.personId)
        .single();

      if (existing) {
        return NextResponse.json({ error: 'Person is already enrolled in this program' }, { status: 400 });
      }

      // Create enrollment
      const { data: enrollment, error } = await supabase
        .from('training_enrollments')
        .insert({
          program_id: enrollmentData.programId,
          person_id: enrollmentData.personId,
          organization_id: orgId,
          status: 'enrolled',
          progress: 0,
          enrolled_at: enrollmentData.enrollmentDate || new Date().toISOString(),
          due_date: enrollmentData.dueDate,
          priority: enrollmentData.priority,
          assigned_by: enrollmentData.assignedBy || user.id,
          notes: enrollmentData.notes,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Training enrollment error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Create progress records for each module
      if (program.modules && program.modules.length > 0) {
        const progressRecords = program.modules.map((module: any) => ({
          enrollment_id: enrollment.id,
          module_id: module.id,
          organization_id: orgId,
          status: 'not_started',
          progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        await supabase.from('training_progress').insert(progressRecords);
      }

      // Send enrollment notification
      await supabase.from('notifications').insert({
        user_id: (person as any).user_id,
        organization_id: orgId,
        type: 'training_enrolled',
        title: 'New Training Assignment',
        message: `You have been enrolled in the training program "${program.name}". Please begin your training modules.`,
        created_at: new Date().toISOString()
      });

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.training.enroll',
        resource_type: 'training_enrollment',
        resource_id: enrollment.id,
        details: { 
          program_id: enrollmentData.programId,
          person_id: enrollmentData.personId,
          person_name: person.name
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ enrollment }, { status: 201 });
    } else {
      // Create new training program
      const programData = CreateTrainingProgramSchema.parse(body);

      const { data: program, error } = await supabase
        .from('training_programs')
        .insert({
          name: programData.name,
          description: programData.description,
          type: programData.type,
          category: programData.category,
          status: programData.status,
          duration: programData.duration,
          requirements: programData.requirements,
          certification: programData.certification,
          delivery: programData.delivery,
          assessment: programData.assessment,
          metadata: programData.metadata,
          organization_id: orgId,
          created_by: user.id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Training program creation error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Create modules
      if (programData.modules && programData.modules.length > 0) {
        const modules = programData.modules.map(module => ({
          program_id: program.id,
          organization_id: orgId,
          ...module,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));

        await supabase.from('training_modules').insert(modules);
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.training.create',
        resource_type: 'training_program',
        resource_id: program.id,
        details: { 
          name: programData.name,
          type: programData.type,
          modules_count: programData.modules?.length || 0
        },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ program }, { status: 201 });
    }

  } catch (error: any) {
    console.error('Training POST error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin', 'manager'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, enrollmentId, moduleId, ...updateData } = body;

    if (enrollmentId && moduleId) {
      // Update training progress
      const { data: progress, error } = await supabase
        .from('training_progress')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('enrollment_id', enrollmentId)
        .eq('module_id', moduleId)
        .eq('organization_id', orgId)
        .select()
        .single();

      if (error) {
        console.error('Progress update error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Update enrollment progress if module completed
      if (updateData.status === 'completed') {
        // Calculate overall progress
        const { data: allProgress } = await supabase
          .from('training_progress')
          .select('status')
          .eq('enrollment_id', enrollmentId);

        const completedModules = allProgress?.filter((p: any) => p.status === 'completed').length || 0;
        const totalModules = allProgress?.length || 1;
        const overallProgress = Math.round((completedModules / totalModules) * 100);

        await supabase
          .from('training_enrollments')
          .update({
            progress: overallProgress,
            status: overallProgress === 100 ? 'completed' : 'in_progress',
            completed_at: overallProgress === 100 ? new Date().toISOString() : null,
            updated_at: new Date().toISOString()
          })
          .eq('id', enrollmentId);

        // Issue certificate if program completed and certification enabled
        if (overallProgress === 100) {
          const { data: enrollment } = await supabase
            .from('training_enrollments')
            .select('program:training_programs(certification)')
            .eq('id', enrollmentId)
            .single();

          if (enrollment?.program?.certification?.issueCertificate) {
            await supabase.from('training_certificates').insert({
              enrollment_id: enrollmentId,
              organization_id: orgId,
              certificate_name: enrollment.program.certification.certificateName,
              issued_at: new Date().toISOString(),
              expires_at: enrollment.program.certification.validityPeriod ? 
                new Date(Date.now() + enrollment.program.certification.validityPeriod * 30 * 24 * 60 * 60 * 1000).toISOString() : null,
              created_at: new Date().toISOString()
            });
          }
        }
      }

      return NextResponse.json({ progress });
    } else if (id) {
      // Update training program
      const programData = UpdateTrainingProgramSchema.parse(updateData);

      const { data: program, error } = await supabase
        .from('training_programs')
        .update({
          ...programData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('organization_id', orgId)
        .select()
        .single();

      if (error) {
        console.error('Program update error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      if (!program) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.training.update',
        resource_type: 'training_program',
        resource_id: program.id,
        details: { updated_fields: Object.keys(programData) },
        occurred_at: new Date().toISOString()
      });

      return NextResponse.json({ program });
    } else {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

  } catch (error: any) {
    console.error('Training PUT error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation error', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, orgId, role, supabase } = await getAuthenticatedUser();

    if (!['owner', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const body = await request.json();
    const { id, enrollmentId } = body;

    if (enrollmentId) {
      // Cancel training enrollment
      const { data: enrollment } = await supabase
        .from('training_enrollments')
        .select('person:people(name), program:training_programs(name)')
        .eq('id', enrollmentId)
        .eq('organization_id', orgId)
        .single();

      const { error } = await supabase
        .from('training_enrollments')
        .update({
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', enrollmentId)
        .eq('organization_id', orgId);

      if (error) {
        console.error('Enrollment cancellation error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.training.cancel',
        resource_type: 'training_enrollment',
        resource_id: enrollmentId,
        details: { 
          person_name: enrollment?.person?.name || 'Unknown',
          program_name: enrollment?.program?.name || 'Unknown'
        },
        occurred_at: new Date().toISOString()
      });
    } else if (id) {
      // Delete training program
      const { data: program } = await supabase
        .from('training_programs')
        .select('name, status')
        .eq('id', id)
        .eq('organization_id', orgId)
        .single();

      if (!program) {
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }

      if (program.status === 'active') {
        return NextResponse.json({ 
          error: 'Cannot delete active program. Please archive it first.' 
        }, { status: 400 });
      }

      const { error } = await supabase
        .from('training_programs')
        .delete()
        .eq('id', id)
        .eq('organization_id', orgId);

      if (error) {
        console.error('Program deletion error:', error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      await supabase.from('audit_logs').insert({
        organization_id: orgId,
        user_id: user.id,
        action: 'pipeline.training.delete',
        resource_type: 'training_program',
        resource_id: id,
        details: { name: program.name },
        occurred_at: new Date().toISOString()
      });
    } else {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true });

  } catch (error: any) {
    console.error('Training DELETE error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}
