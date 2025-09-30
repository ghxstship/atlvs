import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'

describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Setup test database
  })

  afterAll(async () => {
    // Cleanup test database
  })

  describe('Health Check', () => {
    it('should return 200 OK', async () => {
      const response = await fetch('http://localhost:3000/api/health')
      expect(response.status).toBe(200)
      
      const data = await response.json()
      expect(data).toHaveProperty('status', 'ok')
    })
  })

  describe('Authentication', () => {
    it('should reject unauthenticated requests', async () => {
      const response = await fetch('http://localhost:3000/api/protected')
      expect(response.status).toBe(401)
    })

    it('should accept valid authentication', async () => {
      const response = await fetch('http://localhost:3000/api/protected', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })
      expect(response.status).toBe(200)
    })
  })

  describe('CRUD Operations', () => {
    it('should create a resource', async () => {
      const response = await fetch('http://localhost:3000/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          name: 'Test Resource',
          description: 'Test Description'
        })
      })
      
      expect(response.status).toBe(201)
      const data = await response.json()
      expect(data).toHaveProperty('id')
      expect(data.name).toBe('Test Resource')
    })

    it('should read a resource', async () => {
      const response = await fetch('http://localhost:3000/api/resources/1', {
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data).toHaveProperty('id', 1)
    })

    it('should update a resource', async () => {
      const response = await fetch('http://localhost:3000/api/resources/1', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          name: 'Updated Resource'
        })
      })
      
      expect(response.status).toBe(200)
      const data = await response.json()
      expect(data.name).toBe('Updated Resource')
    })

    it('should delete a resource', async () => {
      const response = await fetch('http://localhost:3000/api/resources/1', {
        method: 'DELETE',
        headers: {
          'Authorization': 'Bearer valid-token'
        }
      })
      
      expect(response.status).toBe(204)
    })
  })

  describe('Error Handling', () => {
    it('should handle 404 errors', async () => {
      const response = await fetch('http://localhost:3000/api/nonexistent')
      expect(response.status).toBe(404)
    })

    it('should handle validation errors', async () => {
      const response = await fetch('http://localhost:3000/api/resources', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer valid-token'
        },
        body: JSON.stringify({
          // Missing required fields
        })
      })
      
      expect(response.status).toBe(400)
      const data = await response.json()
      expect(data).toHaveProperty('errors')
    })
  })
})
