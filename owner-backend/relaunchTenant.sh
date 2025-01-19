#!/bin/sh

# Überprüfen, ob die erforderlichen Parameter übergeben wurden
if [ "$#" -lt 6 ]; then
  echo "Usage: $0 <CLUSTER_NAME> <REGION> <PROPERTYVERSION> <MANAGEMENTVERSION> <PARKINGVERSION> <FINANCEVERSION> "
  exit 1
fi

CLUSTER_NAME=$1
REGION=$2
PROPERTYVERSION=$3
MANAGEMENTVERSION=$4
FINANCEVERSION=$5
PARKINGVERSION=$6

DNS_ZONE="gm" # DNS-Zonenname
DNS_NAME="$CLUSTER_NAME.gm25.software." # Vollständiger DNS-Name mit Punkt am Ende
TTL=3600 # Zeit in Sekunden, wie lange der Eintrag gecached wird

echo "Creating new tenant for cluster: $CLUSTER_NAME in region: $REGION"

cd /app/terraformRelaunch

terraform init

# Terraform anwenden mit übergebenen Variablen
terraform apply -auto-approve -var="cluster_name=$CLUSTER_NAME" -var="region=$REGION" -state="./states/$CLUSTER_NAME.tfstate"

echo "Starting Helm installation for gm with versions: Property:$PROPERTYVERSION Management:$MANAGEMENTVERSION Finance:$FINANCEVERSION Parking:$PARKINGVERSION"

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

gcloud iam service-accounts add-iam-policy-binding $CLUSTER_NAME@ca-test2-438111.iam.gserviceaccount.com --role="roles/iam.workloadIdentityUser" --member="serviceAccount:ca-test2-438111.svc.id.goog[default/staging]"

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

# External IP des Ingress überwachen
echo "Waiting for Ingress External IP..."
external_ip=""
retries=0
max_retries=30

while [ "$retries" -lt "$max_retries" ]; do
  external_ip=$(kubectl get svc -n ingress-nginx ingress-nginx-controller -o jsonpath='{.status.loadBalancer.ingress[0].ip}')

  if [ "$external_ip" != "<pending>" ] && [ -n "$external_ip" ]; then
    echo "Ingress External IP: $external_ip"
    break
  fi

  echo "External IP is still pending... retrying in 10 seconds."
  retries=$((retries + 1))
  sleep 10
done

if [ "$retries" -ge "$max_retries" ]; then
  echo "Failed to get External IP after $max_retries retries."
  exit 1
fi

# DNS-Eintrag aktualisieren
echo "Updating DNS entry for $DNS_NAME with IP $external_ip"
gcloud dns record-sets transaction start --zone="$DNS_ZONE"

# Bestehenden Eintrag entfernen (falls vorhanden)
EXISTING_RECORD=$(gcloud dns record-sets list --zone="$DNS_ZONE" --name="$DNS_NAME" --type="A" --format="json")
if [ "$EXISTING_RECORD" != "[]" ]; then
  echo "Removing existing DNS record for $DNS_NAME"
  gcloud dns record-sets transaction remove \
    --zone="$DNS_ZONE" \
    --name="$DNS_NAME" \
    --type="A" \
    --ttl="$TTL" \
    $(echo "$EXISTING_RECORD" | jq -r '.[0].rrdatas[]')
fi

# Neuen Eintrag hinzufügen
gcloud dns record-sets transaction add \
  --zone="$DNS_ZONE" \
  --name="$DNS_NAME" \
  --type="A" \
  --ttl="$TTL" \
  "$external_ip"

gcloud dns record-sets transaction execute --zone="$DNS_ZONE"

echo "DNS entry updated successfully: $DNS_NAME -> $external_ip"

# External IP als Rückgabewert des Skripts ausgeben
echo "External IP erfolgreich ermittelt: $external_ip"
echo "$external_ip"
exit 0
