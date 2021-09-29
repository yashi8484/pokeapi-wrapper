import fastify from "fastify";
import { Static, Type } from "@sinclair/typebox";

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
  Querystring: IQuerystring;
  Headers: IHeaders;
}>(
  "/auth",
  {
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

server.listen(8080, (err, address) => {
  if (err) {
    console.error(err);
    process.exit(1);
  }
  console.log(`Server listening at ${address}`);
});
