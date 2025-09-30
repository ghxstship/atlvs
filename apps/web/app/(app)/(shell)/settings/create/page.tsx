import { redirect } from 'next/navigation';

/**
 * Create Route
 * Redirects to main module page with create action
 */
export default function CreatePage() {
  redirect('/settings?action=create');
}
