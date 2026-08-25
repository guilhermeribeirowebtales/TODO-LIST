const queryResolvers = {
  Query: {
    async mock_query(parent, args, context, info) {
      return "Hello from the resolver!";
    },
    getTask: async (_, { id }, { dataSources }) => {
      return dataSources.taskAPI.getTask(id);
    },
    getTasks: async (_, __, { dataSources }) => {
      const response = await dataSources.taskAPI.getTasks();
      return typeof response === "string" ? JSON.parse(response) : response;
    },
  }
};

module.exports = queryResolvers;
