# om-expenses

An expenses app

## Development

Run both `backend` and `frontend` with:

    pnpm i
    pnpm dev

Apply a schema change to Postgres:

    pnpm --filter backend push

Installing a new package:

    pnpm add --filter frontend PACKAGE_NAME_HERE

OR:

    pnpm add --filter backend PACKAGE_NAME_HERE

## Deployment

Test deployment with:

    nix shell

This will automatically build the flake (i.e. `nix build`) and enter a shell where the binaries are available.

The binaries `om-expenses-backend` and `om-expenses-frontend` are now in the $PATH. Run the binaries prefixed with the needed environment variables:

    OM_BACKEND_PORT=3010 OM_DATABASE_URL=... OM_SECRET_KEY=... om-expenses-backend
    OM_FRONTEND_PORT=3011 om-expenses-frontend
