/**
 * Companies Card View
 * Tile-based grid layout for companies with rich visual information
 */

'use client';
import { Avatar, Card, CardContent, Tooltip } from '@ghxstship/ui';
import { Avatar, Box, Business, Card, CardActions, CardContent, Chip, Delete, Edit, Email, Grid, IconButton, Language, Menu, MenuItem, MoreVert, Phone, Tooltip, Typography, Visibility } from 'lucide-react';

import { useMemo, useState } from 'react';
import type { Company } from '../types';

interface CardViewProps {
  companies: Company[];
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  onView?: (company: Company) => void;
  loading?: boolean;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
}

export default function CardView({
  companies,
  onEdit,
  onDelete,
  onView,
  loading = false
}: CardViewProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, company: Company) => {
    setAnchorEl(event.currentTarget);
    setSelectedCompany(company);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedCompany(null);
  };

  const handleAction = (action: string) => {
    if (!selectedCompany) return;

    switch (action) {
      case 'view':
        onView?.(selectedCompany);
        break;
      case 'edit':
        onEdit?.(selectedCompany);
        break;
      case 'delete':
        onDelete?.(selectedCompany);
        break;
    }
    handleMenuClose();
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

  if (loading) {
    return (
      <Grid container spacing={3}>
        {Array.from({ length: 6 }).map((_, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <Card sx={{ height: 280 }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 1,
                      bgcolor: 'grey.200',
                      mr: 2
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Box
                      sx={{
                        height: 20,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        mb: 1
                      }}
                    />
                    <Box
                      sx={{
                        height: 16,
                        bgcolor: 'grey.200',
                        borderRadius: 1,
                        width: '60%'
                      }}
                    />
                  </Box>
                </Box>
                <Box sx={{ mb: 2 }}>
                  <Box
                    sx={{
                      height: 16,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      mb: 1
                    }}
                  />
                  <Box
                    sx={{
                      height: 16,
                      bgcolor: 'grey.200',
                      borderRadius: 1,
                      width: '80%'
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <>
      <Grid container spacing={3}>
        {companies.map((company) => (
          <Grid item xs={12} sm={6} md={4} key={company.id}>
            <Card
              sx={{
                height: 280,
                display: 'flex',
                flexDirection: 'column',
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ flex: 1, p: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                  <Avatar
                    src={company.logo_url}
                    alt={company.name}
                    sx={{ width: 48, height: 48, mr: 2 }}
                  >
                    {company.name.charAt(0).toUpperCase()}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {company.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                      <Chip
                        label={company.status}
                        size="small"
                        color={getStatusColor(company.status)}
                        variant="outlined"
                      />
                      {company.size && (
                        <Chip
                          label={company.size}
                          size="small"
                          color={getSizeColor(company.size)}
                          variant="outlined"
                        />
                      )}
                    </Box>
                  </Box>
                </Box>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  {company.industry}
                </Typography>

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {company.email && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {company.email}
                      </Typography>
                    </Box>
                  )}
                  {company.phone && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {company.phone}
                      </Typography>
                    </Box>
                  )}
                  {company.website && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Language fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        {company.website.replace(/^https?:\/\//, '')}
                      </Typography>
                    </Box>
                  )}
                  {company.founded_year && (
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Business fontSize="small" color="action" />
                      <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                        Founded {company.founded_year}
                      </Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>

              <CardActions sx={{ justifyContent: 'space-between', px: 3, pb: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {onView && (
                    <Tooltip title="View">
                      <IconButton size="small" onClick={() => onView(company)}>
                        <Visibility fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onEdit && (
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => onEdit(company)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                  {onDelete && (
                    <Tooltip title="Delete">
                      <IconButton size="small" onClick={() => onDelete(company)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  )}
                </Box>
                <IconButton size="small" onClick={(e) => handleMenuClick(e, company)}>
                  <MoreVert fontSize="small" />
                </IconButton>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {onView && <MenuItem onClick={() => handleAction('view')}>View Details</MenuItem>}
        {onEdit && <MenuItem onClick={() => handleAction('edit')}>Edit Company</MenuItem>}
        {onDelete && <MenuItem onClick={() => handleAction('delete')}>Delete Company</MenuItem>}
      </Menu>
    </>
  );
}
