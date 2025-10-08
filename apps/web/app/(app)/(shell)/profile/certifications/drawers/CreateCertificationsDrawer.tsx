'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  Button,
  Input,
  Label,
  Textarea,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToastContext
} from '@ghxstship/ui';

const formSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  status: z.enum(['active', 'inactive', 'pending']).default('active')
});

type FormData = z.infer<typeof formSchema>;

interface CreateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: FormData) => Promise<void>;
  mode?: 'create' | 'edit';
  initialData?: Partial<FormData>;
}

export default function CreateDrawer({
  isOpen,
  onClose,
  onSave,
  mode = 'create',
  initialData
}: CreateDrawerProps) {
  const { toast } = useToastContext();
  const [loading, setLoading] = useState(false);

  const defaultValues: FormData = {
    name: '',
    description: '',
    status: 'active'
  };

  const { register, handleSubmit, reset, setValue, watch } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { ...defaultValues, ...initialData }
  });

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  const handleSave = async (data: FormData) => {
    try {
      setLoading(true);
      await onSave(data);
      toast.success('Success', `Record ${mode === 'create' ? 'created' : 'updated'} successfully`);
      reset({ ...defaultValues, ...initialData });
      onClose();
    } catch (error) {
      toast.error('Error', `Failed to ${mode} record`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(openState) => {
        if (!openState) {
          handleClose();
        }
      }}
    >
      <DrawerContent className="mx-auto max-w-3xl p-lg">
        <DrawerHeader>
          <DrawerTitle>{mode === 'create' ? 'Create Record' : 'Edit Record'}</DrawerTitle>
          <DrawerDescription>
            {mode === 'create'
              ? 'Add a new record with the form below.'
              : 'Update the record using the form below.'}
          </DrawerDescription>
        </DrawerHeader>
        <form onSubmit={handleSubmit(handleSave)} className="space-y-lg">
          <div className="space-y-sm">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" placeholder="Enter name" {...register('name')} />
          </div>

          <div className="space-y-sm">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter description"
              rows={3}
              {...register('description')}
            />
          </div>

          <div className="space-y-sm">
            <Label htmlFor="status">Status</Label>
            <Select
              value={watch('status')}
              onValueChange={(value) => setValue('status', value as FormData['status'])}
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DrawerFooter className="flex justify-end gap-sm pt-md">
            <DrawerClose asChild>
              <Button type="button" variant="outline" onClick={handleClose} disabled={loading}>
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" loading={loading}>
              {mode === 'create' ? 'Create' : 'Update'}
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
