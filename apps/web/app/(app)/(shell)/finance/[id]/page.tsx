import { redirect } from 'next/navigation';

/**
 * View Route
 * Redirects to main module page with view action
 */
export default function ViewPage({ params }: { params: { id: string } }) {
  redirect(`/finance?action=view&id=${params.id}`);
}
