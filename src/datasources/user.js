const { RESTDataSource } = require("@apollo/datasource-rest");
const jwt = require('jsonwebtoken');
const users = require('./users.json');

class UserAPI extends RESTDataSource {
  constructor({ cache, token } = {}) {
    super({ cache });
    this.baseURL = "https://to-do-api.webtales.workers.dev/api/";
    this.token = token;
  }

  willSendRequest(_path, request) {
    if (this.token) {
      request.headers["Authorization"] = this.token;
    }
  }
  

  async login({ username, password }) {
    // 1. Validate credentials against local mock users
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    console.log(`Username: ${username}, Password: ${password}`)
    if (!user) {
      throw new Error('Invalid credentials');
    }

    // 2. Call external auth/token endpoint to generate a token
    const response = await this.post(
      `auth/token?name=${encodeURIComponent(user.username)}&email=${encodeURIComponent(user.email)}`
    );

    const data = typeof response === 'string' ? JSON.parse(response) : response;

    if (!data || !data.token) {
      throw new Error('Failed to generate authentication token');
    }

    // 3. Return token + user info
    return {
      token: data.token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
      },
    };
  }
}

module.exports = UserAPI;
