import fastify from "fastify";

import QuerystringSchema from "../schemas/querystring.json";
import HeadersSchema from "../schemas/headers.json";

import { QuerystringSchema as QuerystringSchemaInterface } from "../types/querystring";
import { HeadersSchema as HeadersSchemaInterface } from "../types/headers";

const server = fastify();

server.get("/ping", async (request, reply) => {
  return "pong\n";
});

server.get<{
  Querystring: QuerystringSchemaInterface;
  Headers: HeadersSchemaInterface;
}>(
  "/auth",
  {
    schema: {
      querystring: QuerystringSchema,
      headers: HeadersSchema,
    },
    preValidation: (request, reply, done) => {
      const { username, password } = request.query;
      done(username !== "admin" ? new Error("Must be admin") : undefined); // only validate 'admin' account
    },
  },
  async (request, reply) => {
    const customerHeader = request.headers["h-Custom"];

    // do something with request data

    return `logged in!\n`;
  }
);

if (process.env.NODE_ENV === "production") {
  server.listen(8080, (err, address) => {
    if (err) {
      console.error(err);
      process.exit(1);
    }
    console.log(`Server listening at ${address}`);
  });
} else {
  console.log("Server start in development mode.");
}

export const app = server;
