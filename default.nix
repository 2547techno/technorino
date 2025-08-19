{
  pkgs ? import <nixpkgs> { },
}:

let
  chatterino2 = pkgs.chatterino2;
in

(chatterino2.buildChatterino {
  enableAvifSupport = true;
}).overrideAttrs
  (
    finalAttrs: _: {
      pname = "technorino";
      version = "unstable";

      src = ./.;
    }
  )
