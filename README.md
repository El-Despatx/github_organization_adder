# GitHub Organization Adder

A small Next.js app that lets someone submit a GitHub username and request membership in a configured GitHub organization.

## Development Shell

This repo includes a Nix devshell:

```sh
nix develop path:.
```

The shell provides Node.js 22 and npm. If you use direnv, run:

```sh
direnv allow
```

## Configuration

Create `.env.local` from the example:

```sh
cp .env.example .env.local
```

Set:

- `GITHUB_ORG`: the organization login to invite users into.
- `GITHUB_TOKEN`: a GitHub token used only by the server.

The token must be allowed to add organization members. For a fine-grained personal access token, scope it to the target organization with Members read/write permission. The authenticated account or app also needs the organization rights GitHub requires for membership changes.

## Commands

```sh
npm install
npm run dev
npm test
npm run build
```

Open http://localhost:3000 after starting the dev server.
