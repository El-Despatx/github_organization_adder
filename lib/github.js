export const usernameRules =
  "Use 1-39 letters, numbers, or single hyphens. Usernames cannot start or end with a hyphen.";

const usernamePattern = /^[A-Za-z0-9](?:[A-Za-z0-9]|-(?=[A-Za-z0-9])){0,38}$/;

export function validateGitHubUsername(value) {
  const username = typeof value === "string" ? value.trim() : "";

  if (!username) {
    return {
      ok: false,
      status: "validation_error",
      message: "Enter a GitHub username.",
    };
  }

  if (!usernamePattern.test(username)) {
    return {
      ok: false,
      status: "validation_error",
      message: usernameRules,
    };
  }

  return { ok: true, username };
}

export function readGitHubConfig(env = process.env) {
  const org = typeof env.GITHUB_ORG === "string" ? env.GITHUB_ORG.trim() : "";
  const token = typeof env.GITHUB_TOKEN === "string" ? env.GITHUB_TOKEN.trim() : "";

  if (!org || !token) {
    return {
      ok: false,
      status: "setup_error",
      message: "The server is missing its GitHub organization settings.",
    };
  }

  return { ok: true, org, token };
}

export function normalizeGitHubResponse(statusCode, payload = {}) {
  if (statusCode >= 200 && statusCode < 300) {
    const login = payload?.user?.login || "that user";

    if (payload?.state === "active") {
      return {
        httpStatus: 200,
        status: "active",
        message: `@${login} is already a member or has been added.`,
      };
    }

    if (payload?.state === "pending") {
      return {
        httpStatus: 200,
        status: "pending",
        message: `GitHub sent an invitation to @${login}. They need to accept it from GitHub.`,
      };
    }

    return {
      httpStatus: 502,
      status: "github_error",
      message: "GitHub returned an unexpected membership response.",
    };
  }

  if (statusCode === 401 || statusCode === 403) {
    return {
      httpStatus: 502,
      status: "github_error",
      message: "GitHub refused the request. Check token permissions, organization access, or invitation limits.",
    };
  }

  if (statusCode === 404) {
    return {
      httpStatus: 404,
      status: "github_error",
      message: "GitHub could not find that organization or username.",
    };
  }

  if (statusCode === 422) {
    return {
      httpStatus: 422,
      status: "github_error",
      message: "GitHub could not create the membership request. The invite may already exist or the organization may be at its invitation limit.",
    };
  }

  return {
    httpStatus: 502,
    status: "github_error",
    message: "GitHub could not complete the membership request.",
  };
}

export function publicResult(result) {
  return {
    status: result.status,
    ...(result.title ? { title: result.title } : {}),
    message: result.message,
  };
}

export async function requestOrganizationMembership({
  org,
  token,
  username,
  fetchImpl = fetch,
}) {
  const response = await fetchImpl(
    `https://api.github.com/orgs/${encodeURIComponent(org)}/memberships/${encodeURIComponent(username)}`,
    {
      method: "PUT",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "X-GitHub-Api-Version": "2022-11-28",
      },
      body: JSON.stringify({ role: "member" }),
    },
  );

  let payload = {};
  try {
    payload = await response.json();
  } catch {
    payload = {};
  }

  return normalizeGitHubResponse(response.status, payload);
}
