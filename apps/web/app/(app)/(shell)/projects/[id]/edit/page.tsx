import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';


/**
 * Edit Route
 * Redirects to main module page with edit action
 */
export default function EditPage({ params }: { params: { id: string } }) {
  redirect(`/projects?action=edit&id=${params.id}`);
}
