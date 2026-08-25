const mutationResolvers = {
  Mutation: {
    mock_mutation: async (_, { name }, context) => `Hello ${name}!`,
    login: async (_, { username, password }, { dataSources }) => {
      return dataSources.userAPI.login({ username, password });
    },
    createTask: async (_, { description }, { dataSources }) => {
      return dataSources.taskAPI.createTask({ body: { description } });
    },
    updateTask: async (_, { id, description }, { dataSources }) => {
      return dataSources.taskAPI.updateTask(id, { description });
    },
    deleteTask: async (_, { id }, { dataSources }) => {
      return dataSources.taskAPI.deleteTask(id);
    },
    deleteAllTasks: async (_, __, { dataSources }) => {
      try {
        const response = await dataSources.taskAPI.deleteAllTasks();
        const parsedResponse = typeof response === "string" ? JSON.parse(response) : response;
        return parsedResponse.message;
      } catch (error) {
        console.error("Failed to delete all tasks:", error);
        throw new Error(
          "An error occurred while trying to wipe the tasks. Please try again.",
        );
      }
    },
  },
};

module.exports = mutationResolvers;
