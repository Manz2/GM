#!/bin/sh

# Überprüfen, ob die erforderlichen Parameter übergeben wurden
if [ "$#" -lt 6 ]; then
  echo "Usage: $0 <CLUSTER_NAME> <REGION> <PROPERTYVERSION> <MANAGEMENTVERSION> <FINANCEVERSION> <REGIONSTORAGE>"
  exit 1
fi

CLUSTER_NAME=$1
REGION=$2
PROPERTYVERSION=$3
MANAGEMENTVERSION=$4
FINANCEVERSION=$5
REGIONSTORAGE=$6

echo "Creating new tenant for cluster: $CLUSTER_NAME in region: $REGION"

cd /app/terraform

terraform init

# Terraform anwenden mit übergebenen Variablen
terraform apply -auto-approve -var="cluster_name=$CLUSTER_NAME" -var="region=$REGION" -var="regionStorage=$REGIONSTORAGE" -state="./states/$CLUSTER_NAME.tfstate"

echo "Starting Helm installation for gm with versions: Property:$PROPERTYVERSION Management:$MANAGEMENTVERSION Finance:$FINANCEVERSION"

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
i=1
while [ "$i" -le 5 ]; do
  helm upgrade --install gm ./ \
    --set propertyBackend.version="$PROPERTYVERSION" \
    --set managementFrontend.version="$MANAGEMENTVERSION" \
    --set financeBackend.version="$FINANCEVERSION" && break

  echo "Attempt $i failed. Retrying in 10 seconds..."
  i=$((i + 1))
  sleep 10
done

if [ "$i" -gt 5 ]; then
  echo "Failed to install Helm charts after 5 attempts"
  exit 1
fi

