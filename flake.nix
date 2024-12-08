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
            x86_64-linux = "sha256-CZdRMTO38wKv8CBJo1UjCcrVxymSDnITG5wG50Gaib0=";
          };

          # create a fixed-output derivation which captures our dependencies
          deps = pkgs.stdenv.mkDerivation {
            pname = "om-expenses-deps";
            version = "0.0.2";
            src = ./.;

            nativeBuildInputs = with pkgs; [ deno ];

            # run the same build as our main derivation to ensure we capture the correct set of dependencies
            buildPhase = ''
              HOME="$(mktemp -d)"

              export DENO_DIR="deno-dir"
              mkdir -p $DENO_DIR

              deno install
              deno cache frontend/bundle.ts
            '';

            # take the cached dependencies and add them to the output (remove .poll files which are random!)
            installPhase = ''
              DENO_DIR="deno-dir"

              mkdir -p            $out/lib/deno-dir/
              cp -r $DENO_DIR/*   $out/lib/deno-dir/   
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
          version = "0.0.2";

          src = ./.;

          nativeBuildInputs = with pkgs; [ deno deps ];

          installPhase = ''
            HOME="$(mktemp -d)"

            DENO_DIR=${deps}/lib/deno-dir/

            # cp -r ${deps}/lib/node_modules .
            # chmod -R u+rw node_modules

            deno install

            ${pkgs.deno}/bin/deno cache backend/src/index.ts
            ${pkgs.deno}/bin/deno cache frontend/server.ts

            ${pkgs.deno}/bin/deno task build

            mkdir -p $out/bin
            mkdir -p $out/common
            mkdir -p $out/backend
            mkdir -p $out/frontend

            cp -a node_modules            $out/

            cp -r deno.json               $out/
            cp -r deno.lock               $out/

            cp -r common/src              $out/common/
            cp -r common/deno.json        $out/common/

            cp -r backend/src             $out/backend/
            cp -r backend/deno.json       $out/backend/

            cp -r frontend/dist           $out/frontend/
            cp -r frontend/web            $out/frontend/
            cp -r frontend/bundle.ts      $out/frontend/
            cp -r frontend/server.ts      $out/frontend/
            cp -r frontend/deno.json      $out/frontend/

            cat << EOF > $out/bin/om-expenses-backend
            #!${pkgs.bash}/bin/bash
            ${pkgs.deno}/bin/deno run --allow-env --allow-read --allow-net ${placeholder "out"}/backend/src/index.ts
            EOF

            cat << EOF > $out/bin/om-expenses-frontend
            #!${pkgs.bash}/bin/bash
            ${pkgs.deno}/bin/deno serve --allow-read --port \$OM_FRONTEND_PORT ${placeholder "out"}/frontend/server.ts
            EOF

            chmod +x $out/bin/om-expenses-backend
            chmod +x $out/bin/om-expenses-frontend
          '';
        };
    });
}
