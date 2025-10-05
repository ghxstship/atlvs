// Mock Next.js app for testing
import express from 'express';

const app = express();

app.use(express.json());

// Mock API routes for testing
app.get('/api/v1/dashboard', (_req, res) => {
  res.json({
    data: [],
    pagination: { page: 1, limit: 20, total: 0, pages: 1 },
  });
});

app.post('/api/v1/dashboard', (_req, res) => {
  res.status(201).json({
    data: {
      id: 'test-id',
      created_by: 'test-user',
      organization_id: 'test-org',
    },
  });
});

app.put('/api/v1/dashboard/:id', (_req, res) => {
  res.json({
    data: {
      id: 'test-id',
    },
  });
});

app.delete('/api/v1/dashboard/:id', (_req, res) => {
  res.status(200).json({ message: 'Dashboard deleted successfully' });
});

// Projects API routes
app.get('/api/v1/projects', (_req, res) => {
  res.json({
    data: [],
    pagination: { page: 1, pageSize: 10, total: 0, totalPages: 1 },
  });
});

app.post('/api/v1/projects', (_req, res) => {
  res.status(201).json({
    id: 'test-project-id',
    name: 'Test Project',
    organization_id: 'test-org',
    owner_id: 'test-user',
  });
});

app.get('/api/v1/projects/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    id,
    name: 'Test Project',
    organization_id: 'test-org',
  });
});

app.put('/api/v1/projects/:id', (req, res) => {
  const { id } = req.params;
  res.json({
    id,
    name: 'Updated Test Project',
  });
});

app.delete('/api/v1/projects/:id', (_req, res) => {
  res.status(204).send();
});

export { app };
