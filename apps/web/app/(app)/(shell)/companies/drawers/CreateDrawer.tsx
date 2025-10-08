/**
 * Companies Create Drawer
 * Form for creating new company records
 */

'use client';
import { Button, Drawer, FormControl, Select, Alert } from '@ghxstship/ui';
import { Alert, Box, Button, Drawer, FormControl, Grid, IconButton, InputLabel, MenuItem, Save, Select, TextField, Typography } from 'lucide-react';

import { useState } from 'react';
import { Close, Save } from '@mui/icons-material';
import type { Company } from '../types';

interface CreateDrawerProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Company>) => Promise<void>;
  loading?: boolean;
}

export default function CreateDrawer({
  open,
  onClose,
  onSubmit,
  loading = false
}: CreateDrawerProps) {
  const [formData, setFormData] = useState<Partial<Company>>({
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
    status: 'pending',
    size: undefined,
    founded_year: undefined,
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (field: keyof Company, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Company name is required';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    if (formData.website && !/^https?:\/\/.+/.test(formData.website)) {
      newErrors.website = 'Website must start with http:// or https://';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      setSubmitError(null);
      await onSubmit(formData);
      // Reset form on success
      setFormData({
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
        status: 'pending',
        size: undefined,
        founded_year: undefined,
        notes: ''
      });
      onClose();
    } catch (error: any) {
      setSubmitError(error.message || 'Failed to create company');
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 500 },
          maxWidth: '100%'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Create New Company
            </Typography>
            <IconButton onClick={onClose} disabled={loading}>
              <Close />
            </IconButton>
          </Box>
        </Box>

        {/* Form Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {submitError && (
            <Alert severity="error" sx={{ mb: 3 }} onClose={() => setSubmitError(null)}>
              {submitError}
            </Alert>
          )}

          <Grid container spacing={3}>
            {/* Basic Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 2, fontWeight: 600 }}>
                Basic Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                required
                label="Company Name"
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={3}
                label="Description"
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Industry"
                value={formData.industry}
                onChange={(e) => handleChange('industry', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="number"
                label="Founded Year"
                value={formData.founded_year || ''}
                onChange={(e) => handleChange('founded_year', e.target.value ? parseInt(e.target.value) : undefined)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={formData.status}
                  label="Status"
                  onChange={(e) => handleChange('status', e.target.value)}
                  disabled={loading}
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="blacklisted">Blacklisted</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>Company Size</InputLabel>
                <Select
                  value={formData.size || ''}
                  label="Company Size"
                  onChange={(e) => handleChange('size', e.target.value || undefined)}
                  disabled={loading}
                >
                  <MenuItem value="">None</MenuItem>
                  <MenuItem value="startup">Startup</MenuItem>
                  <MenuItem value="small">Small</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="large">Large</MenuItem>
                  <MenuItem value="enterprise">Enterprise</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Contact Information */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 2, fontWeight: 600 }}>
                Contact Information
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website"
                value={formData.website}
                onChange={(e) => handleChange('website', e.target.value)}
                error={!!errors.website}
                helperText={errors.website}
                placeholder="https://example.com"
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                type="email"
                label="Email"
                value={formData.email}
                onChange={(e) => handleChange('email', e.target.value)}
                error={!!errors.email}
                helperText={errors.email}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                value={formData.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                disabled={loading}
              />
            </Grid>

            {/* Address */}
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mt: 2, mb: 2, fontWeight: 600 }}>
                Address
              </Typography>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="City"
                value={formData.city}
                onChange={(e) => handleChange('city', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="State/Province"
                value={formData.state}
                onChange={(e) => handleChange('state', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Postal Code"
                value={formData.postal_code}
                onChange={(e) => handleChange('postal_code', e.target.value)}
                disabled={loading}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Country"
                value={formData.country}
                onChange={(e) => handleChange('country', e.target.value)}
                disabled={loading}
              />
            </Grid>

            {/* Notes */}
            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                rows={4}
                label="Notes"
                value={formData.notes}
                onChange={(e) => handleChange('notes', e.target.value)}
                disabled={loading}
              />
            </Grid>
          </Grid>
        </Box>

        {/* Footer Actions */}
        <Box sx={{ p: 3, borderTop: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button
              variant="outlined"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Create Company'}
            </Button>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
}
