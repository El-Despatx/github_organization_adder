"use client";

import { useState } from "react";

const initialResult = {
  status: "idle",
  title: "Ready when you are",
  message: "Use your exact GitHub username.",
};

const titles = {
  active: "Access ready",
  pending: "Invitation sent",
  validation_error: "Check the username",
  setup_error: "Server setup needed",
  github_error: "GitHub could not complete it",
};

function resultTitle(result) {
  return result.title || titles[result.status] || "Request status";
}

export default function Home() {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState(initialResult);
  const loading = result.status === "loading";

  async function submitInvite(event) {
    event.preventDefault();

    const nextUsername = username.trim();
    if (!nextUsername) {
      setResult({
        status: "validation_error",
        message: "Enter a GitHub username.",
      });
      return;
    }

    setResult({
      status: "loading",
      title: "Contacting GitHub",
      message: "Sending the membership request.",
    });

    try {
      const response = await fetch("/api/invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: nextUsername }),
      });
      const body = await response.json();

      setResult({
        status: body.status || "github_error",
        message: body.message || "The request finished without a readable response.",
      });
    } catch {
      setResult({
        status: "github_error",
        message: "The request could not reach the server. Try again in a moment.",
      });
    }
  }

  return (
    <main className="page-shell">
      <section className="main-copy">
        <p className="eyebrow">GitHub organization</p>
        <h1>Request your membership invite</h1>
        <p className="lede">
          Submit your GitHub username and the server will request membership in
          the configured organization.
        </p>

        <form className="invite-panel" onSubmit={submitInvite}>
          <label htmlFor="username">GitHub username</label>
          <div className="username-field">
            <span aria-hidden="true">@</span>
            <input
              id="username"
              name="username"
              type="text"
              autoComplete="username"
              placeholder="octocat"
              value={username}
              disabled={loading}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Request invite"}
          </button>

          <div className={`result result-${result.status}`} role="status" aria-live="polite">
            <strong>{resultTitle(result)}</strong>
            <span>{result.message}</span>
          </div>
        </form>
      </section>

      <aside className="visual-panel" aria-hidden="true">
        <img src="/github-org.svg" alt="" />
      </aside>
    </main>
  );
}
