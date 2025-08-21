{
  description = "Technorino";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-25.05";
  };

  outputs = {
    self,
    nixpkgs,
  }: let
    system = "x86_64-linux";
    pkgs = nixpkgs.legacyPackages.${system};
  in {
    packages.${system}.default = import ./. {inherit pkgs;};
    devShells.${system}.default = import ./shell.nix {inherit pkgs;};
  };
}
