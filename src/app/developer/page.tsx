"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import developerData from "@/data/developer.json";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  created: string;
  lastUsed: string;
  usage: {
    today: number;
    thisMonth: number;
    rateLimit: {
      limit: number;
      remaining: number;
      resetAt: string;
    };
  };
}

interface SDK {
  name: string;
  icon: string;
  description: string;
  installCommand: string;
  version: string;
  docsUrl: string;
  exampleCode: string;
}

interface QuickLink {
  title: string;
  url: string;
  icon: string;
  description: string;
}

interface WebhookEvent {
  name: string;
  description: string;
}

interface DeveloperData {
  hero: {
    title: string;
    description: string;
    quickLinks: QuickLink[];
  };
  apiKeys: ApiKey[];
  sdks: SDK[];
  webhooks: {
    description: string;
    events: WebhookEvent[];
    configured: {
      url: string;
      secret: string;
      subscribedEvents: string[];
    };
  };
  quickStart: {
    [key: string]: {
      title: string;
      code: string;
    };
  };
}

const data = developerData as DeveloperData;

export default function DeveloperPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [showNewKeyForm, setShowNewKeyForm] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(data.webhooks.configured.url);
  const [selectedEvents, setSelectedEvents] = useState<string[]>(
    data.webhooks.configured.subscribedEvents
  );

  const maskApiKey = (key: string) => {
    const prefix = key.substring(0, 12);
    const suffix = key.substring(key.length - 4);
    return `${prefix}${"•".repeat(20)}${suffix}`;
  };

  const copyToClipboard = async (text: string, type: "key" | "code", id: string) => {
    await navigator.clipboard.writeText(text);
    if (type === "key") {
      setCopiedKey(id);
      setTimeout(() => setCopiedKey(null), 2000);
    } else {
      setCopiedCode(id);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleEvent = (eventName: string) => {
    setSelectedEvents((prev) =>
      prev.includes(eventName)
        ? prev.filter((e) => e !== eventName)
        : [...prev, eventName]
    );
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">{data.hero.title}</h1>
        <p className="text-xl text-muted-foreground mb-8">
          {data.hero.description}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.hero.quickLinks.map((link) => (
            <Card key={link.title} className="hover:border-primary transition-colors cursor-pointer">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <span className="text-2xl">{link.icon}</span>
                  {link.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{link.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator className="my-12" />

      {/* API Keys Section */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">API Keys</h2>
            <p className="text-muted-foreground">
              Manage your API keys and monitor usage
            </p>
          </div>
          <Button onClick={() => setShowNewKeyForm(!showNewKeyForm)}>
            {showNewKeyForm ? "Cancel" : "Create New Key"}
          </Button>
        </div>

        {showNewKeyForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Create New API Key</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="keyName">Key Name</Label>
                  <Input
                    id="keyName"
                    placeholder="e.g., Production API Key"
                    className="mt-2"
                  />
                </div>
                <div className="flex gap-2">
                  <Button>Create Key</Button>
                  <Button variant="outline" onClick={() => setShowNewKeyForm(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {data.apiKeys.map((apiKey) => (
            <Card key={apiKey.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{apiKey.name}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      Created {formatDate(apiKey.created)} • Last used{" "}
                      {formatDateTime(apiKey.lastUsed)}
                    </p>
                  </div>
                  <Button variant="destructive" size="sm">
                    Revoke
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">API KEY</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                        {maskApiKey(apiKey.key)}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(apiKey.key, "key", apiKey.id)}
                      >
                        {copiedKey === apiKey.id ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        REQUESTS TODAY
                      </Label>
                      <p className="text-2xl font-bold mt-1">
                        {apiKey.usage.today.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        REQUESTS THIS MONTH
                      </Label>
                      <p className="text-2xl font-bold mt-1">
                        {apiKey.usage.thisMonth.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">
                        RATE LIMIT STATUS
                      </Label>
                      <p className="text-2xl font-bold mt-1">
                        {apiKey.usage.rateLimit.remaining.toLocaleString()} /{" "}
                        {apiKey.usage.rateLimit.limit.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Resets {formatDateTime(apiKey.usage.rateLimit.resetAt)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* SDK Downloads Section */}
      <section className="mb-12" id="sdks">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">SDKs & Libraries</h2>
          <p className="text-muted-foreground">
            Official client libraries for your favorite languages
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {data.sdks.map((sdk) => (
            <Card key={sdk.name}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <span className="text-3xl">{sdk.icon}</span>
                    {sdk.name}
                  </CardTitle>
                  <Badge variant="outline">v{sdk.version}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{sdk.description}</p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-muted-foreground">INSTALL</Label>
                    <div className="flex items-center gap-2 mt-2">
                      <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                        {sdk.installCommand}
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          copyToClipboard(sdk.installCommand, "code", `install-${sdk.name}`)
                        }
                      >
                        {copiedCode === `install-${sdk.name}` ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground mb-2 block">
                      EXAMPLE
                    </Label>
                    <div className="relative">
                      <pre className="bg-muted p-3 rounded text-xs font-mono overflow-x-auto">
                        {sdk.exampleCode}
                      </pre>
                      <Button
                        size="sm"
                        variant="outline"
                        className="absolute top-2 right-2"
                        onClick={() =>
                          copyToClipboard(sdk.exampleCode, "code", `example-${sdk.name}`)
                        }
                      >
                        {copiedCode === `example-${sdk.name}` ? "Copied!" : "Copy"}
                      </Button>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <a href={sdk.docsUrl} target="_blank" rel="noopener noreferrer">
                      View Documentation →
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator className="my-12" />

      {/* Webhooks Section */}
      <section className="mb-12" id="webhooks">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Webhooks</h2>
          <p className="text-muted-foreground">{data.webhooks.description}</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Webhook Configuration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <Label htmlFor="webhookUrl">Endpoint URL</Label>
                <Input
                  id="webhookUrl"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                  placeholder="https://api.example.com/webhooks/foragents"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="webhookSecret">Signing Secret</Label>
                <div className="flex items-center gap-2 mt-2">
                  <code className="flex-1 bg-muted px-3 py-2 rounded text-sm font-mono">
                    {maskApiKey(data.webhooks.configured.secret)}
                  </code>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() =>
                      copyToClipboard(data.webhooks.configured.secret, "key", "webhook-secret")
                    }
                  >
                    {copiedKey === "webhook-secret" ? "Copied!" : "Copy"}
                  </Button>
                  <Button size="sm" variant="outline">
                    Regenerate
                  </Button>
                </div>
              </div>

              <div>
                <Label className="mb-3 block">Events to Subscribe</Label>
                <div className="space-y-3">
                  {data.webhooks.events.map((event) => (
                    <div key={event.name} className="flex items-start gap-3">
                      <Checkbox
                        id={event.name}
                        checked={selectedEvents.includes(event.name)}
                        onCheckedChange={() => toggleEvent(event.name)}
                      />
                      <div className="flex-1">
                        <label
                          htmlFor={event.name}
                          className="text-sm font-medium cursor-pointer"
                        >
                          {event.name}
                        </label>
                        <p className="text-xs text-muted-foreground">
                          {event.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2">
                <Button>Save Configuration</Button>
                <Button variant="outline">Test Webhook</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator className="my-12" />

      {/* Quick Start Section */}
      <section className="mb-12">
        <div className="mb-6">
          <h2 className="text-3xl font-bold mb-2">Quick Start</h2>
          <p className="text-muted-foreground">
            Get started with these code snippets
          </p>
        </div>

        <div className="space-y-4">
          {Object.entries(data.quickStart).map(([key, snippet]) => (
            <Card key={key}>
              <CardHeader>
                <CardTitle className="text-lg">{snippet.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-muted p-4 rounded text-sm font-mono overflow-x-auto">
                    {snippet.code}
                  </pre>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute top-2 right-2"
                    onClick={() =>
                      copyToClipboard(snippet.code, "code", `quickstart-${key}`)
                    }
                  >
                    {copiedCode === `quickstart-${key}` ? "Copied!" : "Copy"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
