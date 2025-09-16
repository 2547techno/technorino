{
  description = "Technorino";

  inputs = {
    self.submodules = true;
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
  };

  outputs =
    {
      self,
      nixpkgs,
    }:
    let
      supportedSystems = [
        "x86_64-linux"
        "aarch64-linux"
      ];
      default =
        path:
        nixpkgs.lib.genAttrs supportedSystems (system: {
          default = import path { inherit (nixpkgs.legacyPackages.${system}) pkgs; };
        });
    in

    {
      packages = default ./.;
      devShells = default ./shell.nix;
    };
}
