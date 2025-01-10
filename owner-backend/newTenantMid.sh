#!/bin/sh

# Überprüfen, ob die erforderlichen Parameter übergeben wurden
if [ "$#" -lt 2 ]; then
  echo "Usage: $0 <TENANTID> <REGIONSTORAGE>"
  exit 1
fi


TENANTID=$1
REGIONSTORAGE=$2

echo "Creating db and storage tenant: $TENANTID in region: $REGIONSTORAGE"

cd /app/terraformMid

terraform init

# Terraform anwenden mit übergebenen Variablen
terraform apply -auto-approve -var="tenantid=$TENANTID" -var="regionStorage=$REGIONSTORAGE" -state="./states/$TENANTID.tfstate"
