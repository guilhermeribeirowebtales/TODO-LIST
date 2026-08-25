const { RESTDataSource } = require("@apollo/datasource-rest");

class TaskAPI extends RESTDataSource {
  constructor({ cache, token } = {}) {
    super({ cache });
    this.baseURL = "https://to-do-api.webtales.workers.dev/api/";
    this.token = token;
  }

  // Intercept the request to add the Authorization header
  willSendRequest(_path, request) {
    if (this.token) {
      request.headers["Authorization"] = this.token;
    }
  }

  // Garantir que a resposta é parsed como JSON
  async parseBody(response) {
    const body = await response.text();
    try {
      return JSON.parse(body);
    } catch {
      return body;
    }
  }

  async getTask(id) {
    if (!id) return;

    return this.get(`task/${id}`);
  }

  async getTasks() {
    return this.get(`tasks`);
  }

  async createTask(task_payload) {
    return this.post(`task`, task_payload);
  }

  async updateTask(id, task_payload) {
    if (typeof id !== "string" && typeof id !== "number") {
      throw new Error("Invalid task ID provided.");
    }

    if (!task_payload || Object.keys(task_payload).length === 0) {
      throw new Error("Task payload cannot be empty.");
    }

    console.log("Payload sending to REST:", task_payload);

    return this.put(
      `task/${id}`, // path
      { body: { task_payload } }, // request body
    )
      .then((res) => {
        console.log("OK 200: ", res);
      })
      .catch((err) => {
        console.error(`Failed to update task ${id}:`, error.message);
        throw new Error("Unable to update the task at this time.");
      });
  }

  async deleteTask(id) {
    // 1. Strict ID validation
    if (typeof id !== "string" && typeof id !== "number") {
      throw new Error("Invalid task ID provided.");
    }

    return this.delete(`task/${id}`)
      .then((res) => {
        console.log("200 OK:", res.message);
        return res.message;
      })
      .catch((error) => {
        console.error(`Failed to delete task ${id}:`, error.message);
        throw new Error("Unable to update the task at this time.");
      });
  }

  async deleteAllTasks() {
    try {
      return this.delete(`all/tasks`);
    } catch (error) {
      console.error(`Failed to delete task ${id}:`, error.message);
      throw new Error("Unable to update the task at this time.");
    }
  }
}

module.exports = TaskAPI;
