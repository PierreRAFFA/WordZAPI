# Wordz API

API used by WordZ repository (private) which is a project developed in Unity5 (c#)

##Technical Overview
Loopback  
NodeJS  
MongoDB  
Passport  
Facebook API  
Google API
Docker

##Docker commands

###Build and push
docker build -t pierreraffa/wordz-api:0.2 .  
docker push pierreraffa/wordz-api:0.2  
docker pull pierreraffa/wordz-api:0.2

###Create containers
docker pull mongo  
docker run --name wordz-mongo -d mongo --auth  
docker run --name wordz-mongo -v /Users/pierre/WORKSPACE/Wordz/WordzAPI/db:/data/db -d mongo  
docker run --name wordz-mongo -v /wordz/prod/db:/data/db -d mongo
    
docker run --name wordz-api -p 3010:3010 --link wordz-mongo:mongo -d pierreraffa/wordz-api:0.1  

docker run --name wordz-cron --link wordz-mongo:mongo -d pierreraffa/wordz-cron:0.1  
  
###Connect to the containers:  
docker exec -it wordz-api /bin/bash  
docker exec -it wordz-mongo /bin/bash  

###Connect to the logs  
docker logs {container} -f