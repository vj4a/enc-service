FROM node:8.11.3-alpine
MAINTAINER "Rajesh R <rajesh.r@optit.co>"

RUN useradd -u 1001 -md /home/sunbird sunbird
WORKDIR /home/sunbird
ADD code.tar.gz /home/sunbird/
RUN chown -R sunbird:sunbird /home/sunbird
USER sunbird
WORKDIR /home/sunbird
# This is the short commit hash from which this image is built from
# This label is assigned at time of image creation
# LABEL commitHash
EXPOSE 8013
# !!! password from file have to be replaced, and use env var
CMD ["/bin/sh", "-c", "node app.js < /code/password"]
