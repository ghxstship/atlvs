'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Edit } from 'lucide-react';
import {
 Drawer,
 Button,
 Input,
 Label,
 Textarea,
 Select,
 SelectContent,
 SelectItem,
 SelectTrigger,
 SelectValue,
 useToast
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
 const { toast } = useToast();
 const [loading, setLoading] = useState(false);

 const {
 register,
 handleSubmit,
 formState: { errors },
 reset,
 setValue,
 watch
 } = useForm<FormData>({
 resolver: zodResolver(formSchema),
 defaultValues: initialData || {
 name: '',
 description: '',
 status: 'active'
 }
 });

 const handleSave = async (data: FormData) => {
 try {
 setLoading(true);
 await onSave(data);
 toast({
 title: 'Success',
 description: `Record ${mode === 'create' ? 'created' : 'updated'} successfully`
 });
 reset();
 onClose();
 } catch (error) {
 toast({
 title: 'Error',
 description: `Failed to ${mode} record`,
 variant: 'destructive'
 });
 } finally {
 setLoading(false);
 }
 };

 return (
 <Drawer
 isOpen={isOpen}
 onClose={onClose}
 title={`${mode === 'create' ? 'Create' : 'Edit'} Record`}
 description={`${mode === 'create' ? 'Add a new' : 'Update'} record with the form below.`}
 >
 <form onSubmit={handleSubmit(handleSave)} className="space-y-lg">
 <div className="space-y-sm">
 <Label htmlFor="name">Name *</Label>
 <Input
 
 {...register('name')}
 placeholder="Enter name"
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="description">Description</Label>
 <Textarea
 
 {...register('description')}
 placeholder="Enter description"
 rows={3}
 />
 </div>

 <div className="space-y-sm">
 <Label htmlFor="status">Status</Label>
 <Select
 value={watch('status')}
 onChange={(e) => setValue('status', e.target.value as unknown)}
 >
 <SelectTrigger>
 <SelectValue placeholder="Select status" />
 </SelectTrigger>
 <SelectContent>
 <SelectItem value="active">Active</SelectItem>
 <SelectItem value="inactive">Inactive</SelectItem>
 <SelectItem value="pending">Pending</SelectItem>
 </SelectContent>
 </Select>
 </div>

 <div className="flex justify-end gap-sm pt-md">
 <Button
 type="button"
 variant="outline"
 onClick={onClose}
 disabled={loading}
 >
 Cancel
 </Button>
 <Button type="submit" loading={loading}>
 {mode === 'create' ? 'Create' : 'Update'}
 </Button>
 </div>
 </form>
 </Drawer>
 );
}
