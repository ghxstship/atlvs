import { redirect } from 'next/navigation';

/**
 * View Route
 * Redirects to main module page with view action
 */
export default function ViewPage({ params }: { params: { id: string } }) {
  redirect(`/procurement?action=view&id=${params.id}`);
}
