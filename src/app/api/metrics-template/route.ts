import metricsTemplate from "../../../../data/metrics-template.json";

export function GET() {
  return Response.json(metricsTemplate, {
    headers: {
      "Cache-Control": "public, max-age=3600",
    },
  });
}
