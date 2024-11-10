{
  inputs.nixpkgs.url = "github:NixOS/nixpkgs/release-24.05";
  inputs.flake-utils.url = "github:numtide/flake-utils";
  inputs.prisma-utils.url = "github:VanCoding/nix-prisma-utils";

  outputs =
    { nixpkgs, flake-utils, prisma-utils, ... }:
    flake-utils.lib.eachDefaultSystem (system:

    let
      pkgs = import nixpkgs { inherit system; };
      prisma =
        (prisma-utils.lib.prisma-factory {
          nixpkgs = pkgs;
          prisma-fmt-hash = "sha256-iZuomC/KaLF0fQy6RVHwk2qq4DRaG3xj+sWmtLofiMU="; # just copy these hashes for now, and then change them when nix complains about the mismatch
          query-engine-hash = "sha256-Pl/YpYu326qqpbVfczM5RxB8iWXZlewG9vToqzSPIQo=";
          libquery-engine-hash = "sha256-ETwMIJMjMgZmjH6QGD7GVwYYlyx9mo2ydEeunFViCjQ=";
          schema-engine-hash = "sha256-rzzzPHOpUM3GJvkhU08lQ7rNspdq3RKxMRRW9YZtvhU=";
        }).fromNpmLock
          ./package-lock.json; # <--- path to our package-lock.json file that contains the version of prisma-engines
    in
    {
      devShell = pkgs.mkShell {
        # shellHook = prisma.shellHook;

        buildInputs = with pkgs; [
          nodejs_22
          nixpkgs-fmt
          prisma-engines
        ];
      };
    });
}
