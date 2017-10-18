# Lexio Authentication

Lexio Authentication is a microservice used by WordZ repository (private) which is a project developed in Unity5 (c#)
This microservice manages the authentication and the games/ranking (should be split soon)

## Technical Overview
- Loopback  
- NodeJS  
- MongoDB  
- Passport  
- Facebook API  
- Google API
- Docker


### Remove all users except Guest and Admin
db.user.remove({$and:[{"username":{$not:{$eq:"Guest"}}}, {"username":{$not:{$eq:"Admin"}}}]})
db.userIdentity.remove({})