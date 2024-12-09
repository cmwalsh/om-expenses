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
          git
          deno
          gnused
          sass
          nixpkgs-fmt
        ];
      };

      packages.default =

        let
          hashes = {
            aarch64-darwin = "sha256-CZdRMTO38wKv8CBJo1UjCcrVxymSDnITG5wG50Gaib0=";
            x86_64-linux = "sha256-4iJ+G1q0a8XrF2GFkyS/tA5I2q4uUMkwBkVmS2CgLEM=";
          };
        in
        pkgs.stdenv.mkDerivation {
          pname = "om-expenses";
          version = "0.0.8";

          src = ./.;

          nativeBuildInputs = with pkgs; [ deno ];

          dontFixup = true;
          dontPatchShebangs = true;

          outputHashAlgo = "sha256";
          outputHashMode = "recursive";
          outputHash = hashes.${system};

          installPhase = ''
            export HOME="$(mktemp -d)"

            ${pkgs.deno}/bin/deno cache backend/src/index.ts
            ${pkgs.deno}/bin/deno cache frontend/bundle.ts
            ${pkgs.deno}/bin/deno cache frontend/server.ts

            ${pkgs.deno}/bin/deno task build

            mkdir -p $out/bin
            mkdir -p $out/backend
            mkdir -p $out/frontend

            echo "Compiling backend..."
            ${pkgs.deno}/bin/deno compile --cached-only -o $out/bin/om-expenses-backend   backend/src/index.ts
            echo "Compiling frontend..."
            ${pkgs.deno}/bin/deno compile --cached-only -o $out/bin/om-expenses-frontend  frontend/server.ts
          '';
        };
    });
}
