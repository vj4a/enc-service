FROM node:6.14.4
MAINTAINER "S M Y ALTAMASH" "smy.altamash@gmail.com"
WORKDIR /home/enc
COPY . /home/enc
RUN apt update \
    && apt install -y zip python make g++ \
    && npm i \
    && apt remove --purge -y python make g++ \
    && apt-get autoremove -y \
    && rm -rf /var/lib/apt/lists/*
EXPOSE 8013
CMD sh entrypoint.sh
