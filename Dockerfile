FROM node:8-buster-slim
MAINTAINER "S M Y ALTAMASH" "smy.altamash@gmail.com"
WORKDIR /home/enc
COPY . /home/enc
RUN npm -v
RUN apt update \
    && apt install -y --force-yes zip python make g++ \
    && npm i \
    && apt remove --purge -y --force-yes python make g++ \
    && apt-get autoremove -y  \
    && rm -rf /var/lib/apt/lists/*
EXPOSE 8013
CMD sh entrypoint.sh
