import { z } from 'zod';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Analytics query schema
const analyticsQuerySchema = z.object({
  timeRange: z.enum(['7d', '30d', '90d', '1y']).optional().default('30d'),
  category: z.string().optional(),
  vendor: z.string().optional()
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
    const query = analyticsQuerySchema.parse({
      timeRange: searchParams.get('timeRange'),
      category: searchParams.get('category'),
      vendor: searchParams.get('vendor')
    });

    // In a real implementation, this would query the database for analytics data
    // For now, return demo analytics data
    const analyticsData = {
      metrics: {
        totalSpend: 2400000,
        totalSpendChange: 12.5,
        activeOrders: 156,
        activeOrdersChange: -8.2,
        avgApprovalTime: 2.3,
        avgApprovalTimeChange: -15.7,
        vendorCount: 89,
        vendorCountChange: 5.3,
        costSavings: 180000,
        costSavingsChange: 22.1,
        complianceRate: 94.2,
        complianceRateChange: 3.1
      },
      spendByCategory: [
        { category: 'Equipment', amount: 850000, percentage: 35.4, trend: 'up' },
        { category: 'Services', amount: 720000, percentage: 30.0, trend: 'stable' },
        { category: 'Supplies', amount: 480000, percentage: 20.0, trend: 'down' },
        { category: 'Software', amount: 240000, percentage: 10.0, trend: 'up' },
        { category: 'Maintenance', amount: 110000, percentage: 4.6, trend: 'stable' }
      ],
      vendorPerformance: [
        {
          vendor: 'Tech Equipment Co.',
          orders: 45,
          totalSpend: 450000,
          avgDeliveryTime: 5.2,
          rating: 4.8,
          onTimeDelivery: 96
        },
        {
          vendor: 'Seaside Catering Co.',
          orders: 32,
          totalSpend: 180000,
          avgDeliveryTime: 2.1,
          rating: 4.6,
          onTimeDelivery: 98
        }
      ],
      trends: {
        spendTrend: [
          { month: 'Jan', amount: 180000 },
          { month: 'Feb', amount: 220000 },
          { month: 'Mar', amount: 195000 },
          { month: 'Apr', amount: 240000 }
        ]
      }
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
      query
    });

  } catch (error) {
    console.error('Analytics API error:', error);
    
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
