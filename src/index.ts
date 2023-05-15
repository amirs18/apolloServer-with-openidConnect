// npm install @apollo/server express graphql cors body-parser
import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express from 'express';
import http from 'http';
import cors from 'cors';
import bodyParser from 'body-parser';
import { typeDefs } from './schema';
import {auth} from 'express-openid-connect'


interface MyContext {
  token?: String;
}

// Required logic for integrating with Express
const app = express();
// Our httpServer handles incoming requests to our Express app.
// Below, we tell Apollo Server to "drain" this httpServer,
// enabling our servers to shut down gracefully.
const httpServer = http.createServer(app);

// Same ApolloServer initialization as before, plus the drain plugin
// for our httpServer.
const server = new ApolloServer<MyContext>({
  typeDefs,
  plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});
// Ensure we wait for our server to start
await server.start();

// Set up our Express middleware to handle CORS, body parsing,
// and our expressMiddleware function.
app.use(auth({
  issuerBaseURL: 'https://dev-nptz4bprn2bncygi.us.auth0.com',
    baseURL: 'https://4000-amirs18-apolloserverwit-ar5ztutcpf4.ws-us97.gitpod.io',
    clientID: 'TZNy8ZXVocuI28HPu3sIhB6CpRRF0yBf',
    secret: 'elVw82HSLVJOuaYDpixJfyYbdtY2r2CSL77K0Ss9jBjqDd1jImwgJVKY8ZgwZVYu',
    idpLogout: true,
}))
app.use(
  '/graphql',
  cors<cors.CorsRequest>(),
  // 50mb is the limit that `startStandaloneServer` uses, but you may configure this to suit your needs
  bodyParser.json({ limit: '50mb' }),
  // expressMiddleware accepts the same arguments:
  // an Apollo Server instance and optional configuration options
  expressMiddleware(server, {
    context: async ({ req, res }) => {
      // Get the user token from the headers.
      const token = req.oidc.idToken as unknown as string || 'blah';
  
      // Try to retrieve a user with the token
      const user = await getUser(token);
  
      // Add the user to the context
      return { user };
    },  }),
);

// Modified server startup
await new Promise<void>((resolve) => httpServer.listen({ port: 4000 }, resolve));
console.log(`🚀 Server ready at http://localhost:4000/`);

function getUser(token: string) {
// console.log(token);
}
