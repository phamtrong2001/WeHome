# WeHome
_Solve Accommodation Problems_

Backend Project INT3306 4
## Getting Started
These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

## Prerequisites
Before you continue, ensure you meet the following requirements:

* You have installed NodeJS.
* The project is implemented on Windows, so I recommend to use Windows machine.
* You have a basic understanding of project.

## Installing
Install packages:

    npm install --scripts-prepend-node-path=auto

Or:

    npm install

## Deployment
### Environment variables

    DB_NAME=wehome
    DB_HOST=localhost
    DB_PORT=3307
    DB_USER=username
    DB_PASS=password
    PORT=8889
    SECRET_KEY=any-secret-key
    SALT=8
    MAIL_USER=wehomeapp@gmail.com
    MAIL_PASS=password

### Run app
Run file:
    
    run.bat / run.sh

Or run in terminal:
    
    npm start
Or:
    
    node ./bin/www

### api-docs
Run project and open path in browser:

    http://be.wehomeapp.tk/api-docs/
    http://localhost:8889/api-docs/

## Authors

[Trong Pham](https://github.com/phamtrong2001)

[Phu Quoc](https://github.com/npqhp)

[Tan Ho](https://github.com/manhtanit)
