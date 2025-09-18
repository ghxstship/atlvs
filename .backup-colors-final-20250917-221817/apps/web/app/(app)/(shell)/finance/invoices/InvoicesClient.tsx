'use client';

import { useState, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { createBrowserClient } from '@ghxstship/auth';
import { 
  Card, 
  Button, 
  Badge, 
  Skeleton,
  Drawer,
  StateManagerProvider,
  Input
} from '@ghxstship/ui';
import { 
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  Send,
  Download,
  Search,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import CreateInvoiceClient from './CreateInvoiceClient';

interface InvoicesClientProps {
  user: User;
  orgId: string;
  translations: {
    title: string;
    subtitle: string;
  };
}

interface Invoice {
  id: string;
  invoice_number: string;
  client_name: string;
  client_email?: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  issue_date: string;
  due_date: string;
  payment_terms?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  organization_id: string;
}

const InvoicesClient: React.FC<InvoicesClientProps> = ({ user, orgId, translations }) => {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isCreateDrawerOpen, setIsCreateDrawerOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <StateManagerProvider>
      <div className="stack-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-heading-3 text-heading-3 color-foreground">{translations.title}</h1>
            <p className="text-body-sm color-foreground/70 mt-xs">{translations.subtitle}</p>
          </div>
          <Button onClick={() => setIsCreateDrawerOpen(true)}>
            <Plus className="h-4 w-4 mr-sm" />
            Create Invoice
          </Button>
        </div>

        <Card className="p-2xl text-center">
          <FileText className="h-12 w-12 mx-auto mb-md color-foreground/30" />
          <h3 className="text-body text-heading-4 color-foreground mb-sm">Invoice management coming soon</h3>
          <p className="color-foreground/70 mb-md">This feature is under development</p>
        </Card>

        <CreateInvoiceClient
          user={user}
          orgId={orgId}
          isOpen={isCreateDrawerOpen}
          onClose={() => setIsCreateDrawerOpen(false)}
          onSuccess={() => setIsCreateDrawerOpen(false)}
        />
      </div>
    </StateManagerProvider>
  );
};

export default InvoicesClient;
