import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// GET /api/v1/procurement/approvals/policies - List approval policies
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { searchParams } = new URL(request.url);
    const organizationId = searchParams.get('organization_id');

    if (!organizationId) {
      return NextResponse.json({ error: 'Organization ID is required' }, { status: 400 });
    }

    const { data: policies, error } = await supabase
      .from('procurement_approval_policies')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching approval policies:', error);
      return NextResponse.json({ error: 'Failed to fetch approval policies' }, { status: 500 });
    }

    return NextResponse.json({ policies });
  } catch (error) {
    console.error('Error in GET /api/v1/procurement/approvals/policies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/v1/procurement/approvals/policies - Create approval policy
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const body = await request.json();

    const { organization_id, name, description, rules, is_active } = body;

    if (!organization_id || !name) {
      return NextResponse.json({ error: 'Organization ID and name are required' }, { status: 400 });
    }

    const { data: policy, error } = await supabase
      .from('procurement_approval_policies')
      .insert({
        organization_id,
        name,
        description,
        rules,
        is_active: is_active ?? true
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating approval policy:', error);
      return NextResponse.json({ error: 'Failed to create approval policy' }, { status: 500 });
    }

    return NextResponse.json({ policy }, { status: 201 });
  } catch (error) {
    console.error('Error in POST /api/v1/procurement/approvals/policies:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
