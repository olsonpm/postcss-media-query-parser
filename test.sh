#! /usr/bin/env sh

version="$(jq .version package.json)"
printf "%s" "${version}"
