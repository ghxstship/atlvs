/**
 * Companies Table View
 * Advanced grid implementation with frozen columns, cell editing, and conditional formatting
 */

'use client';

import { useState, useMemo } from 'react';
import { DataGrid, GridColDef, GridRowsProp } from '@mui/x-data-grid';
import { Box, Chip, Avatar, IconButton, Tooltip } from '@mui/material';
import { Edit, Delete, Visibility, MoreVert } from '@mui/icons-material';
import type { Company } from '../types';

interface TableViewProps {
  companies: Company[];
  onEdit?: (company: Company) => void;
  onDelete?: (company: Company) => void;
  onView?: (company: Company) => void;
  loading?: boolean;
  onSort?: (field: string, direction: 'asc' | 'desc') => void;
  onFilter?: (filters: Record<string, any>) => void;
}

export default function TableView({
  companies,
  onEdit,
  onDelete,
  onView,
  loading = false,
  onSort,
  onFilter,
}: TableViewProps) {
  const [pageSize, setPageSize] = useState(25);

  const columns: GridColDef[] = useMemo(() => [
    {
      field: 'name',
      headerName: 'Company Name',
      width: 200,
      pinned: 'left',
      renderCell: (params) => (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <Avatar
            src={params.row.logo_url}
            alt={params.value}
            sx={{ width: 32, height: 32 }}
          >
            {params.value?.charAt(0)?.toUpperCase()}
          </Avatar>
          <Box>
            <div style={{ fontWeight: 500 }}>{params.value}</div>
            <div style={{ fontSize: '0.75rem', color: 'text.secondary' }}>
              {params.row.industry}
            </div>
          </Box>
        </Box>
      ),
    },
    {
      field: 'status',
      headerName: 'Status',
      width: 120,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          color={
            params.value === 'active' ? 'success' :
            params.value === 'inactive' ? 'default' :
            params.value === 'prospect' ? 'warning' : 'error'
          }
          variant="outlined"
        />
      ),
    },
    {
      field: 'size',
      headerName: 'Size',
      width: 100,
      renderCell: (params) => (
        <Chip
          label={params.value}
          size="small"
          variant="outlined"
        />
      ),
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 200,
    },
    {
      field: 'phone',
      headerName: 'Phone',
      width: 150,
    },
    {
      field: 'website',
      headerName: 'Website',
      width: 200,
      renderCell: (params) => (
        params.value ? (
          <a
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: 'primary.main', textDecoration: 'none' }}
          >
            {params.value.replace(/^https?:\/\//, '')}
          </a>
        ) : null
      ),
    },
    {
      field: 'founded_year',
      headerName: 'Founded',
      width: 100,
      type: 'number',
    },
    {
      field: 'created_at',
      headerName: 'Created',
      width: 150,
      type: 'dateTime',
      valueFormatter: (params) => new Date(params.value).toLocaleDateString(),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 120,
      pinned: 'right',
      sortable: false,
      filterable: false,
      renderCell: (params) => (
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          {onView && (
            <Tooltip title="View">
              <IconButton size="small" onClick={() => onView(params.row)}>
                <Visibility fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onEdit && (
            <Tooltip title="Edit">
              <IconButton size="small" onClick={() => onEdit(params.row)}>
                <Edit fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          {onDelete && (
            <Tooltip title="Delete">
              <IconButton size="small" onClick={() => onDelete(params.row)}>
                <Delete fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <IconButton size="small">
            <MoreVert fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ], [onEdit, onDelete, onView]);

  const rows: GridRowsProp = useMemo(() =>
    companies.map(company => ({
      id: company.id,
      ...company,
    })),
    [companies]
  );

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rows}
        columns={columns}
        pageSize={pageSize}
        onPageSizeChange={setPageSize}
        rowsPerPageOptions={[10, 25, 50, 100]}
        loading={loading}
        checkboxSelection
        disableSelectionOnClick
        onSortModelChange={(model) => {
          if (model.length > 0 && onSort) {
            onSort(model[0].field, model[0].sort as 'asc' | 'desc');
          }
        }}
        onFilterModelChange={(model) => {
          if (onFilter) {
            const filters: Record<string, any> = {};
            model.items.forEach(item => {
              if (item.value) {
                filters[item.columnField] = item.value;
              }
            });
            onFilter(filters);
          }
        }}
        sx={{
          border: 0,
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: 'grey.50',
          },
          '& .MuiDataGrid-cell:focus': {
            outline: 'none',
          },
        }}
      />
    </Box>
  );
}
