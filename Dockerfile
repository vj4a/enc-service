FROM node:6.14.4-slim
MAINTAINER "Rajesh R <rajesh.r@optit.co>"

RUN useradd -m -s /bin/bash opensaber
WORKDIR /home/opensaber
ADD code.tar.gz /home/opensaber/
RUN apt update && \
    apt install -y zip python make g++; \
    npm i ;\
    apt remove --purge -y python make g++; \
    apt-get autoremove -y; \
    rm -rf /var/lib/apt/lists/*
RUN chown -R opensaber:opensaber /home/opensaber
USER opensaber
# This is the short commit hash from which this image is built from
# This label is assigned at time of image creation
# LABEL commitHash
EXPOSE 8013
# !!! password from file have to be replaced, and use env var
ENTRYPOINT ["/bin/sh", "-c", "node app.js < pass_file"]
