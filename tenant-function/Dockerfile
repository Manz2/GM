# Basierend auf dem Google Cloud SDK Docker-Image
FROM gcr.io/google.com/cloudsdktool/cloud-sdk:latest

# Installiere notwendige Pakete
RUN apt-get update && apt-get install -y \
    software-properties-common \
    curl \
    gnupg \
    && rm -rf /var/lib/apt/lists/*

# Füge den HashiCorp-Repository-Schlüssel hinzu
RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg

# Füge das HashiCorp-Repository hinzu
RUN echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com focal main" > /etc/apt/sources.list.d/hashicorp.list

# Installiere Terraform
RUN apt-get update && apt-get install -y terraform && rm -rf /var/lib/apt/lists/*

# Installiere Helm
RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Installiere Git
RUN apt-get install -y git

# Setze das Arbeitsverzeichnis
WORKDIR /workspace

# Klone das Git-Repository
# Git-Repository-URL und Branch werden später als Umgebungsvariablen übergeben
RUN echo '#!/bin/bash\n\
set -e\n\
if [ -z "$GIT_REPO" ]; then echo "GIT_REPO is not set"; exit 1; fi\n\
if [ -z "$GIT_BRANCH" ]; then export GIT_BRANCH=main; fi\n\
git clone --branch $GIT_BRANCH $GIT_REPO helm-repo' > /clone-repo.sh && chmod +x /clone-repo.sh
CMD ["/clone-repo.sh"]

# Kopiere den Cloud Function Code ins Image
COPY . .

# Startpunkt für die Cloud Function
CMD ["functions-framework", "--target=main"]
