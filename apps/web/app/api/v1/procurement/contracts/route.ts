import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Contract schemas
const createContractSchema = z.object({
  title: z.string().min(1).max(200),
  vendor: z.string().min(1).max(100),
  type: z.enum(['master_agreement', 'purchase_agreement', 'service_agreement', 'nda', 'sow']),
  value: z.number().min(0),
  currency: z.string().length(3).default('USD'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  renewalDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  autoRenewal: z.boolean().default(false),
  terms: z.string().max(2000),
  paymentTerms: z.string().max(500),
  deliverables: z.array(z.string()).default([]),
  riskLevel: z.enum(['low', 'medium', 'high']).default('medium'),
  assignedTo: z.string().optional()
});

const contractQuerySchema = z.object({
  status: z.enum(['draft', 'under_review', 'negotiation', 'approved', 'active', 'expired', 'terminated', 'all']).optional().default('all'),
  type: z.enum(['master_agreement', 'purchase_agreement', 'service_agreement', 'nda', 'sow', 'all']).optional().default('all'),
  riskLevel: z.enum(['low', 'medium', 'high', 'all']).optional().default('all'),
  limit: z.number().min(1).max(100).optional().default(20),
  offset: z.number().min(0).optional().default(0)
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orgId = request.headers.get('x-organization-id');
    
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    // Parse query parameters
    const query = contractQuerySchema.parse({
      status: searchParams.get('status'),
      type: searchParams.get('type'),
      riskLevel: searchParams.get('riskLevel'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    });

    // In a real implementation, this would query the database
    // For now, return demo contract data
    const contractsData = [
      {
        id: '1',
        title: 'Tech Equipment Co. Master Agreement',
        vendor: 'Tech Equipment Co.',
        type: 'master_agreement',
        status: 'active',
        value: 500000,
        currency: 'USD',
        startDate: '2024-01-01',
        endDate: '2024-12-31',
        renewalDate: '2024-11-01',
        autoRenewal: true,
        terms: 'Standard master agreement for equipment procurement with volume discounts',
        paymentTerms: 'Net 30 days',
        deliverables: ['Equipment delivery', 'Installation support', 'Warranty coverage'],
        riskLevel: 'low',
        assignedTo: 'Quartermaster',
        createdAt: '2023-12-01T10:00:00Z',
        updatedAt: '2024-01-15T14:30:00Z'
      },
      {
        id: '2',
        title: 'Seaside Catering Service Agreement',
        vendor: 'Seaside Catering Co.',
        type: 'service_agreement',
        status: 'active',
        value: 120000,
        currency: 'USD',
        startDate: '2024-01-01',
        endDate: '2024-06-30',
        renewalDate: '2024-05-01',
        autoRenewal: false,
        terms: 'Catering services for production crew with dietary accommodation requirements',
        paymentTerms: 'Net 15 days',
        deliverables: ['Daily meal service', 'Special dietary accommodations', 'Emergency catering'],
        riskLevel: 'medium',
        assignedTo: 'Captain Blackbeard',
        createdAt: '2023-11-15T09:00:00Z',
        updatedAt: '2024-01-10T11:20:00Z'
      }
    ];

    const summary = {
      total: contractsData.length,
      active: contractsData.filter(c => c.status === 'active').length,
      expiringSoon: contractsData.filter(c => {
        const endDate = new Date(c.endDate);
        const today = new Date();
        const diffTime = endDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays <= 30 && diffDays > 0;
      }).length,
      totalValue: contractsData.reduce((sum, c) => sum + c.value, 0)
    };

    return NextResponse.json({
      success: true,
      data: contractsData,
      summary,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total: contractsData.length
      }
    });

  } catch (error) {
    console.error('Contracts API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid query parameters', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const orgId = request.headers.get('x-organization-id');
    
    if (!orgId) {
      return NextResponse.json(
        { error: 'Organization ID is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const contractData = createContractSchema.parse(body);

    // In a real implementation, this would save to the database
    const newContract = {
      id: `contract_${Date.now()}`,
      ...contractData,
      organizationId: orgId,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return NextResponse.json({
      success: true,
      data: newContract
    }, { status: 201 });

  } catch (error) {
    console.error('Create contract API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid contract data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
