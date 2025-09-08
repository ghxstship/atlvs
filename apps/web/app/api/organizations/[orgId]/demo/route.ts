import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient, createServiceRoleClient } from '@ghxstship/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest, { params }: { params: { orgId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const orgId = params.orgId;
  const { data, error } = await supabase.rpc('seed_demo_for_org', { org_uuid: orgId });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  // Seed marketplace demo vendor + listing (service role; marketplace tables are service-only)
  try {
    const svc = createServiceRoleClient();
    const vendorId = crypto.randomUUID();
    await svc.from('marketplace_vendors').insert({
      id: vendorId,
      organization_id: orgId,
      name: 'Blackwater Audio Co',
      website: 'https://example.com/blackwater-audio',
      contact_email: 'crew@blackwater-audio.test',
      status: 'active',
      is_demo: true
    });
    const listingId = crypto.randomUUID();
    await svc.from('marketplace_listings').insert({
      id: listingId,
      organization_id: orgId,
      title: 'Phantom PA Stack — Rent',
      description: 'High-output touring PA stack with subs. Vendor: Blackwater Audio Co.',
      price: 1500.00,
      currency: 'USD',
      status: 'active',
      vendor_id: vendorId,
      is_demo: true
    });
  } catch {}
  // Best-effort: upload a few demo assets to Storage and link in files table
  try {
    const assets: Array<{ url: string; name: string; contentType: string }> = [
      { url: 'https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?w=1200', name: 'main-deck-stage.jpg', contentType: 'image/jpeg' },
      { url: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=1200', name: 'harbor-east-rig.jpg', contentType: 'image/jpeg' },
      { url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', name: 'site-plan.pdf', contentType: 'application/pdf' },
    ];
    const projectId = (data && (data as any).project_id) || null;
    for (const a of assets) {
      const resp = await fetch(a.url);
      if (!resp.ok) continue;
      const arrayBuf = await resp.arrayBuffer();
      const path = `${orgId}/${Date.now()}_${a.name}`;
      const { error: upErr } = await supabase.storage.from('attachments').upload(path, arrayBuf, { contentType: a.contentType, upsert: false });
      if (!upErr) {
        await supabase.from('files').insert({
          organization_id: orgId,
          project_id: projectId,
          name: a.name,
          path,
          mime_type: a.contentType,
          size: arrayBuf.byteLength,
          is_demo: true,
        });
      }
    }
  } catch {}
  // Notify user
  await supabase.from('user_notifications').insert({
    organization_id: orgId,
    title: 'Demo data loaded',
    body: 'Pirate-themed demo projects and resources are now available.',
    href: '/projects/overview'
  });
  return NextResponse.json({ ok: true, data });
}

export async function DELETE(req: NextRequest, { params }: { params: { orgId: string } }) {
  const cookieStore = cookies();
  const supabase = createServerClient({
    get: (name: string) => {
      const c = cookieStore.get(name);
      return c ? { name: c.name, value: c.value } : undefined;
    },
    set: (name: string, value: string, options) => cookieStore.set(name, value, options),
    remove: (name: string) => cookieStore.delete(name)
  });

  const orgId = params.orgId;
  const { data, error } = await supabase.rpc('remove_demo_for_org', { org_uuid: orgId });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
  // Notify user
  await supabase.from('user_notifications').insert({
    organization_id: orgId,
    title: 'Demo data removed',
    body: 'All demo records have been deleted for this organization.',
    href: '/projects/overview'
  });
  return NextResponse.json({ ok: true, data });
}
