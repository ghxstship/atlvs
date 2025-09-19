import { NextResponse, type NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

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

// GraphQL introspection schema
const GRAPHQL_SCHEMA = `
  type Query {
    organizations: [Organization]
    projects: [Project]
    people: [Person]
    companies: [Company]
    resources: [Resource]
  }

  type Organization {
    id: ID!
    name: String!
    slug: String!
    createdAt: String!
  }

  type Project {
    id: ID!
    name: String!
    description: String
    status: String!
    organizationId: ID!
  }

  type Person {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    organizationId: ID!
  }

  type Company {
    id: ID!
    name: String!
    type: String!
    organizationId: ID!
  }

  type Resource {
    id: ID!
    title: String!
    type: String!
    status: String!
    organizationId: ID!
  }
`;

export async function GET(request: NextRequest) {
  try {
    await getAuthenticatedUser();

    // Return GraphQL schema for introspection
    return NextResponse.json({
      data: {
        __schema: {
          types: [
            {
              name: "Query",
              kind: "OBJECT",
              fields: [
                { name: "organizations", type: { name: "[Organization]" } },
                { name: "projects", type: { name: "[Project]" } },
                { name: "people", type: { name: "[Person]" } },
                { name: "companies", type: { name: "[Company]" } },
                { name: "resources", type: { name: "[Resource]" } }
              ]
            }
          ]
        }
      }
    });

  } catch (error) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, orgId, supabase } = await getAuthenticatedUser();
    const body = await request.json();
    const { query, variables } = body;

    // Basic GraphQL query parsing and execution
    if (query.includes('organizations')) {
      const { data } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId);

      return NextResponse.json({ data: { organizations: data } });
    }

    if (query.includes('projects')) {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .eq('organization_id', orgId);

      return NextResponse.json({ data: { projects: data } });
    }

    if (query.includes('people')) {
      const { data } = await supabase
        .from('people')
        .select('*')
        .eq('organization_id', orgId);

      return NextResponse.json({ data: { people: data } });
    }

    if (query.includes('companies')) {
      const { data } = await supabase
        .from('companies')
        .select('*')
        .eq('organization_id', orgId);

      return NextResponse.json({ data: { companies: data } });
    }

    if (query.includes('resources')) {
      const { data } = await supabase
        .from('resources')
        .select('*')
        .eq('organization_id', orgId);

      return NextResponse.json({ data: { resources: data } });
    }

    await supabase.from('audit_logs').insert({
      organization_id: orgId,
      user_id: user.id,
      action: 'graphql.query',
      resource_type: 'graphql',
      details: { query: query.substring(0, 100) },
      occurred_at: new Date().toISOString()
    });

    return NextResponse.json({ 
      errors: [{ message: 'Query not supported' }] 
    }, { status: 400 });

  } catch (error) {
    console.error('GraphQL error:', error);
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ 
      errors: [{ message: error.message || 'Internal server error' }] 
    }, { status: 500 });
  }
}
