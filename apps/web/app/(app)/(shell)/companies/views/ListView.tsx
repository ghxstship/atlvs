/**
 * Companies List View
 * Hierarchical list organization with inline actions and density options
 */

'use client';

import { useState, useMemo } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  ListItemSecondaryAction,
  Avatar,
  IconButton,
  Typography,
  Box,
  Chip,
  Collapse,
  Divider,
} from '@mui/material';
import {
  ExpandMore,
  ExpandLess,
  Edit,
  Delete,
  Visibility,
  MoreVert,
  Business,
} from '@mui/icons-material';
import type { Company } from '../types';

interface ListViewProps {
  companies: Company[];
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  onView?: (company: Company) => void;
  density?: 'compact' | 'comfortable' | 'spacious';
  showDetails?: boolean;
}

export default function ListView({
  companies,
  onEdit,
  onDelete,
  onView,
  density = 'comfortable',
  showDetails = true,
}: ListViewProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>(new Set());

  const toggleExpanded = (companyId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(companyId)) {
      newExpanded.delete(companyId);
    } else {
      newExpanded.add(companyId);
    }
    setExpandedItems(newExpanded);
  };

  const getSpacing = () => {
    switch (density) {
      case 'compact': return 1;
      case 'spacious': return 3;
      default: return 2;
    }
  };

  const getItemHeight = () => {
    switch (density) {
      case 'compact': return 48;
      case 'spacious': return 88;
      default: return 64;
    }
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

  return (
    <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
      {companies.map((company, index) => {
        const isExpanded = expandedItems.has(company.id);
        const hasDetails = company.description || company.email || company.phone || company.website;

        return (
          <Box key={company.id}>
            <ListItem
              sx={{
                minHeight: getItemHeight(),
                py: getSpacing(),
                '&:hover': {
                  bgcolor: 'action.hover',
                },
              }}
            >
              <ListItemAvatar>
                <Avatar
                  src={company.logo_url}
                  alt={company.name}
                  sx={{ width: 40, height: 40 }}
                >
                  {company.name.charAt(0).toUpperCase()}
                </Avatar>
              </ListItemAvatar>

              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                      {company.name}
                    </Typography>
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
                        variant="outlined"
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 0.5 }}>
                    <Typography variant="body2" color="text.secondary">
                      {company.industry}
                    </Typography>
                    {company.founded_year && (
                      <>
                        <Typography variant="body2" color="text.secondary">•</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Founded {company.founded_year}
                        </Typography>
                      </>
                    )}
                    {company.website && (
                      <>
                        <Typography variant="body2" color="text.secondary">•</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {company.website.replace(/^https?:\/\//, '')}
                        </Typography>
                      </>
                    )}
                  </Box>
                }
              />

              <ListItemSecondaryAction>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  {hasDetails && showDetails && (
                    <IconButton
                      size="small"
                      onClick={() => toggleExpanded(company.id)}
                    >
                      {isExpanded ? <ExpandLess /> : <ExpandMore />}
                    </IconButton>
                  )}
                  {onView && (
                    <IconButton size="small" onClick={() => onView(company)}>
                      <Visibility fontSize="small" />
                    </IconButton>
                  )}
                  {onEdit && (
                    <IconButton size="small" onClick={() => onEdit(company)}>
                      <Edit fontSize="small" />
                    </IconButton>
                  )}
                  {onDelete && (
                    <IconButton size="small" onClick={() => onDelete(company)}>
                      <Delete fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton size="small">
                    <MoreVert fontSize="small" />
                  </IconButton>
                </Box>
              </ListItemSecondaryAction>
            </ListItem>

            {hasDetails && showDetails && (
              <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 9, pr: 2, pb: 2 }}>
                  <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 2 }}>
                    {company.description && (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Description
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {company.description}
                        </Typography>
                      </Box>
                    )}
                    {company.email && (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Email
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {company.email}
                        </Typography>
                      </Box>
                    )}
                    {company.phone && (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Phone
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {company.phone}
                        </Typography>
                      </Box>
                    )}
                    {company.address && (
                      <Box>
                        <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                          Address
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {[company.address.street, company.address.city, company.address.state, company.address.zip_code, company.address.country]
                            .filter(Boolean)
                            .join(', ')}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Box>
              </Collapse>
            )}

            {index < companies.length - 1 && <Divider component="li" />}
          </Box>
        );
      })}
    </List>
  );
}
