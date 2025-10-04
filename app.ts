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

export { app };
