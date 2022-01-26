# iTemper Web

## Project setup
```
npm install
```

### Compiles and hot-reloads for development
```
npm run serve
```

### Compiles and minifies for production
```
npm run build
```

### Run your tests
```
npm run test
```

### Lints and fixes files
```
npm run lint
```

### Run your unit tests
```
npm run test:unit
```

### Release distro to docker
The build machine must have docker, npm and cloned itemper-web repo 
```
cd itemper-web
rm -r dist
npm run build
docker build . --file Dockerfile --tag itemper-web
docker login --username tova
# see github-remote-access.txt for API
$gittag=git describe --tags --long
docker tag itemper-web tova/itemper-web:$gittag
docker tag itemper-web tova/itemper-web:latest 
docker push tova/itemper-web:$gittag
docker push tova/itemper-web:latest
```
### Deploy distro from docker
Deployment machine must have docker and cloned itemper-backend repo, ite,per-nginx service running
```
ssh tova@itemper
cd iTemper-Backend/nginx/
# echo <Docker Access Token> > ~/.docker-pwd.txt
cat  ~/.docker-pwd.txt | docker login --username tova --password-stdin
docker pull tova/itemper-web
docker run --rm --volumes-from itemper-nginx tova/itemper-web:latest cp -r -u /itemper /usr/share/nginx/html
```
Remember to clean the browser cache


### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).

## BLE
### Device configuration
 ble.init.setServices: advertisingStart=
    {"uuid":"a449e701-371a-48b4-a8a5-e8105127c123",
     "characteristics":[
         {"uuid":"a449e702-371a-48b4-a8a5-e8105127c123","properties":["read"],"secure":[],"value":null,"descriptors":[], "_events":{},"_eventsCount":6},
         {"uuid":"a449e705-371a-48b4-a8a5-e8105127c123","properties":["read","notify"],"secure":[],"value":null,
            "descriptors":[{"uuid":"2901","value":"Available wireless networks"}],"_events":{},"_eventsCount":6,"isSubscription":false,"maxValueSize":0,"Interval":20000},
        {"uuid":"a449e703-371a-48b4-a8a5-e8105127c123","properties":["read","write"],"secure":[],"value":null,"descriptors":[{"uuid":"2901","value":"Current WiFi"}],"_events":{},"_eventsCount":6},{"uuid":"a449e704-371a-48b4-a8a5-e8105127c123","properties":["read","write"],"secure":[],"value":null,"descriptors":[{"uuid":"2901","value":"Device settings"}],"_events":{},"_eventsCount":6}]
    }
