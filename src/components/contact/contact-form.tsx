"use client";

import { Send } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";

type Status = "idle" | "sending" | "sent" | "error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));

    const response = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      setStatus("sent");
      form.reset();
      return;
    }

    setStatus("error");
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
        disabled={status === "sending"}
      >
        <Send className="h-4 w-4" />
        {status === "sending" ? "Sending..." : "Send message"}
      </Button>
      {status === "sent" && (
        <p className="mt-4 text-sm text-emerald-500">
          Message received. I will reply by email.
        </p>
      )}
      {status === "error" && (
        <p className="mt-4 text-sm text-red-500">
          The form could not submit. Email works directly from this page.
        </p>
      )}
    </form>
  );
}
