import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerFooter,
  toast,
} from '@ghxstship/ui';
import { DirectoryService } from '../lib/directory-service';
import type { CreateCompanyForm } from '../types';

const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(255, 'Name too long'),
  description: z.string().optional(),
  industry: z.string().optional(),
  website: z.string().url('Invalid URL').optional().or(z.literal('')),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  postal_code: z.string().optional(),
  size: z.enum(['startup', 'small', 'medium', 'large', 'enterprise']).optional(),
  founded_year: z.number().min(1800).max(new Date().getFullYear()).optional(),
  notes: z.string().optional(),
});

const INDUSTRY_OPTIONS: ReadonlyArray<{ value: string; label: string }> = [
  { value: 'technology', label: 'Technology' },
  { value: 'finance', label: 'Finance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'manufacturing', label: 'Manufacturing' },
  { value: 'retail', label: 'Retail' },
  { value: 'construction', label: 'Construction' },
  { value: 'education', label: 'Education' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'hospitality', label: 'Hospitality' },
  { value: 'transportation', label: 'Transportation' },
  { value: 'other', label: 'Other' },
];

const SIZE_OPTIONS: ReadonlyArray<{
  value: NonNullable<CreateCompanyForm['size']>;
  label: string;
}> = [
  { value: 'startup', label: 'Startup (1-10 employees)' },
  { value: 'small', label: 'Small (11-50 employees)' },
  { value: 'medium', label: 'Medium (51-200 employees)' },
  { value: 'large', label: 'Large (201-1000 employees)' },
  { value: 'enterprise', label: 'Enterprise (1000+ employees)' },
];

interface CreateCompanyDrawerProps {
  open: boolean;
  onClose: () => void;
  orgId: string;
  onSuccess: () => void;
}

export default function CreateCompanyDrawer({
  open,
  onClose,
  orgId,
  onSuccess,
}: CreateCompanyDrawerProps) {
  const [loading, setLoading] = useState(false);
  const directoryService = useMemo(() => new DirectoryService(), []);

  const form = useForm<CreateCompanyForm>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: '',
      description: '',
      industry: '',
      website: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      country: '',
      postal_code: '',
      size: undefined,
      founded_year: undefined,
      notes: '',
    },
  });

  const industryValue = form.watch('industry') ?? '';
  const sizeValue = form.watch('size') ?? '';

  const handleClose = () => {
    if (!loading) onClose();
  };

  const onSubmit = async (data: CreateCompanyForm) => {
    try {
      setLoading(true);

      const cleanData = Object.fromEntries(
        Object.entries(data).filter(([_, value]) => value !== '' && value !== undefined)
      ) as CreateCompanyForm;

      await directoryService.createCompany(orgId, cleanData);

      toast.success('Company created successfully');
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={open}
      onOpenChange={(value) => {
        if (!value) handleClose();
      }}
    >
      <DrawerContent className="max-w-3xl mx-auto p-lg">
        <DrawerHeader>
          <DrawerTitle>Add New Company</DrawerTitle>
          <DrawerDescription>Create a new company in your directory</DrawerDescription>
        </DrawerHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
          <section className="space-y-md">
            <h3 className="text-lg font-semibold">Basic Information</h3>

            <div>
              <label className="block text-sm font-medium mb-2">Company Name *</label>
              <Input {...form.register('name')} placeholder="Enter company name" autoFocus />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Description</label>
              <Textarea
                {...form.register('description')}
                placeholder="Brief description of the company"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="block text-sm font-medium mb-2">Industry</label>
                <Select
                  value={industryValue}
                  onValueChange={(value) => form.setValue('industry', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent>
                    {INDUSTRY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company Size</label>
                <Select
                  value={sizeValue}
                  onValueChange={(value) =>
                    form.setValue('size', (value || undefined) as CreateCompanyForm['size'])
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    {SIZE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Founded Year</label>
              <Input
                type="number"
                {...form.register('founded_year', { valueAsNumber: true })}
                placeholder="e.g., 2020"
                min={1800}
                max={new Date().getFullYear()}
              />
            </div>
          </section>

          <section className="space-y-md">
            <h3 className="text-lg font-semibold">Contact Information</h3>

            <div>
              <label className="block text-sm font-medium mb-2">Website</label>
              <Input {...form.register('website')} placeholder="https://example.com" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <Input type="email" {...form.register('email')} placeholder="contact@company.com" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <Input {...form.register('phone')} placeholder="+1 (555) 123-4567" />
              </div>
            </div>
          </section>

          <section className="space-y-md">
            <h3 className="text-lg font-semibold">Address</h3>

            <div>
              <label className="block text-sm font-medium mb-2">Street Address</label>
              <Input {...form.register('address')} placeholder="123 Main Street" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="block text-sm font-medium mb-2">City</label>
                <Input {...form.register('city')} placeholder="New York" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">State/Province</label>
                <Input {...form.register('state')} placeholder="NY" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="block text-sm font-medium mb-2">Country</label>
                <Input {...form.register('country')} placeholder="United States" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Postal Code</label>
                <Input {...form.register('postal_code')} placeholder="10001" />
              </div>
            </div>
          </section>

          <section>
            <label className="block text-sm font-medium mb-2">Notes</label>
            <Textarea
              {...form.register('notes')}
              placeholder="Additional notes about the company"
              rows={3}
            />
          </section>

          <DrawerFooter className="flex justify-end gap-sm pt-6 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Create Company
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
