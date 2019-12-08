# LMS System - Demo 

One Paragraph of project description goes here

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. See deployment for notes on how to deploy the project on a live system.

### Requirement Install

```
NodeJS version >= v10.16.3
Npm version >= 6.9.0
Yarn version >=1.19.0
```

### Installing

A step by step series of examples that tell you how to get a development env running

Say what the step will be

```
Give the example
```

And repeat

```
until finished
```

End with an example of getting some data out of the system or using it for a little demo

## Running the tests

Explain how to run the automated tests for this system

### Break down into end to end tests

Explain what these tests test and why

```
Give an example
```

```
Give an example
```

## Deployment

Deploy this on a live system with VPS Linux

\*\* Setup config Nginx
Add new config for nginx, create file `be-lms.conf`

```
sudo nano /etc/nginx/conf.d/be-lms.conf
```

And add config flow

```
server {
    listen 80;

    server_name be-lms.tk www.be-lms.tk;
    return 301 https://$server_name$request_uri;
}
server {
    listen 443 ssl;
    listen [::]:443 ssl;
    #include snippets/self-signed.conf;
    #include snippets/ssl-params.conf;
    ssl_certificate /etc/letsencrypt/live/be-lms.tk/fullchain.pem; # managed by Certbot
    ssl_certificate_key /etc/letsencrypt/live/be-lms.tk/privkey.pem; # managed by Certbot

    server_name be-lms.tk www.be-lms.tk;
    location / {
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Host $http_host;
        proxy_set_header X-NginX-Proxy true;

        proxy_pass http://127.0.0.1:1337;
        proxy_redirect off;

        # Socket.IO Support
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    location ~ /.well-known {
        allow all;
    }

    include /etc/letsencrypt/options-ssl-nginx.conf; # managed by Certbot
}
```

Run scripts test config file nginx

```
sudo nginx -t
```

Run scripts restart nginx with new config

```
sudo nginx -s reload
```

\*\*\* Build project by pm2 

Install pm2 

```
sudo npm install -g pm2
```

Change API config, config file `config/environments/production/database.json` 

```
{
  "defaultConnection": "default",
  "connections": {
    "default": {
      "connector": "strapi-hook-mongoose",
      "settings": {
        "client": "mongo",
        "host": "${process.env.APP_HOST || 'localhost'}",
        "port": "${process.env.NODE_PORT || 27017}",
        "database": "be-lms",
        "username": "",
        "password": ""
      },
      "options": {
        "authenticationDatabase": "be-lms",
        "ssl": false
      }
    }
  }
}
```
Change API config, config file `config/environments/production/server.json` 
```
{
  "host": "localhost",
  "port": "${process.env.PORT || 1337}",
  "production": true,
  "proxy": {
    "enabled": true,
    "host": "be-lms.tk",
    "ssl": true
  },
  "cron": {
    "enabled": false
  },
  "admin": {
    "autoOpen": false
  }
}
```

Upload file build production in folder VPS, run scripts:

```
npm install
npm run build
```

Install package plugin done, run scripts run project by pm2

```
pm2 start npm --name BE-LMS -- run start
```

## Built With

- [Dropwizard](http://www.dropwizard.io/1.0.2/docs/) - The web framework used
- [Maven](https://maven.apache.org/) - Dependency Management
- [ROME](https://rometools.github.io/rome/) - Used to generate RSS Feeds

## Contributing

Please read [CONTRIBUTING.md](https://gist.github.com/PurpleBooth/b24679402957c63ec426) for details on our code of conduct, and the process for submitting pull requests to us.

## Versioning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/your/project/tags).

## Authors

- **Nguyen Ly Thanh** - _Initial work_ - [jimmi2051](https://github.com/jimmi2051)

See also the list of [contributors](https://github.com/jimmi2051/be-lms/contributors) who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details

## Acknowledgments

- Hat tip to anyone whose code was used
- Inspiration
- etc