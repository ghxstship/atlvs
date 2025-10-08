'use client';

import { useState, useCallback, useEffect } from 'react';
import { Card, Button, Badge, Input, Textarea, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Tabs, TabsContent, TabsList, TabsTrigger, Drawer , CardBody} from '@ghxstship/ui';
import { AlertCircle, Award, Briefcase, Calendar, Camera, CheckCircle, Clock, DollarSign, Edit, Eye, FileText, Globe, Link2, Mail, MapPin, Phone, Plus, Shield, Star, Trash2, Upload, User } from 'lucide-react';
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

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    loadVendorProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
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
    <div className="brand-opendeck stack-lg">
      {/* Profile Header */}
      <Card className="p-lg">
        <div className="brand-opendeck flex items-start justify-between">
          <div className="brand-opendeck flex items-start cluster">
            <div className="brand-opendeck relative">
              <div className="brand-opendeck w-component-lg h-component-lg rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center color-accent-foreground text-heading-3">
                {profile?.display_name?.charAt(0) || 'V'}
              </div>
              {profile?.verified && (
                <div className="brand-opendeck absolute -bottom-1 -right-1 bg-success rounded-full p-xs">
                  <CheckCircle className="h-icon-sm w-icon-sm text-background" />
                </div>
              )}
            </div>
            <div>
              <h2 className="text-heading-3">{profile?.display_name || 'Vendor Profile'}</h2>
              <p className="color-muted">{profile?.tagline || 'No tagline set'}</p>
              <div className="brand-opendeck flex items-center cluster mt-sm">
                <Badge variant={profile?.availability_status === 'available' ? 'success' : 'secondary'}>
                  {profile?.availability_status || 'Available'}
                </Badge>
                <div className="brand-opendeck flex items-center">
                  <Star className="h-icon-xs w-icon-xs color-warning fill-warning" />
                  <span className="ml-xs text-body-sm">{profile?.rating || 0} ({profile?.total_reviews || 0} reviews)</span>
                </div>
              </div>
            </div>
          </div>
          <Button onClick={() => setEditMode(!editMode)} variant="secondary">
            <Edit className="h-icon-xs w-icon-xs mr-sm" />
            {editMode ? 'Cancel' : 'Edit Profile'}
          </Button>
        </div>
      </Card>

      {/* Profile Form */}
      {editMode ? (
        <Card className="p-lg">
          <form onSubmit={handleSubmit(onSubmit)} className="stack-md">
            <div className="brand-opendeck grid grid-cols-1 md:grid-cols-2 gap-md">
              <div>
                <label className="text-body-sm form-label">Business Name</label>
                <Input {...register('business_name')} placeholder="Your business name" />
                {errors.business_name && (
                  <p className="text-body-sm color-destructive mt-xs">{errors.business_name.message}</p>
                )}
              </div>

              <div>
                <label className="text-body-sm form-label">Business Type</label>
                <Select 
                  value={watch('business_type')} 
                  onValueChange={(value: any) => setValue('business_type', value as any)}
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
                  <p className="text-body-sm color-destructive mt-xs">{errors.display_name.message}</p>
                )}
              </div>

              <div>
                <label className="text-body-sm form-label">Email</label>
                <Input {...register('email')} type="email" placeholder="contact@example.com" />
                {errors.email && (
                  <p className="text-body-sm color-destructive mt-xs">{errors.email.message}</p>
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
                  onValueChange={(value: any) => setValue('primary_category', value)}
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
                  onValueChange={(value: any) => setValue('availability_status', value as any)}
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

            <div className="brand-opendeck flex justify-end cluster-sm">
              <Button type="button" variant="secondary" onClick={() => setEditMode(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : 'Save Profile'}
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <div className="brand-opendeck grid grid-cols-1 md:grid-cols-3 gap-lg">
          <Card className="md:col-span-2 p-lg">
            <h3 className="text-body text-heading-4 mb-md">About</h3>
            <p className="color-muted mb-lg">
              {profile?.bio || 'No bio provided yet.'}
            </p>

            <div className="brand-opendeck stack-md">
              <div className="brand-opendeck flex items-center">
                <Briefcase className="h-icon-sm w-icon-sm mr-sm color-muted" />
                <span>{profile?.years_experience || 0} years experience</span>
              </div>
              <div className="brand-opendeck flex items-center">
                <User className="h-icon-sm w-icon-sm mr-sm color-muted" />
                <span>Team of {profile?.team_size || 1}</span>
              </div>
              <div className="brand-opendeck flex items-center">
                <DollarSign className="h-icon-sm w-icon-sm mr-sm color-muted" />
                <span>${profile?.hourly_rate || 0}/hour</span>
              </div>
              <div className="brand-opendeck flex items-center">
                <Clock className="h-icon-sm w-icon-sm mr-sm color-muted" />
                <span>Responds {profile?.response_time || 'within 24 hours'}</span>
              </div>
            </div>

            <div className="brand-opendeck mt-lg">
              <h4 className="form-label mb-sm">Skills</h4>
              <div className="brand-opendeck flex flex-wrap gap-sm">
                {(profile?.skills || []).map((skill: string) => (
                  <Badge key={skill} variant="secondary">{skill}</Badge>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-lg">
            <h3 className="text-body text-heading-4 mb-md">Contact</h3>
            <div className="brand-opendeck stack-sm">
              <div className="brand-opendeck flex items-center">
                <Mail className="h-icon-xs w-icon-xs mr-sm color-muted" />
                <span className="text-body-sm">{profile?.email}</span>
              </div>
              {profile?.phone && (
                <div className="brand-opendeck flex items-center">
                  <Phone className="h-icon-xs w-icon-xs mr-sm color-muted" />
                  <span className="text-body-sm">{profile?.phone}</span>
                </div>
              )}
              {profile?.website && (
                <div className="brand-opendeck flex items-center">
                  <Globe className="h-icon-xs w-icon-xs mr-sm color-muted" />
                  <a href="#" target="_blank" rel="noopener noreferrer" 
                     className="text-body-sm color-accent hover:underline">
                    Website
                  </a>
                </div>
              )}
              {profile?.address && (
                <div className="brand-opendeck flex items-start">
                  <MapPin className="h-icon-xs w-icon-xs mr-sm mt-0.5 color-muted" />
                  <span className="text-body-sm">
                    {profile.address.city}, {profile.address.state}
                  </span>
                </div>
              )}
            </div>

            <div className="brand-opendeck mt-lg">
              <h4 className="form-label mb-sm">Verification</h4>
              <div className="brand-opendeck stack-sm">
                <div className="brand-opendeck flex items-center">
                  {profile?.verified ? (
                    <CheckCircle className="h-icon-xs w-icon-xs mr-sm color-success" />
                  ) : (
                    <AlertCircle className="h-icon-xs w-icon-xs mr-sm color-warning" />
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
    <div className="brand-opendeck stack-lg">
      <div className="brand-opendeck flex justify-between items-center">
        <h3 className="text-body text-heading-4">Portfolio Items</h3>
        <Button onClick={() => {
          setDrawerMode('portfolio');
          setSelectedItem(null);
          setDrawerOpen(true);
        }}>
          <Plus className="h-icon-xs w-icon-xs mr-sm" />
          Add Portfolio Item
        </Button>
      </div>

      <div className="brand-opendeck grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {portfolio.map((item: any) => (
          <Card key={item.id} className="overflow-hidden">
            <div className="brand-opendeck aspect-video bg-gradient-to-br from-primary to-secondary relative">
              {item.featured && (
                <Badge className="absolute top-xs right-2" variant="secondary">
                  Featured
                </Badge>
              )}
            </div>
            <div className="brand-opendeck p-md">
              <h4 className="text-body text-heading-4">{item.title}</h4>
              <p className="text-body-sm color-muted mt-xs">{item.category}</p>
              <p className="text-body-sm mt-sm line-clamp-xs">{item.description}</p>
              <div className="brand-opendeck flex items-center justify-between mt-md">
                <div className="brand-opendeck flex items-center cluster-sm text-body-sm color-muted">
                  <Eye className="h-icon-xs w-icon-xs" />
                  <span>{item.views || 0}</span>
                </div>
                <div className="brand-opendeck flex cluster-sm">
                  <Button variant="ghost" onClick={() => {
                    setSelectedItem(item);
                    setDrawerMode('portfolio');
                    setDrawerOpen(true);
                  }}>
                    <Edit className="h-icon-xs w-icon-xs" />
                  </Button>
                  <Button variant="ghost">
                    <Trash2 className="h-icon-xs w-icon-xs" />
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
    <div className="brand-opendeck stack-lg">
      <div className="brand-opendeck flex justify-between items-center">
        <h3 className="text-body text-heading-4">Services</h3>
        <Button onClick={() => {
          setDrawerMode('service');
          setSelectedItem(null);
          setDrawerOpen(true);
        }}>
          <Plus className="h-icon-xs w-icon-xs mr-sm" />
          Add Service
        </Button>
      </div>

      <div className="brand-opendeck grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
        {services.map((service: any) => (
          <Card key={service.id} className="p-md">
            <div className="brand-opendeck flex justify-between items-start mb-sm">
              <h4 className="text-body text-heading-4">{service.title}</h4>
              <Badge variant={service.status === 'active' ? 'success' : 'secondary'}>
                {service.status}
              </Badge>
            </div>
            <p className="text-body-sm color-muted mb-sm">{service.category}</p>
            <p className="text-body-sm line-clamp-xs mb-md">{service.description}</p>
            <div className="brand-opendeck stack-sm">
              <div className="brand-opendeck flex justify-between text-body-sm">
                <span>Starting at</span>
                <span className="text-body-sm">${service.base_price}</span>
              </div>
              <div className="brand-opendeck flex justify-between text-body-sm">
                <span>Delivery</span>
                <span>{service.delivery_time}</span>
              </div>
              <div className="brand-opendeck flex justify-between text-body-sm">
                <span>Orders</span>
                <span>{service.orders_completed || 0}</span>
              </div>
            </div>
            <div className="brand-opendeck flex cluster-sm mt-md">
              <Button variant="secondary" className="flex-1" onClick={() => {
                setSelectedItem(service);
                setDrawerMode('service');
                setDrawerOpen(true);
              }}>
                Edit
              </Button>
              <Button variant="secondary" className="flex-1">
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
      <div className="brand-opendeck flex items-center justify-center h-container-sm">
        <div className="brand-opendeck animate-spin rounded-full h-icon-lg w-icon-lg border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="brand-opendeck stack-lg">
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
          <Card className="p-lg">
            <h3 className="text-body text-heading-4 mb-md">Earnings Overview</h3>
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
        <div className="brand-opendeck p-md">
          <p className="color-muted">
            Form for {drawerMode} will be implemented here...
          </p>
        </div>
      </Drawer>
    </div>
  );
}
