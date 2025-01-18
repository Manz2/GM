#!/bin/sh

# Überprüfen, ob die erforderlichen Parameter übergeben wurden
if [ "$#" -lt 5 ]; then
  echo "Usage: $0 <CLUSTER_NAME> <REGION> <PROPERTYVERSION> <MANAGEMENTVERSION> <FINANCEVERSION> <PARKINGVERSION>"
  exit 1
fi

CLUSTER_NAME=$1
REGION=$2
PROPERTYVERSION=$3
MANAGEMENTVERSION=$4
FINANCEVERSION=$5
PARKINGVERSION=$6

echo "Updating tenant in cluster: $CLUSTER_NAME in region: $REGION"

echo "Starting Helm installation for gm with versions: Property:$PROPERTYVERSION Management:$MANAGEMENTVERSION Finance:$FINANCEVERSION Parking:$PARKINGVERSION"

# Anmeldedaten für den Cluster abrufen
gcloud container clusters get-credentials "$CLUSTER_NAME" --region="$REGION"

# Helm-Repository vorbereiten
export XDG_CACHE_HOME=/tmp/.cache
mkdir -p /tmp/.cache/helm
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update

cd /app/helm

# Helm-Charts installieren (mit Retry)
i=1
while [ "$i" -le 5 ]; do
  helm upgrade --install gm ./ \
    --set propertyBackend.version="$PROPERTYVERSION" \
    --set managementFrontend.version="$MANAGEMENTVERSION" \
    --set financeBackend.version="$FINANCEVERSION" \
    --set parkingBackend.version="$PARKINGVERSION" && break

  echo "Attempt $i failed. Retrying in 10 seconds..."
  i=$((i + 1))
  sleep 10
done

if [ "$i" -gt 5 ]; then
  echo "Failed to install Helm charts after 5 attempts"
  exit 1
fi