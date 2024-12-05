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
          nixpkgs-fmt
        ];
      };

      packages.default =

        let
          hashes = {
            aarch64-darwin = "sha256-LApx/dlveFg7zi5co1knQOQIBMeVu4nD6kB7yIeH7F8=";
            x86_64-linux = "sha256-IswKowneeMPtQvULpFdw90WuwbOn2MmHt5xW+H6YuBs=";
          };

          # create a fixed-output derivation which captures our dependencies
          deps = pkgs.stdenv.mkDerivation {
            pname = "om-expenses-deps";
            version = "0.0.1";
            src = ./.;

            nativeBuildInputs = with pkgs; [ deno ];

            # run the same build as our main derivation to ensure we capture the correct set of dependencies
            buildPhase = ''
              HOME="$(mktemp -d)"
              deno install
            '';

            # take the cached dependencies and add them to the output (remove .poll files which are random!)
            installPhase = ''
              find node_modules -iname '*.poll' -delete
              mkdir -p            $out/lib/
              cp -r node_modules  $out/lib/
            '';

            dontFixup = true;
            dontPatchShebangs = true;

            # specify the content hash of this derivations output
            outputHashAlgo = "sha256";
            outputHashMode = "recursive";
            outputHash = hashes.${system};
          };
        in

        pkgs.stdenv.mkDerivation {
          pname = "om-expenses";
          version = "0.0.1";

          src = ./.;

          nativeBuildInputs = with pkgs; [ deno deps ];

          installPhase = ''
            cp -r ${deps}/lib/node_modules .

            chmod -R u+rw node_modules

            ./deno-fix.sh

            ${pkgs.deno}/bin/deno task build

            cd frontend
            ./deno-fix.sh
            cd ..

            mkdir -p $out/bin
            mkdir -p $out/common
            mkdir -p $out/backend
            mkdir -p $out/frontend

            cp -r node_modules            $out/
            cp -r package.json            $out/
            cp -r deno.json               $out/

            cp -r common/src              $out/common/
            cp -r common/package.json     $out/common/
            cp -r common/deno.json        $out/common/

            cp -r backend/src             $out/backend/
            cp -r backend/package.json    $out/backend/
            cp -r backend/deno.json       $out/backend/

            cp -r frontend/.output        $out/frontend/
            cp -r frontend/package.json   $out/frontend/
            cp -r frontend/deno.json      $out/frontend/

            cat << EOF > $out/bin/om-expenses-backend
            #!${pkgs.bash}/bin/bash
            ${pkgs.deno}/bin/deno --allow-env --allow-read --allow-net ${placeholder "out"}/backend/src/index.ts
            EOF

            cat << EOF > $out/bin/om-expenses-frontend
            #!${pkgs.bash}/bin/bash
            PORT=\$OM_FRONTEND_PORT ${pkgs.deno}/bin/deno --allow-env --allow-read --allow-net ${placeholder "out"}/frontend/.output/server/index.mjs
            EOF

            chmod +x $out/bin/om-expenses-backend
            chmod +x $out/bin/om-expenses-frontend
          '';
        };
    });
}
