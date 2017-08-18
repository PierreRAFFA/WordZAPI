# Wordz Authentication

Wordz Authentication is a microservice used by WordZ repository (private) which is a project developed in Unity5 (c#)
This microservice manages the authentication and the games/ranking (should be split soon)

## Technical Overview
- Loopback  
- NodeJS  
- MongoDB  
- Passport  
- Facebook API  
- Google API
- Docker

## Docker commands

#### Build and push to DockerHub
```sh
$ docker build -t pierreraffa/wordz-api:latest .  
$ docker push pierreraffa/wordz-api:latest  
$ docker pull pierreraffa/wordz-api:latest  
```
#### Create containers
```sh
$ docker run --name wordz-api-mongo -p 27017:27017 -v /opt/wordz-api-mongo/db:/data/db -d mongo --auth 
$ docker exec -it wordz-api-mongo mongo admin  
  > db.createUser({ user: "admin", pwd: "password", roles:["root"]})  
  > db.auth("admin","password")  
  > use wordz-api  
  > db.createUser({ user: "api", pwd: "password", roles: ["readWrite"] }) 
$ docker run --name wordz-api -p 3010:3010 --link wordz-api-mongo:mongo --link wordz-purchase:wordz-purchase -d pierreraffa/wordz-api:latest 
```
#### Connect to the containers  
```sh
$ docker exec -it wordz-api /bin/bash  
$ docker run -it --rm --link wordz-api-mongo:mongo mongo mongo -u api -p password --authenticationDatabase wordz-api wordz-api-mongo/wordz-api  
```
#### Connect to the logs  
```sh
$ docker logs wordz-api -f
```
