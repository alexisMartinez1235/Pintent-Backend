import { SuperTest, Test } from 'supertest';

export default class Auth {
  api: SuperTest<Test>;

  constructor(api: SuperTest<Test>) {
    this.api = api;
  }

  main(): Test {
    return this.api.get('/api');
  }
  signin(email: string, password: string): Test {
    return this.api.post('/api/signin').send({
      email: email,
      password: password,
    });
  }

  signup(email: string, password: string): Test {
    return this.api.post('/api/signup').send({
      email: email,
      password: password,
    });
  }

  profile(signFunction: Test): Test {
    let profileFunction = signFunction;
    signFunction
      .then((response) => {
        const token = response.body.data.token;
        profileFunction = this.api.post('/api/profile').set('Authorization', 'Bearer ' + token);
      })
      .catch((err) => console.error(err));
    return profileFunction;
  }

  deleteUser(signFunction: Test): Test {
    let deleteFunction = signFunction;

    signFunction.then((response) => {
      const token = response.body.data.token;
      deleteFunction = this.api.delete('/api/user').set('Authorization', 'Bearer ' + token);
    });
    return deleteFunction;
  }

  logout(signFunction: Test): Test {
    let logoutFunction = signFunction;

    signFunction.then((response) => {
      const token = response.body.data.token;
      logoutFunction = this.api.post('/api/logout').set('Authorization', 'Bearer ' + token);
    });
    return logoutFunction;
  }
}
