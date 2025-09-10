import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createServerClient } from '@ghxstship/auth';

export default async function AssetsOverviewPage() {
  const cookieStore = cookies();
  const supabase = createServerClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/login');
  }

  // Redirect to main assets page as overview is the default
  redirect('/assets');
}
