# GM 
a project for the Cloud Application Development course


![Google Cloud](https://img.shields.io/badge/GoogleCloud-%234285F4.svg?style=for-the-badge&logo=google-cloud&logoColor=white)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Spring](https://img.shields.io/badge/spring-%236DB33F.svg?style=for-the-badge&logo=spring&logoColor=white)
![Docker](https://img.shields.io/badge/docker-%230db7ed.svg?style=for-the-badge&logo=docker&logoColor=white)
![openapi initiative](https://img.shields.io/badge/openapiinitiative-%23000000.svg?style=for-the-badge&logo=openapiinitiative&logoColor=white)

## Actions
![staging](https://github.com/Manz2/GM/actions/workflows/dev.yml/badge.svg)
![prod](https://github.com/Manz2/GM/actions/workflows/prod.yml/badge.svg)

## Deploy Manualy
How to deploy this application to Gcloud run
```
gcloud auth configure-docker europe-west1-docker.pkg.dev

docker build -t com/group/gm-property-frontend .

docker tag com/group/gm-property-frontend europe-west1-docker.pkg.dev/ca-test2-438111/cloud-run-source-deploy/com/group/gm-property-frontend

docker push europe-west1-docker.pkg.dev/ca-test2-438111/cloud-run-source-deploy/com/group/gm-property-frontend

gcloud run deploy gm-property-frontend --image=europe-west1-docker.pkg.dev/ca-test2-438111/cloud-run-source-deploy/com/group/gm-property-frontend --platform=managed --region=europe-west1 --allow-unauthenticated --port=3000 --memory=1Gi --set-env-vars "SPRING_PROFILES_ACTIVE=dev"



docker build -t com/group/property-backend .

docker tag com/group/property-backend europe-west1-docker.pkg.dev/ca-test2-438111/cloud-run-source-deploy/com/group/property-backend

docker push europe-west1-docker.pkg.dev/ca-test2-438111/cloud-run-source-deploy/com/group/property-backend

gcloud run deploy property-backend --image=europe-west1-docker.pkg.dev/ca-test2-438111/cloud-run-source-deploy/com/group/property-backend --platform=managed --region=europe-west1 --allow-unauthenticated --port=8081 --memory=1Gi --set-env-vars "SPRING_PROFILES_ACTIVE=dev"


openapi-generator-cli generate -i D:\Projekte\GM\openapi\property-openapi.yaml -g typescript-fetch -o ./api
```
