'use client';

import { useState, useEffect } from 'react';
import { 
  Card, Button, Badge, Input, Textarea, Select, SelectContent, 
  SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, 
  TabsList, TabsTrigger, Drawer 
} from '@ghxstship/ui';
import { 
  User, Briefcase, Award, Globe, Mail, Phone, MapPin, Calendar,
  DollarSign, Clock, Star, Upload, Plus, Edit, Trash2, Eye,
  Camera, FileText, Link2, Shield, CheckCircle, AlertCircle
} from 'lucide-react';
import { createBrowserClient } from '@ghxstship/auth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const vendorProfileSchema = z.object({
  business_name: z.string().min(2, 'Business name is required'),
  business_type: z.enum(['individual', 'company', 'agency']),
  display_name: z.string().min(2, 'Display name is required'),
  tagline: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  email: z.string().email('Valid email required'),
  phone: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  primary_category: z.string().min(1, 'Category is required'),
  skills: z.array(z.string()).optional(),
  years_experience: z.number().min(0).max(50).optional(),
  team_size: z.number().min(1).max(1000).optional(),
  hourly_rate: z.number().min(0).optional(),
  currency: z.string().default('USD'),
  availability_status: z.enum(['available', 'busy', 'unavailable']),
  response_time: z.string().optional()
});

type VendorProfileForm = z.infer<typeof vendorProfileSchema>;

interface VendorProfileClientProps {
  userId: string;
  orgId: string;
}

export default function VendorProfileClient({ userId, orgId }: VendorProfileClientProps) {
  const supabase = createBrowserClient();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [portfolio, setPortfolio] = useState<any[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [certifications, setCertifications] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('profile');
  const [editMode, setEditMode] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerMode, setDrawerMode] = useState<'portfolio' | 'service' | 'certification'>('portfolio');
  const [selectedItem, setSelectedItem] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch
  } = useForm<VendorProfileForm>({
    resolver: zodResolver(vendorProfileSchema)
  });

  const categories = [
    'Audio & Sound',
    'Lighting Design',
    'Stage Production',
    'Video & Projection',
    'Event Management',
    'Artist Services',
    'Logistics & Transport',
    'Catering & Hospitality',
    'Security & Safety',
    'Marketing & Promotion'
  ];

  const skillsList = [
    'Live Sound Engineering',
    'Stage Design',
    'Lighting Programming',
    'Video Production',
    'Event Planning',
    'Artist Management',
    'Technical Direction',
    'Project Management',
    'Budget Management',
    'Team Leadership'
  ];

  useEffect(() => {
    loadVendorProfile();
  }, [userId]);

  async function loadVendorProfile() {
    setLoading(true);
    try {
      // Load vendor profile
      const { data: vendorData } = await supabase
        .from('opendeck_vendor_profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (vendorData) {
        setProfile(vendorData);
        reset(vendorData);

        // Load portfolio items
        const { data: portfolioData } = await supabase
          .from('opendeck_portfolio_items')
          .select('*')
          .eq('vendor_id', vendorData.id)
          .order('created_at', { ascending: false });
        
        setPortfolio(portfolioData || []);

        // Load services
        const { data: servicesData } = await supabase
          .from('opendeck_services')
          .select('*')
          .eq('vendor_id', vendorData.id)
          .order('created_at', { ascending: false });
        
        setServices(servicesData || []);

        // Load certifications
        if (vendorData.certifications) {
          setCertifications(vendorData.certifications);
        }
      }
    } catch (error) {
      console.error('Error loading vendor profile:', error);
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(data: VendorProfileForm) {
    try {
      if (profile) {
        // Update existing profile
        const { error } = await supabase
          .from('opendeck_vendor_profiles')
          .update(data)
          .eq('id', profile.id);

        if (error) throw error;
      } else {
        // Create new profile
        const { error } = await supabase
          .from('opendeck_vendor_profiles')
          .insert({
            ...data,
            user_id: userId,
            organization_id: orgId
          });

        if (error) throw error;
      }

      setEditMode(false);
      loadVendorProfile();
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  }

  const ProfileTab = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <Card className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center color-primary-foreground text-heading-3 text-heading-3">
                {profile?.display_name?.charAt(0) || 'V'}
              </div>
              {profile?.verified && (
                <div className="absolute -bottom-1 -right-1 bg-success rounded-full p-1">
                  <CheckCircle className="h-5 w-5 text-background" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-heading-3 text-heading-3">{profile?.display_name || 'Vendor Profile'}</h2>
              <p className="color-muted">{profile?.tagline || 'No tagline set'}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant={profile?.availability_status === 'available' ? 'success' : 'secondary'}>
                  {profile?.availability_status || 'Available'}
                </Badge>
                <div className="flex items-center">
                  <Star className="h-4 w-4 color-warning fill-warning" />
                  <span className="ml-1 text-body-sm">{profile?.rating || 0} ({profile?.total_reviews || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>
          <Button onClick={() => setEditMode(!editMode)} variant="outline">
            <Edit className="h-4 w-4 mr-2" />
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </Card>

      {/* Profile Form */}
      {editMode ? (
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-body-sm form-label">Business Name</label>
                <Input {...register('business_name')} placeholder="Your business name" />
                {errors.business_name && (
                  <p className="text-body-sm color-destructive mt-1">{errors.business_name.message}</p>
                )}
              </div>

              <div>
                <label className="text-body-sm form-label">Business Type</label>
                <Select 
                  value={watch('business_type')} 
                  onValueChange={(value) => setValue('business_type', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="individual">Individual</SelectItem>
                    <SelectItem value="company">Company</SelectItem>
                    <SelectItem value="agency">Agency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-body-sm form-label">Display Name</label>
                <Input {...register('display_name')} placeholder="Public display name" />
                {errors.display_name && (
                  <p className="text-body-sm color-destructive mt-1">{errors.display_name.message}</p>
                )}
              </div>

              <div>
                <label className="text-body-sm form-label">Email</label>
                <Input {...register('email')} type="email" placeholder="contact@example.com" />
                {errors.email && (
                  <p className="text-body-sm color-destructive mt-1">{errors.email.message}</p>
                )}
              </div>

              <div>
                <label className="text-body-sm form-label">Phone</label>
                <Input {...register('phone')} placeholder="+1 234 567 8900" />
              </div>

              <div>
                <label className="text-body-sm form-label">Website</label>
                <Input {...register('website')} placeholder="https://example.com" />
              </div>

              <div>
                <label className="text-body-sm form-label">Primary Category</label>
                <Select 
                  value={watch('primary_category')} 
                  onValueChange={(value) => setValue('primary_category', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-body-sm form-label">Availability</label>
                <Select 
                  value={watch('availability_status')} 
                  onValueChange={(value) => setValue('availability_status', value as any)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="unavailable">Unavailable</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-body-sm form-label">Years of Experience</label>
                <Input 
                  {...register('years_experience', { valueAsNumber: true })} 
                  type="number" 
                  placeholder="5" 
                />
              </div>

              <div>
                <label className="text-body-sm form-label">Team Size</label>
                <Input 
                  {...register('team_size', { valueAsNumber: true })} 
                  type="number" 
                  placeholder="10" 
                />
              </div>

              <div>
                <label className="text-body-sm form-label">Hourly Rate</label>
                <Input 
                  {...register('hourly_rate', { valueAsNumber: true })} 
                  type="number" 
                  placeholder="150" 
                />
              </div>

              <div>
                <label className="text-body-sm form-label">Response Time</label>
                <Input {...register('response_time')} placeholder="Within 1 hour" />
              </div>
            </div>

            <div>
              <label className="text-body-sm form-label">Tagline</label>
              <Input {...register('tagline')} placeholder="Your professional tagline" />
            </div>

            <div>
              <label className="text-body-sm form-label">Bio</label>
              <Textarea 
                {...register('bio')} 
                placeholder="Tell clients about your experience and expertise..."
                rows={4}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="md:col-span-2 p-6">
            <h3 className="text-body text-heading-4 mb-4">About</h3>
            <p className="color-muted mb-6">
              {profile?.bio || 'No bio provided yet.'}
            </p>

            <div className="space-y-4">
              <div className="flex items-center">
                <Briefcase className="h-5 w-5 mr-3 color-muted" />
                <span>{profile?.years_experience || 0} years experience</span>
              </div>
              <div className="flex items-center">
                <User className="h-5 w-5 mr-3 color-muted" />
                <span>Team of {profile?.team_size || 1}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 mr-3 color-muted" />
                <span>${profile?.hourly_rate || 0}/hour</span>
              </div>
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 color-muted" />
                <span>Responds {profile?.response_time || 'within 24 hours'}</span>
              </div>
            </div>

            <div className="mt-6">
              <h4 className="form-label mb-2">Skills</h4>
              <div className="flex flex-wrap gap-2">
                {(profile?.skills || []).map((skill: string) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-body text-heading-4 mb-4">Contact</h3>
            <div className="space-y-3">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2 color-muted" />
                <span className="text-body-sm">{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 color-muted" />
                  <span className="text-body-sm">{profile?.phone}</span>
                </div>
              )}
              {profile?.website && (
                <div className="flex items-center">
                  <Globe className="h-4 w-4 mr-2 color-muted" />
                  <a href={profile.website as any} target="_blank" rel="noopener noreferrer" 
                     className="text-body-sm color-primary hover:underline">
                    Website
                  </a>
                </div>
              )}
              {profile?.address && (
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 color-muted" />
                  <span className="text-body-sm">
                    {profile.address.city}, {profile.address.state}
                  </span>
                </div>
              )}
            </div>

            <div className="mt-6">
              <h4 className="form-label mb-2">Verification</h4>
              <div className="space-y-2">
                <div className="flex items-center">
                  {profile?.verified ? (
                    <CheckCircle className="h-4 w-4 mr-2 color-success" />
                  ) : (
                    <AlertCircle className="h-4 w-4 mr-2 color-warning" />
                  )}
                  <span className="text-body-sm">
                    {profile?.verified ? 'Verified Vendor' : 'Pending Verification'}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );

  const PortfolioTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-body text-heading-4">Portfolio Items</h3>
        <Button onClick={() => {
          setDrawerMode('portfolio');
          setSelectedItem(null);
          setDrawerOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Portfolio Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {portfolio.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="aspect-video bg-gradient-to-br from-primary to-accent relative">
              {item.featured && (
                <Badge className="absolute top-2 right-2" variant="secondary">
                  Featured
                </Badge>
              )}
            </div>
            <div className="p-4">
              <h4 className="text-heading-4">{item.title}</h4>
              <p className="text-body-sm color-muted mt-1">{item.category}</p>
              <p className="text-body-sm mt-2 line-clamp-2">{item.description}</p>
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-2 text-body-sm color-muted">
                  <Eye className="h-4 w-4" />
                  <span>{item.views || 0}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" onClick={() => {
                    setSelectedItem(item);
                    setDrawerMode('portfolio');
                    setDrawerOpen(true);
                  }}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  const ServicesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-body text-heading-4">Services</h3>
        <Button onClick={() => {
          setDrawerMode('service');
          setSelectedItem(null);
          setDrawerOpen(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Service
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.map((service) => (
          <Card key={service.id} className="p-4">
            <div className="flex justify-between items-start mb-3">
              <h4 className="text-heading-4">{service.title}</h4>
              <Badge variant={service.status === 'active' ? 'success' : 'secondary'}>
                {service.status}
              </Badge>
            </div>
            <p className="text-body-sm color-muted mb-3">{service.category}</p>
            <p className="text-body-sm line-clamp-2 mb-4">{service.description}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-body-sm">
                <span>Starting at</span>
                <span className="text-heading-4">${service.base_price}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span>Delivery</span>
                <span>{service.delivery_time}</span>
              </div>
              <div className="flex justify-between text-body-sm">
                <span>Orders</span>
                <span>{service.orders_completed || 0}</span>
              </div>
            </div>
            <div className="flex space-x-2 mt-4">
              <Button variant="outline" className="flex-1" onClick={() => {
                setSelectedItem(service);
                setDrawerMode('service');
                setDrawerOpen(true);
              }}>
                Edit
              </Button>
              <Button variant="outline" className="flex-1">
                View
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="earnings">Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="profile">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="portfolio">
          <PortfolioTab />
        </TabsContent>

        <TabsContent value="services">
          <ServicesTab />
        </TabsContent>

        <TabsContent value="earnings">
          <Card className="p-6">
            <h3 className="text-body text-heading-4 mb-4">Earnings Overview</h3>
            <p className="color-muted">Earnings tracking coming soon...</p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Drawer for creating/editing items */}
      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={
          drawerMode === 'portfolio' ? 'Portfolio Item' :
          drawerMode === 'service' ? 'Service Package' :
          'Certification'
        }
       
      >
        <div className="p-4">
          <p className="color-muted">
            Form for {drawerMode} will be implemented here...
          </p>
        </div>
      </Drawer>
    </div>
  );
}
