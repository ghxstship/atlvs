'use client';

import { X, DollarSign, MapPin, Calendar, Tag, Star } from "lucide-react";
import { useState, useEffect } from 'react';
import { Button, Input, Textarea, Select, Card, Badge } from '@ghxstship/ui';
import type { MarketplaceListing } from '../types';
import type { ListingFormData } from '../listings/types';

interface CreateListingClientProps {
 mode: 'create' | 'edit' | 'view';
 listing?: MarketplaceListing | null;
 onSuccess: () => void;
 onCancel: () => void;
}

export default function CreateListingClient({ mode, listing, onSuccess, onCancel }: CreateListingClientProps) {
 const [formData, setFormData] = useState<ListingFormData>({
 title: '',
 description: '',
 type: 'offer',
 category: 'equipment',
 subcategory: '',
 pricing: {
 amount: 0,
 currency: 'USD',
 negotiable: true,
 paymentTerms: ''
 },
 location: {
 city: '',
 state: '',
 country: 'US',
 isRemote: false
 },
 availability: {
 startDate: '',
 endDate: '',
 flexible: true,
 immediateAvailable: false
 },
 requirements: [],
 tags: [],
 contactInfo: {
 preferredMethod: 'platform',
 email: '',
 phone: '',
 showPublic: false
 },
 featured: false,
 expiresAt: ''
 });
 
 const [loading, setLoading] = useState(false);
 const [currentTag, setCurrentTag] = useState('');

 useEffect(() => {
 if (listing && mode !== 'create') {
 setFormData({
 title: listing.title,
 description: listing.description,
 type: listing.type,
 category: listing.category,
 subcategory: listing.subcategory || '',
 pricing: listing.pricing || {
 amount: 0,
 currency: 'USD',
 negotiable: true,
 paymentTerms: ''
 },
 location: listing.location || {
 city: '',
 state: '',
 country: 'US',
 isRemote: false
 },
 availability: listing.availability || {
 startDate: '',
 endDate: '',
 flexible: true,
 immediateAvailable: false
 },
 requirements: listing.requirements || [],
 tags: listing.tags || [],
 contactInfo: listing.contactInfo || {
 preferredMethod: 'platform',
 email: '',
 phone: '',
 showPublic: false
 },
 featured: listing.featured,
 expiresAt: listing.expires_at || ''
 });
 }
 }, [listing, mode]);

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (mode === 'view') return;

 setLoading(true);

 try {
 const url = '/api/v1/marketplace/listings';
 const method = mode === 'create' ? 'POST' : 'PUT';
 const body = mode === 'edit' ? { id: listing?.id, ...formData } : formData;

 const response = await fetch(url, {
 method,
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify(body)
 });

 if (response.ok) {
 onSuccess();
 } else {
 const error = await response.json();
 console.error('Error saving listing:', error);
 }
 } catch (error) {
 console.error('Error saving listing:', error);
 } finally {
 setLoading(false);
 }
 };

 const addTag = () => {
 if (currentTag.trim() && !formData.tags?.includes(currentTag.trim())) {
 setFormData(prev => ({
 ...prev,
 tags: [...(prev.tags || []), currentTag.trim()]
 }));
 setCurrentTag('');
 }
 };

 const removeTag = (tagToRemove: string) => {
 setFormData(prev => ({
 ...prev,
 tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
 }));
 };

 const isReadOnly = mode === 'view';

 return (
 <form onSubmit={handleSubmit} className="stack-lg p-md">
 {/* Basic Information */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md">Basic Information</h3>
 <div className="stack-sm">
 <Input
 
 value={formData.title}
 onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
 placeholder="Enter listing title"
 required
 disabled={isReadOnly}
 />
 
 <Textarea
 
 value={formData.description}
 onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
 placeholder="Describe your listing"
 rows={4}
 disabled={isReadOnly}
 />

 <div className="grid grid-cols-2 gap-sm">
 <Select
 
 value={formData.type}
 onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as unknown }))}
 disabled={isReadOnly}
 >
 <option value="offer">Offer</option>
 <option value="request">Request</option>
 <option value="exchange">Exchange</option>
 </Select>

 <Select
 
 value={formData.category}
 onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as unknown }))}
 disabled={isReadOnly}
 >
 <option value="equipment">Equipment</option>
 <option value="services">Services</option>
 <option value="talent">Talent</option>
 <option value="locations">Locations</option>
 <option value="materials">Materials</option>
 <option value="other">Other</option>
 </Select>
 </div>
 </div>
 </Card>

 {/* Pricing */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md flex items-center gap-xs">
 <DollarSign className="h-icon-xs w-icon-xs" />
 Pricing
 </h3>
 <div className="stack-sm">
 <div className="grid grid-cols-2 gap-sm">
 <Input
 
 type="number"
 value={formData.pricing?.amount || 0}
 onChange={(e) => setFormData(prev => ({
 ...prev,
 pricing: { ...prev.pricing, amount: parseFloat(e.target.value) || 0 }
 }))}
 placeholder="0.00"
 disabled={isReadOnly}
 />
 
 <Select
 
 value={formData.pricing?.currency || 'USD'}
 onChange={(e) => setFormData(prev => ({
 ...prev,
 pricing: { ...prev.pricing, currency: value }
 }))}
 disabled={isReadOnly}
 >
 <option value="USD">USD</option>
 <option value="EUR">EUR</option>
 <option value="GBP">GBP</option>
 <option value="CAD">CAD</option>
 </Select>
 </div>

 <label className="flex items-center gap-sm">
 <input
 type="checkbox"
 checked={formData.pricing?.negotiable || false}
 onChange={(e) => setFormData(prev => ({
 ...prev,
 pricing: { ...prev.pricing, negotiable: e.target.checked }
 }))}
 disabled={isReadOnly}
 />
 <span>Price is negotiable</span>
 </label>
 </div>
 </Card>

 {/* Location */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md flex items-center gap-xs">
 <MapPin className="h-icon-xs w-icon-xs" />
 Location
 </h3>
 <div className="stack-sm">
 <div className="grid grid-cols-2 gap-sm">
 <Input
 
 value={formData.location?.city || ''}
 onChange={(e) => setFormData(prev => ({
 ...prev,
 location: { ...prev.location, city: e.target.value }
 }))}
 placeholder="City"
 required
 disabled={isReadOnly}
 />
 
 <Input
 
 value={formData.location?.state || ''}
 onChange={(e) => setFormData(prev => ({
 ...prev,
 location: { ...prev.location, state: e.target.value }
 }))}
 placeholder="State or Province"
 disabled={isReadOnly}
 />
 </div>

 <label className="flex items-center gap-sm">
 <input
 type="checkbox"
 checked={formData.location?.isRemote || false}
 onChange={(e) => setFormData(prev => ({
 ...prev,
 location: { ...prev.location, isRemote: e.target.checked }
 }))}
 disabled={isReadOnly}
 />
 <span>Remote/Virtual available</span>
 </label>
 </div>
 </Card>

 {/* Tags */}
 <Card className="p-md">
 <h3 className="text-heading-4 mb-md flex items-center gap-xs">
 <Tag className="h-icon-xs w-icon-xs" />
 Tags
 </h3>
 <div className="stack-sm">
 {!isReadOnly && (
 <div className="flex gap-sm">
 <Input
 value={currentTag}
 onChange={(e) => setCurrentTag(e.target.value)}
 placeholder="Add a tag"
 onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
 />
 <Button type="button" onClick={addTag} size="sm">
 Add
 </Button>
 </div>
 )}
 <div className="flex flex-wrap gap-xs">
 {formData.tags?.map((tag, index) => (
 <Badge key={index} variant="secondary" className="flex items-center gap-xs">
 {tag}
 {!isReadOnly && (
 <button
 type="button"
 onClick={() => removeTag(tag)}
 className="ml-xs hover:text-destructive"
 >
 <X className="h-3 w-3" />
 </button>
 )}
 </Badge>
 ))}
 </div>
 </div>
 </Card>

 {/* Actions */}
 <div className="flex justify-end gap-sm pt-md border-t">
 <Button type="button" variant="outline" onClick={onCancel}>
 {isReadOnly ? 'Close' : 'Cancel'}
 </Button>
 {!isReadOnly && (
 <Button type="submit" loading={loading}>
 {mode === 'create' ? 'Create Listing' : 'Update Listing'}
 </Button>
 )}
 </div>
 </form>
 );
}
