"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { site } from "@/data/site";

type Status = "idle" | "opened";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const subject = encodeURIComponent(
      `Portfolio contact from ${String(data.name ?? "Visitor")}`
    );
    const body = encodeURIComponent(
      [
        `Name: ${String(data.name ?? "")}`,
        `Email: ${String(data.email ?? "")}`,
        `Company: ${String(data.company ?? "")}`,
        "",
        String(data.message ?? ""),
      ].join("\n")
    );

    window.location.href = `mailto:${site.email}?subject=${subject}&body=${body}`;
    setStatus("opened");
    form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="rounded-lg border border-card-border bg-card p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="grid gap-2 text-sm font-medium">
          Name
          <Input name="name" autoComplete="name" required placeholder="Your name" />
        </label>
        <label className="grid gap-2 text-sm font-medium">
          Email
          <Input
            name="email"
            type="email"
            autoComplete="email"
            required
            placeholder="you@company.com"
          />
        </label>
      </div>
      <label className="mt-4 grid gap-2 text-sm font-medium">
        Company
        <Input name="company" autoComplete="organization" placeholder="Company or team" />
      </label>
      <label className="mt-4 grid gap-2 text-sm font-medium">
        Message
        <Textarea
          name="message"
          required
          rows={7}
          placeholder="Tell me what you are building or hiring for."
        />
      </label>
      <Button
        type="submit"
        variant="gradient"
        className="mt-5"
      >
        <Send className="h-4 w-4" />
        Send message
      </Button>
      {status === "opened" && (
        <p className="mt-4 text-sm text-emerald-500">
          Your email client has been opened with the message details.
        </p>
      )}
    </form>
  );
}
