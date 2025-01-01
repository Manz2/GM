echo "Creating new tenant"

cd /app/terraform

terraform init

echo "init successfull"

terraform apply -auto-approve

echo "Creating new tenant"

gcloud container clusters get-credentials basis --region=europe-west1-b

cd /app/helm

helm upgrade --install ingress-nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx --namespace ingress-nginx --create-namespace

kubectl create serviceaccount staging

gcloud iam service-accounts add-iam-policy-binding dev-serviceaccount@ca-test2-438111.iam.gserviceaccount.com --role="roles/iam.workloadIdentityUser" --member="serviceAccount:ca-test2-438111.svc.id.goog[default/staging]"

helm upgrade --install  gm-staging ./
