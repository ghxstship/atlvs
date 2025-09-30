import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

// Feedback schemas
const createFeedbackSchema = z.object({
  type: z.enum(['vendor', 'process', 'system', 'general']),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  rating: z.number().min(1).max(5),
  category: z.string(),
  tags: z.array(z.string()).optional().default([])
});

const feedbackQuerySchema = z.object({
  type: z.enum(['vendor', 'process', 'system', 'general', 'all']).optional().default('all'),
  sentiment: z.enum(['positive', 'negative', 'neutral', 'all']).optional().default('all'),
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
    const query = feedbackQuerySchema.parse({
      type: searchParams.get('type'),
      sentiment: searchParams.get('sentiment'),
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : undefined,
      offset: searchParams.get('offset') ? parseInt(searchParams.get('offset')!) : undefined
    });

    // In a real implementation, this would query the database
    // For now, return demo feedback data
    const feedbackData = [
      {
        id: '1',
        type: 'vendor',
        title: 'Excellent service from Tech Equipment Co.',
        description: 'Fast delivery, great communication, and high-quality products. Would definitely recommend for future camera equipment purchases.',
        rating: 5,
        sentiment: 'positive',
        category: 'vendor_performance',
        submittedBy: 'Captain Blackbeard',
        submittedAt: '2024-01-20T10:30:00Z',
        status: 'reviewed',
        tags: ['delivery', 'communication', 'quality'],
        upvotes: 8,
        responses: 2
      },
      {
        id: '2',
        type: 'process',
        title: 'Approval process is too slow',
        description: 'The multi-step approval process for equipment requests takes too long. We need a faster way to approve urgent requests.',
        rating: 2,
        sentiment: 'negative',
        category: 'approval_workflow',
        submittedBy: 'Quartermaster',
        submittedAt: '2024-01-18T14:15:00Z',
        status: 'in_progress',
        tags: ['approval', 'workflow', 'urgent'],
        upvotes: 12,
        responses: 5
      }
    ];

    const summary = {
      totalFeedback: 47,
      averageRating: 3.8,
      sentimentBreakdown: {
        positive: 28,
        negative: 12,
        neutral: 7
      },
      topCategories: [
        { category: 'Vendor Performance', count: 18, avgRating: 3.2 },
        { category: 'System Features', count: 12, avgRating: 4.1 },
        { category: 'Approval Workflow', count: 9, avgRating: 2.8 },
        { category: 'General Feedback', count: 8, avgRating: 4.3 }
      ]
    };

    return NextResponse.json({
      success: true,
      data: feedbackData,
      summary,
      pagination: {
        limit: query.limit,
        offset: query.offset,
        total: feedbackData.length
      }
    });

  } catch (error) {
    console.error('Feedback API error:', error);
    
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
    const feedbackData = createFeedbackSchema.parse(body);

    // In a real implementation, this would save to the database
    const newFeedback = {
      id: `feedback_${Date.now()}`,
      ...feedbackData,
      organizationId: orgId,
      submittedBy: 'Current User', // Would get from auth
      submittedAt: new Date().toISOString(),
      status: 'new',
      upvotes: 0,
      responses: 0,
      sentiment: feedbackData.rating >= 4 ? 'positive' : feedbackData.rating <= 2 ? 'negative' : 'neutral'
    };

    return NextResponse.json({
      success: true,
      data: newFeedback
    }, { status: 201 });

  } catch (error) {
    console.error('Create feedback API error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid feedback data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
