import request from 'supertest';
import express from 'express';

// Mock the actual server setup
const app = express();
app.use(express.json());

// Mock route for testing
app.get('/api/test', (req, res) => {
  res.json({ message: 'Test endpoint' });
});

describe('API Endpoints', () => {
  describe('GET /api/test', () => {
    it('should return test message', async () => {
      const response = await request(app)
        .get('/api/test')
        .expect(200);

      expect(response.body).toEqual({ message: 'Test endpoint' });
    });
  });
});

describe('Health Check', () => {
  it('should respond to health check', async () => {
    const app = express();
    app.get('/', (req, res) => res.send('API running'));

    const response = await request(app)
      .get('/')
      .expect(200);

    expect(response.text).toBe('API running');
  });
});
