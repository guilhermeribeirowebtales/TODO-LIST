const  { ApolloServer } = require('@apollo/server');
const { startStandaloneServer } = require('@apollo/server/standalone');

const GraphQLHelper = require("./helpers/graphql");
const taskAPI = require('./datasources/task');
const UserAPI = require('./datasources/user');
const { authenticateToken } = require('./middleware/Authentication');

const { schema } = GraphQLHelper;

// The ApolloServer constructor requires two parameters: your schema
// definition and your set of resolvers.
const server = new ApolloServer({ schema });

// Passing an ApolloServer instance to the `startStandaloneServer` function:
//  1. creates an Express app
//  2. installs your ApolloServer instance as middleware
//  3. prepares your app to handle incoming requests
startStandaloneServer(server, {
    context: async ({ req }) => {
        const token = req.headers.authorization || "";
        const { cache } = server;

        // Verify JWT and attach user info to context
        const user = authenticateToken(token);

        return {
            token,
            user, // null if not authenticated, { userId } if valid
            dataSources: {
                taskAPI: new taskAPI({ cache, token }),
                userAPI: new UserAPI({ cache, token }),
            },
        };
    },
    listen: { port: 8080 },
}).then(r => {
    console.log(`🚀  Server ready at: ${r.url}`);
});
