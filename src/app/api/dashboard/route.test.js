import { GET } from './route';

describe('Dashboard API', () => {
  it('should return occasion metrics without errors', async () => {
    const request = {
      url: 'http://localhost:3000/api/dashboard',
    };
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.metrics.occasions).toBeDefined();
  });
});
