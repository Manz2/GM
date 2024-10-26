# GM 
a project for the Cloud Application Development course

## Deploy
How to deploy this application to Gcloud run
```
gcloud auth configure-docker europe-west1-docker.pkg.dev

docker build -t com/group/gm-frontend .

docker tag com/group/gm-frontend europe-west1-docker.pkg.dev/ca-test2-438111/cloud-run-source-deploy/com/group/gm-frontend

docker push europe-west1-docker.pkg.dev/ca-test2-438111/cloud-run-source-deploy/com/group/gm-frontend

gcloud run deploy gm-frontend --image=europe-west1-docker.pkg.dev/ca-test2-438111/cloud-run-source-deploy/com/group/gm-frontend --platform=managed --region=europe-west1 --allow-unauthenticated --port=3000 --memory=1Gi --set-env-vars "SPRING_PROFILES_ACTIVE=dev"



docker build -t com/group/gm-backend .

docker tag com/group/gm-backend europe-west1-docker.pkg.dev/ca-test2-438111/cloud-run-source-deploy/com/group/gm-backend

docker push europe-west1-docker.pkg.dev/ca-test2-438111/cloud-run-source-deploy/com/group/gm-backend

gcloud run deploy gm-backend --image=europe-west1-docker.pkg.dev/ca-test2-438111/cloud-run-source-deploy/com/group/gm-backend --platform=managed --region=europe-west1 --allow-unauthenticated --port=8081 --memory=1Gi --set-env-vars "SPRING_PROFILES_ACTIVE=dev"
```
