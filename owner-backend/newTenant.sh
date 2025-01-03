#!/bin/sh

# Überprüfen, ob die erforderlichen Parameter übergeben wurden
if [ "$#" -lt 5 ]; then
  echo "Usage: $0 <CLUSTER_NAME> <REGION> <PROPERTYVERSION> <MANAGEMENTVERSION> <FINANCEVERSION>"
  exit 1
fi

CLUSTER_NAME=$1
REGION=$2
PROPERTYVERSION=$3
MANAGEMENTVERSION=$4
FINANCEVERSION=$5

echo "Creating new tenant for cluster: $CLUSTER_NAME in region: $REGION"

cd /app/terraform

terraform init

# Terraform anwenden mit übergebenen Variablen
terraform apply -auto-approve -var="cluster_name=$CLUSTER_NAME" -var="region=$REGION" -state="./states/$CLUSTER_NAME.tfstate"

echo "Starting Helm installation for gm with version: $VERSION"

# Anmeldedaten für den Cluster abrufen
gcloud container clusters get-credentials "$CLUSTER_NAME" --region="$REGION"

# Helm-Repository vorbereiten
export XDG_CACHE_HOME=/tmp/.cache
mkdir -p /tmp/.cache/helm
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

cd /app/helm

helm upgrade --install ingress-nginx ingress-nginx --repo https://kubernetes.github.io/ingress-nginx --namespace ingress-nginx --create-namespace --set controller.admissionWebhooks.enabled=false

kubectl create serviceaccount staging

gcloud iam service-accounts add-iam-policy-binding dev-serviceaccount@ca-test2-438111.iam.gserviceaccount.com --role="roles/iam.workloadIdentityUser" --member="serviceAccount:ca-test2-438111.svc.id.goog[default/staging]"

# Helm-Charts installieren (mit Retry)
for i in {1..5}; do
  helm upgrade --install gm ./ --set propertyBackend.version=$PROPERTYVERSION,managementFrontend.version=$MANAGEMENTVERSION,financeBackend.version=$FINANCEVERSION && break || sleep 10
  if [ "$i" -eq 5 ]; then
    echo "Failed to install Helm charts after 5 attempts"
    exit 1
  fi
done

