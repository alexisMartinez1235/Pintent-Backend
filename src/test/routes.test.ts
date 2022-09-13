import supertest from 'supertest';

const api = supertest('http://localhost:8000');
/*
  Routes
    GET /
    ...
*/
describe('GET /', () => {
  it('expected response html', () => {
    return api.get('/').expect('Content-Type', /html/).expect(200);
    // console.log(response);
  });
});
