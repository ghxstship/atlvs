/**
 * Companies Detail Drawer
 * Record detail viewer with related data and audit trail
 */

'use client';
import { Avatar, Button, Card, CardContent, Drawer, Tabs } from '@ghxstship/ui';
import { AttachFile, Avatar, Box, Business, Button, Card, CardContent, Chip, Close, Divider, Drawer, Edit, Email, Grid, History, IconButton, Language, List, ListItem, ListItemAvatar, ListItemText, LocationOn, People, Phone, Tab, Tabs, Typography } from 'lucide-react';

import { useEffect, useState, useCallback } from 'react';
import type { Company } from '../types';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`company-detail-tabpanel-${index}`}
      aria-labelledby={`company-detail-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

interface DetailDrawerProps {
  open: boolean;
  onClose: () => void;
  company: Company | null;
  onEdit?: (company: Company) => void;
  loading?: boolean;
}

export default function DetailDrawer({
  open,
  onClose,
  company,
  onEdit,
  loading = false
}: DetailDrawerProps) {
  const [tabValue, setTabValue] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'prospect': return 'warning';
      case 'former': return 'error';
      default: return 'default';
    }
  };

  const getSizeColor = (size: string) => {
    switch (size) {
      case 'startup': return 'primary';
      case 'small': return 'secondary';
      case 'medium': return 'info';
      case 'large': return 'warning';
      case 'enterprise': return 'error';
      default: return 'default';
    }
  };

  if (!company) return null;

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: { xs: '100%', sm: 600 },
          maxWidth: '100%'
        }
      }}
    >
      <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: 1, borderColor: 'divider' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Company Details
            </Typography>
            <IconButton onClick={onClose}>
              <Close />
            </IconButton>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar
              src={company.logo_url}
              alt={company.name}
              sx={{ width: 64, height: 64 }}
            >
              {company.name.charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
                {company.name}
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                <Chip
                  label={company.status}
                  size="small"
                  color={getStatusColor(company.status)}
                />
                {company.size && (
                  <Chip
                    label={company.size}
                    size="small"
                    color={getSizeColor(company.size)}
                    variant="outlined"
                  />
                )}
                <Chip
                  label={company.industry}
                  size="small"
                  variant="outlined"
                />
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {onEdit && (
                  <Button
                    variant="outlined"
                    startIcon={<Edit />}
                    onClick={() => onEdit(company)}
                    size="small"
                  >
                    Edit
                  </Button>
                )}
              </Box>
            </Box>
          </Box>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab label="Overview" />
            <Tab label="Contacts" />
            <Tab label="Contracts" />
            <Tab label="Qualifications" />
            <Tab label="History" />
          </Tabs>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto' }}>
          <TabPanel value={tabValue} index={0}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business />
                      Company Information
                    </Typography>
                    <Grid container spacing={2}>
                      {company.description && (
                        <Grid item xs={12}>
                          <Typography variant="body2" color="text.secondary">
                            {company.description}
                          </Typography>
                        </Grid>
                      )}
                      {company.founded_year && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Founded
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {company.founded_year}
                          </Typography>
                        </Grid>
                      )}
                      {company.website && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            Website
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            <a href={company.website} target="_blank" rel="noopener noreferrer">
                              {company.website}
                            </a>
                          </Typography>
                        </Grid>
                      )}
                      {company.email && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Email fontSize="small" />
                            Email
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {company.email}
                          </Typography>
                        </Grid>
                      )}
                      {company.phone && (
                        <Grid item xs={12} sm={6}>
                          <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Phone fontSize="small" />
                            Phone
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {company.phone}
                          </Typography>
                        </Grid>
                      )}
                      {company.address && (
                        <Grid item xs={12}>
                          <Typography variant="body2" sx={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn fontSize="small" />
                            Address
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {[company.address.street, company.address.city, company.address.state, company.address.zip_code, company.address.country]
                              .filter(Boolean)
                              .join(', ')}
                          </Typography>
                        </Grid>
                      )}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Company Contacts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contact management would be displayed here with related company contacts.
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={2}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Company Contracts
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Contract lifecycle management would be displayed here.
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={3}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Company Qualifications
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Certification and qualification tracking would be displayed here.
            </Typography>
          </TabPanel>

          <TabPanel value={tabValue} index={4}>
            <Typography variant="h6" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <History />
              Audit History
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Complete audit trail and version history would be displayed here with change tracking.
            </Typography>
          </TabPanel>
        </Box>
      </Box>
    </Drawer>
  );
}
