import supertest from 'supertest';
import Auth from './auth.controller';

const api = supertest('http://localhost:8000');
const auth = new Auth(api);

describe('GET /api', () => {
  it('expected response json', () => {
    return auth
      .main()
      .expect('Content-Type', /application\/json/)
      .expect(200);
    // console.log(response);
  });
});

describe('POST /api/signup', () => {
  it('try to signup with random account', () => {
    auth
      .signup('example@gmail.com', 'examplepassword')
      .expect('Content-Type', /application\/json/)
      .expect(200);
  });
  it('try to recreate the account', () => {
    auth
      .signup('example@gmail.com', 'examplepassword')
      .expect('Content-Type', /application\/json/)
      .expect(400);
  });
});

describe('POST /api/signin', () => {
  it('try to sign in in unknown account', () => {
    auth
      .profile(
        auth
          .signin('example_unknown@gmail.com', 'examplepassword')
          .expect('Content-Type', /application\/json/)
          .expect(200)
      )
      .expect('Content-Type', /application\/json/)
      .expect(200);
  });
  it('try to sign in in real account', () => {
    auth
      .profile(
        auth
          .signin('example_unknown@gmail.com', 'examplepassword')
          .expect('Content-Type', /application\/json/)
          .expect(200)
      )
      .expect('Content-Type', /application\/json/)
      .expect(200);

    // console.log(response);
  });
});

describe('POST /api/logout', () => {
  it('try to log out in unknown account', () => {
    auth
      .logout(
        auth
          .signin('example_unknown@gmail.com', 'examplepassword')
          .expect('Content-Type', /application\/json/)
          .expect(400)
      )
      .expect('Content-Type', /application\/json/)
      .expect(400);
  });
  it('try to logout in real account', () => {
    auth
      .logout(
        auth
          .signin('example_unknown@gmail.com', 'examplepassword')
          .expect('Content-Type', /application\/json/)
          .expect(200)
      )
      .expect('Content-Type', /application\/json/)
      .expect(200);
  });
});

describe('DELETE /api/user', () => {
  it('delete first user', () => {
    auth
      .deleteUser(
        auth
          .signin('example@gmail.com', 'examplepassword')
          .expect(200)
          .expect('Content-Type', /application\/json/)
      )
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
  it('delete second user', () => {
    auth
      .deleteUser(
        auth
          .signin('example_unknown@gmail.com', 'examplepassword')
          .expect(200)
          .expect('Content-Type', /application\/json/)
      )
      .expect(200)
      .expect('Content-Type', /application\/json/);
  });
});
