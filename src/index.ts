import { Hono } from "hono";
import { sign, jwt } from "hono/jwt";
import { cors } from "hono/cors";
import usersDatabase from "./users.json";

type Bindings = {
  SECRET_KEY: string;
};

const app = new Hono<{ Bindings: Bindings }>();

app.use("/*", cors({
  origin: "http://localhost:5173",
  allowHeaders: ["Content-Type", "Authorization"],
  allowMethods: ["POST", "GET", "OPTIONS"],
  exposeHeaders: ["Content-Length"],
  maxAge: 600,
  credentials: true,
}));

// API routes
/** app.post("/login", async (c) => {
  const body = await c.req.json();
  const user = usersDatabase.find(u => u.username === body.username && u.password === body.password);

  if (!user) return c.json({ error: "Invalid credentials" }, 401);

  const payload = { username: user.username, exp: Math.floor(Date.now() / 1000) + 7200 };
  const token = await sign(payload, c.env.SECRET_KEY);

  return c.json({ token });
});*/

export default app;