import {
  publicResult,
  readGitHubConfig,
  requestOrganizationMembership,
  validateGitHubUsername,
} from "../../../lib/github.js";

export const runtime = "nodejs";

export async function POST(request) {
  let body = {};
  try {
    body = await request.json();
  } catch {
    body = {};
  }

  const validation = validateGitHubUsername(body?.username);
  if (!validation.ok) {
    return Response.json(publicResult({ httpStatus: 400, ...validation }), {
      status: 400,
    });
  }

  const config = readGitHubConfig();
  if (!config.ok) {
    return Response.json(publicResult({ httpStatus: 500, ...config }), {
      status: 500,
    });
  }

  try {
    const result = await requestOrganizationMembership({
      org: config.org,
      token: config.token,
      username: validation.username,
    });

    return Response.json(publicResult(result), { status: result.httpStatus });
  } catch (error) {
    console.error("GitHub membership request failed", error);
    return Response.json(
      {
        status: "github_error",
        message: "GitHub could not complete the membership request.",
      },
      { status: 502 },
    );
  }
}
