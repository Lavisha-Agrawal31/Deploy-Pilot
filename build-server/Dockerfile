FROM ubuntu:focal

#update the packages which are in ubuntu
RUN apt-get update

#for api calls
RUN apt-get install -y curl 

#install nodejs
RUN curl -sL https://deb.nodesource.com/setup_20.x | bash -
RUN apt-get upgrade -y
RUN apt-get install -y nodejs
 
#install git
RUN apt-get install git -y

WORKDIR /home/app

COPY main.sh main.sh
COPY script.js script.js
COPY package*.json .

RUN npm install

#executable permission
RUN chmod +x main.sh
RUN chmod +x script.js

ENV AWS_REGION=ap-south-1
ENV PROJECT_ID=""
ENV GIT_REPOSITORY__URL=""


#when container is up and running then it will execute this file
ENTRYPOINT ["/home/app/main.sh"]
    

