{
  pkgs ? import <nixpkgs> { },
}:
let
  project = import ./. { inherit pkgs; };
in
pkgs.mkShell {
  buildInputs =
    with pkgs;
    [
      ninja
      llvmPackages_19.clang-tools
    ]
    ++ project.buildInputs
    ++ project.nativeBuildInputs;

  shellHook = ''
    export NIX_BUILD_TOP="$PWD/build"
    alias configure="cmake -DCMAKE_EXPORT_COMPILE_COMMANDS=1 -DBUILD_WITH_QT6=1 -DBUILD_TESTS=1 -G Ninja .."
    mkdir -p "$NIX_BUILD_TOP"
    cd $NIX_BUILD_TOP
  '';
}
