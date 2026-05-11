{
  pkgs ? import <nixpkgs> { },
}:
let
  project = import ./. { inherit pkgs; };
in
pkgs.mkShell {

  inputsFrom = [ project ];

  nativeBuildInputs = with pkgs; [
    llvmPackages_19.clang-tools
    doxygen
  ];

  shellHook = ''
    unset QT_PLUGIN_PATH
    unset QT_QPA_PLATFORM_PLUGIN_PATH

    export LD_LIBRARY_PATH="${pkgs.lib.makeLibraryPath [ pkgs.libpulseaudio ]}:$LD_LIBRARY_PATH"

    export NIX_BUILD_TOP="$PWD/build"
    export GEN_DATE=$(date -I)

    alias configure="cmake -DCMAKE_BUILD_TYPE=Debug -DCMAKE_EXPORT_COMPILE_COMMANDS=1 -DBUILD_WITH_QT6=1 -DBUILD_TESTS=1 -DCHATTERINO_SPELLCHECK=1 -DCHATTERINO_NIGHTLY_BUILD=1 .."

    mkdir -p "$NIX_BUILD_TOP"
    cd $NIX_BUILD_TOP
  '';
}
