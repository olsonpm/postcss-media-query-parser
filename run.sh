#! /usr/bin/env sh

command="${1}"

build() {
  npx webpack
}

case "${command}" in
  lint)
    npx eslint . ;;

  test)
    npx tape -r '@babel/register' 'tests/**/*.js' | npx tap-spec ;;

  build)
    build ;;

  release)
    if [ ! "$(command -v jq)" ]; then
      printf "jq is required to release\\n\\n"
      echo   "https://stedolan.github.io/jq/"
    fi

    releaseDir="/tmp/postcss-media-query-parser_release"
    rm -rf "${releaseDir}"
    mkdir "${releaseDir}"

    cd "${releaseDir}" || exit
    git clone -b release git@github.com:olsonpm/postcss-media-query-parser.git repo
    mv repo/.git .
    rm -rf repo
    cd - || exit

    cp .gitignore changelog.md license.txt package.json readme.md "${releaseDir}"

    rm -rf release
    mkdir release
    build
    cp release/* "${releaseDir}"

    cd "${releaseDir}" || exit
    version="$(jq --raw-output .version package.json)"
    git add . && git commit -m "release ${version}" && git tag "${version}" && git push && git push origin "${version}"
    cd - || exit
    ;;

  '')
    echo 'no command given' ;;

  *)
    echo "command not found: ${command}" ;;
esac
