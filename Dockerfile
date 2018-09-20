FROM node:8.11.3-alpine
MAINTAINER "Rajesh R <rajesh.r@optit.co>"

RUN adduser -h /home/opensaber opensaber -D 
WORKDIR /home/opensaber
ADD code.tar.gz /home/opensaber/
RUN apk add --no-cache zip python make g++; \
    npm i ;\
    apk del --purge python make g++
RUN chown -R opensaber:opensaber /home/opensaber
USER opensaber
# This is the short commit hash from which this image is built from
# This label is assigned at time of image creation
# LABEL commitHash
EXPOSE 8013
# !!! password from file have to be replaced, and use env var
ENTRYPOINT ["/bin/sh", "-c", "node app.js < pass_file"]
