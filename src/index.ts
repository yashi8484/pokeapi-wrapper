import fastify from "fastify";
import { Static, Type } from "@sinclair/typebox";

import QuerystringSchema from "../schemas/querystring.json";
import HeadersSchema from "../schemas/headers.json";

import { QuerystringSchema as QuerystringSchemaInterface } from "../types/querystring";
import { HeadersSchema as HeadersSchemaInterface } from "../types/headers";

import { FromSchema } from "json-schema-to-ts";

const todo = {
  type: "object",
  properties: {
    name: { type: "string" },
    description: { type: "string" },
    done: { type: "boolean" },
  },
  required: ["name"],
} as const;

const User = Type.Object({
  name: Type.String(),
  mail: Type.Optional(Type.String({ format: "email" })),
});
type UserType = Static<typeof User>;

interface IQuerystring {
  username: string;
  password: string;
}

interface IHeaders {
  "h-Custom": string;
}

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

server.route<{
  Querystring: QuerystringSchemaInterface;
  Headers: HeadersSchemaInterface;
}>({
  method: "GET",
  url: "/auth2",
  schema: {
    querystring: QuerystringSchema,
    headers: HeadersSchema,
  },
  preHandler: (request, reply, done) => {
    const { username, password } = request.query;
    const customerHeader = request.headers["h-Custom"];
    done();
  },
  handler: (request, reply) => {
    const { username, password } = request.query;
    const customerHeader = request.headers["h-Custom"];
    reply.status(200).send({ username });
  },
});

server.post<{ Body: UserType; Reply: UserType }>(
  "/",
  {
    schema: {
      body: User,
      response: {
        200: User,
      },
    },
  },
  (req, rep) => {
    const { body: user } = req;
    rep.status(200).send(user);
  }
);

server.post<{ Body: FromSchema<typeof todo> }>(
  "/todo",
  {
    schema: {
      body: todo,
      response: {
        201: {
          type: "string",
        },
      },
    },
  },
  async (request, reply): Promise<void> => {
    request.body.name;
    request.body.notthere;

    reply.status(201).send();
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
