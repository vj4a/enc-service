#!/bin/bash
# Build script
set -o errexit
e () {
    echo $( echo ${1} | jq ".${2}" | sed 's/\"//g')
}
m=$(./metadata.sh)
commit_hash=$1

org=sunbird
name=$(e "${m}" "name")
version=$(e "${m}" "version")

[[ -f code.tar.gz ]] && rm -rf code.tar.gz
git archive --format=tar.gz ${commit_hash} --output=code.tar.gz 
docker build -f ./Dockerfile --label commitHash=${commit_hash} -t ${org}/${name}:${version}-bronze .
