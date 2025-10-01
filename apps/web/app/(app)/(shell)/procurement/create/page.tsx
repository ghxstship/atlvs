import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';


/**
 * Create Route
 * Redirects to main module page with create action
 */
export default function CreatePage() {
  redirect('/procurement?action=create');
}
