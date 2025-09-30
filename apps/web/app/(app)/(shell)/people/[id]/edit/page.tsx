import { redirect } from 'next/navigation';

/**
 * Edit Route
 * Redirects to main module page with edit action
 */
export default function EditPage({ params }: { params: { id: string } }) {
  redirect(`/people?action=edit&id=${params.id}`);
}
