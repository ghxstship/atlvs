import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';


export default async function AssetsOverviewPage() {
  const cookieStore = await cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/auth/signin');
  }

  // Redirect to main assets page as overview is the default
  redirect('/assets');
}
