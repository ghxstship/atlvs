import { redirect } from 'next/navigation';
import { createServerClient } from '@ghxstship/auth';
import { cookies } from 'next/headers';
import { Card } from '@ghxstship/ui';
import CategoriesClient from './CategoriesClient';
import CreateCategoryClient from './CreateCategoryClient';

export const metadata = {
  title: 'Categories - Procurement',
};

export default async function CategoriesPage() {
  const cookieStore = cookies();
  const sb = createServerClient(cookieStore);

  // Check authentication
  const { data: { user } } = await sb.auth.getUser();
  if (!user) {
    redirect('/auth/login');
  }

  // Get user's organization membership
  const { data: membership } = await sb
    .from('organization_members')
    .select('organization_id, role')
    .eq('user_id', user.id)
    .single();

  if (!membership?.organization_id) {
    redirect('/onboarding');
  }

  return (
    <div className="stack-lg">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-heading-3 text-heading-3">Categories</h1>
          <p className="color-foreground/70">
            Organize your products and services with categories
          </p>
        </div>
        <CreateCategoryClient orgId={membership.organization_id} />
      </div>

      <Card>
        <CategoriesClient orgId={membership.organization_id} />
      </Card>
    </div>
  );
}
