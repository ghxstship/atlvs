'use client';

import { Building, Globe, Mail, Phone, MapPin, Edit, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { User } from '@supabase/supabase-js';
import { Button, Card, Badge } from '@ghxstship/ui';

interface CompanyDetailClientProps {
  company: any; // TODO: Add proper type from companies types
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
    edit: string;
    back: string;
  };
}

export default function CompanyDetailClient({
  company,
  user,
  orgId,
  translations,
}: CompanyDetailClientProps) {
  const router = useRouter();

  const handleEdit = () => {
    router.push(`/companies/${company.id}/edit`);
  };

  const handleBack = () => {
    router.push('/companies');
  };

  return (
    <div className="container mx-auto max-w-4xl space-y-lg p-lg">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-md">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ArrowLeft className="h-icon-xs w-icon-xs" />
            {translations.back}
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{company.name}</h1>
            <p className="text-muted-foreground">{translations.subtitle}</p>
          </div>
        </div>
        <Button onClick={handleEdit}>
          <Edit className="h-icon-xs w-icon-xs mr-2" />
          {translations.edit}
        </Button>
      </div>

      {/* Company Details */}
      <Card className="p-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
          <div className="space-y-md">
            <div>
              <h3 className="font-semibold mb-2">Company Information</h3>
              <div className="space-y-xs">
                <div className="flex items-center gap-xs">
                  <Building className="h-icon-xs w-icon-xs text-muted-foreground" />
                  <span className="font-medium">{company.name}</span>
                </div>
                {company.description && (
                  <p className="text-sm text-muted-foreground">{company.description}</p>
                )}
                {company.industry && (
                  <Badge variant="secondary">{company.industry}</Badge>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-2">Contact Information</h3>
              <div className="space-y-xs">
                {company.website && (
                  <div className="flex items-center gap-xs">
                    <Globe className="h-icon-xs w-icon-xs text-muted-foreground" />
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {company.website}
                    </a>
                  </div>
                )}
                {company.email && (
                  <div className="flex items-center gap-xs">
                    <Mail className="h-icon-xs w-icon-xs text-muted-foreground" />
                    <a
                      href={`mailto:${company.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {company.email}
                    </a>
                  </div>
                )}
                {company.phone && (
                  <div className="flex items-center gap-xs">
                    <Phone className="h-icon-xs w-icon-xs text-muted-foreground" />
                    <a
                      href={`tel:${company.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {company.phone}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-md">
            <div>
              <h3 className="font-semibold mb-2">Address</h3>
              {company.address || company.city ? (
                <div className="flex items-start gap-xs">
                  <MapPin className="h-icon-xs w-icon-xs text-muted-foreground mt-0.5" />
                  <div className="text-sm">
                    {company.address && <div>{company.address}</div>}
                    {company.city && <div>{company.city}</div>}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No address information available</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold mb-2">Status</h3>
              <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                {company.status || 'Unknown'}
              </Badge>
            </div>

            {company.contacts && company.contacts.length > 0 && (
              <div>
                <h3 className="font-semibold mb-2">Contacts</h3>
                <div className="space-y-xs">
                  {company.contacts.map((contact: any) => (
                    <div key={contact.id} className="text-sm">
                      <div className="font-medium">{contact.name}</div>
                      {contact.email && (
                        <a
                          href={`mailto:${contact.email}`}
                          className="text-blue-600 hover:underline"
                        >
                          {contact.email}
                        </a>
                      )}
                      {contact.phone && (
                        <div className="text-muted-foreground">{contact.phone}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Additional sections for contracts, qualifications, ratings would go here */}
    </div>
  );
}
