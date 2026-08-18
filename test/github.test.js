import assert from "node:assert/strict";
import test from "node:test";

import {
  normalizeGitHubResponse,
  publicResult,
  readGitHubConfig,
  validateGitHubUsername,
} from "../lib/github.js";

test("validateGitHubUsername trims and accepts valid usernames", () => {
  assert.deepEqual(validateGitHubUsername(" octocat-1 "), {
    ok: true,
    username: "octocat-1",
  });
});

test("validateGitHubUsername rejects invalid usernames", () => {
  for (const username of ["", "-octocat", "octocat-", "octo--cat", "octo_cat", "a".repeat(40)]) {
    assert.equal(validateGitHubUsername(username).status, "validation_error");
  }
});

test("readGitHubConfig reports missing server config", () => {
  assert.deepEqual(readGitHubConfig({}), {
    ok: false,
    status: "setup_error",
    message: "The server is missing its GitHub organization settings.",
  });
});

test("normalizeGitHubResponse maps active and pending memberships", () => {
  assert.deepEqual(normalizeGitHubResponse(200, { state: "active", user: { login: "octocat" } }), {
    httpStatus: 200,
    status: "active",
    message: "@octocat is already a member or has been added.",
  });

  assert.deepEqual(normalizeGitHubResponse(200, { state: "pending", user: { login: "mona" } }), {
    httpStatus: 200,
    status: "pending",
    message: "GitHub sent an invitation to @mona. They need to accept it from GitHub.",
  });
});

test("normalizeGitHubResponse maps GitHub failures to safe public states", () => {
  assert.equal(normalizeGitHubResponse(403, { message: "token details" }).status, "github_error");
  assert.equal(normalizeGitHubResponse(422, { message: "spam" }).status, "github_error");
});

test("publicResult removes route-only status metadata", () => {
  assert.deepEqual(
    publicResult({ ok: false, httpStatus: 502, status: "github_error", message: "safe" }),
    {
      status: "github_error",
      message: "safe",
    },
  );
});
