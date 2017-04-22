# Wordz API

API used by WordZ repository (private) which is a project developed in Unity5 (c#)

##Technical Overview
Loopback  
NodeJS  
MongoDB  
Passport  
Facebook API  
Google API

##Docker commands
docker build -t wordz/wordz-api .
  
docker pull mongo  
docker run --name wordz-mongo -d mongo --auth  
docker run --name wordz-mongo -v /Users/pierre/WORKSPACE/Wordz/WordzAPI/db:/data/db -d mongo  
docker run --name wordz-mongo -v /wordz/prod/db:/data/db -d mongo
    
docker run --name wordz-api -p 3010:3010 --link wordz-mongo:mongo -d pierreraffa/wordz-api:0.1  
  
To connect to the containers:  
docker exec -it wordz-api /bin/bash  
docker exec -it wordz-mongo /bin/bash  

To connect to the logs
docker logs {container} -f