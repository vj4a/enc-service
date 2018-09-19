#!/bin/bash
# Build script
set -o errexit
e () {
    echo $( echo ${1} | jq ".${2}" | sed 's/\"//g')
}
m=$(metadata.sh)
commit_hash=$1

org=$(e "${m}" "org")
name=$(e "${m}" "name")
version=$(e "${m}" "version")

git archive --format=tar.gz sunbirdntp inventory --output=code.tar.gz
docker build -f ./Dockerfile --label commitHash=${commit_hash} -t ${org}/${name}:${version}-bronze .
rm -rf code.tar.gz
