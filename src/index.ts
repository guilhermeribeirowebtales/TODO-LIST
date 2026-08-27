import { Hono } from "hono";
import { cors } from "hono/cors";

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

export default app;