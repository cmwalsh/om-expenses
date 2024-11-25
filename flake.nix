{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
  inputs.flake-utils.url = "github:numtide/flake-utils";

  outputs =
    { self, nixpkgs, flake-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:

    let
      pkgs = import nixpkgs { inherit system; };
    in
    {
      devShell = pkgs.mkShell {
        buildInputs = with pkgs; [
          nodejs_22
          pnpm
          nixpkgs-fmt
        ];
      };

      packages.default = pkgs.stdenv.mkDerivation {
        pname = "om-expenses";
        version = "0.0.0";

        src = ./.;

        nativeBuildInputs = with pkgs;
          [
            nodejs_22
            pnpm
            pnpm.configHook
          ];

        installPhase = ''
          mkdir -p $out/bin
          mkdir -p $out/common
          mkdir -p $out/backend
          mkdir -p $out/frontend

          pnpm run --filter common      build
          pnpm run --filter backend     build
          pnpm run --filter frontend    build

          cp -r node_modules            $out/

          cp -r common/dist             $out/common/
          cp -r common/node_modules     $out/common/
          cp -r common/package.json     $out/common/

          cp -r backend/dist            $out/backend/
          cp -r backend/node_modules    $out/backend/
          cp -r backend/package.json    $out/backend/

          cp -r frontend/.output        $out/frontend/
          cp -r frontend/node_modules   $out/frontend/
          cp -r frontend/package.json   $out/frontend/

          echo '#!${pkgs.bash}/bin/bash' > $out/bin/om-expenses-backend
          echo '${pkgs.nodejs_22}/bin/node ${placeholder "out"}/backend/dist/index.js "$@"' >> $out/bin/om-expenses-backend
          chmod +x $out/bin/om-expenses-backend

          echo '#!${pkgs.bash}/bin/bash' > $out/bin/om-expenses-frontend
          echo 'PORT=$OM_FRONTEND_PORT ${pkgs.nodejs_22}/bin/node ${placeholder "out"}/frontend/.output/server/index.mjs "$@"' >> $out/bin/om-expenses-frontend
          chmod +x $out/bin/om-expenses-frontend
        '';

        pnpmWorkspaces = [ "common" "backend" "frontend" ];

        pnpmDeps = pkgs.pnpm.fetchDeps {
          inherit (self.packages.${system}.default) pname version src pnpmWorkspaces;
          hash = "sha256-4gVyYSNrTibLQn/OKCx0+dGxeLn2sIqKiUwAMJkaEag=";
        };
      };
    });
}
