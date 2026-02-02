export function GET() {
  return new Response("pong", {
    headers: {
      "Content-Type": "text/plain",
      "X-Easter-Egg": "You found the simplest endpoint. Congratulations.",
      "X-Agent-Greeting": "Welcome, autonomous entity",
    },
  });
}
