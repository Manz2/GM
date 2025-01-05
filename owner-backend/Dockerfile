# build with:
# docker build -t com/group/property-backend .

FROM openjdk:21-jdk-slim

# Erstelle Benutzer 'spring'
RUN adduser --system --group spring
USER root

# Installiere benötigte Tools: Terraform, Helm, kubectl, gcloud
RUN apt-get update && apt-get install -y \
    curl \
    gnupg \
    unzip \
    apt-transport-https \
    lsb-release

# Installiere Terraform
RUN curl -fsSL https://apt.releases.hashicorp.com/gpg | gpg --dearmor -o /usr/share/keyrings/hashicorp-archive-keyring.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/hashicorp-archive-keyring.gpg] https://apt.releases.hashicorp.com $(lsb_release -cs) main" | tee /etc/apt/sources.list.d/hashicorp.list && \
    apt-get update && apt-get install -y terraform

# Installiere Helm
RUN curl https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash

# Installiere kubectl
RUN curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl" && \
    install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Installiere Google Cloud SDK
RUN curl -fsSL https://packages.cloud.google.com/apt/doc/apt-key.gpg | gpg --dearmor -o /usr/share/keyrings/cloud.google.gpg && \
    echo "deb [signed-by=/usr/share/keyrings/cloud.google.gpg] https://packages.cloud.google.com/apt cloud-sdk main" | tee /etc/apt/sources.list.d/google-cloud-sdk.list && \
    apt-get update && apt-get install -y google-cloud-cli

# Installiere gke-gcloud-auth-plugin
RUN apt-get update && apt-get install -y google-cloud-sdk-gke-gcloud-auth-plugin
ENV USE_GKE_GCLOUD_AUTH_PLUGIN=True


# Aufräumen, um das Image klein zu halten
RUN apt-get clean && rm -rf /var/lib/apt/lists/*

# Setze die Umgebungsvariable HOME für gcloud
RUN mkdir -p /app/.config/gcloud && chown -R spring:spring /app/.config
ENV HOME=/app

# Kopiere die Anwendung
ARG JAR_FILE=target/*.jar
COPY ${JAR_FILE} /app/app.jar

# Kopiere die Terraform-, Helm-Ordner und das Skript ins Image
COPY ./terraform/ /app/terraform/
COPY ./helm/ /app/helm/
COPY ./newTenant.sh /app/scripts/newTenant.sh
COPY ./updateTenant.sh /app/scripts/updateTenant.sh

# Setze Berechtigungen für .kube-Verzeichnis
RUN mkdir -p /app/.kube && chown -R spring:spring /app/.kube

# Setze die Umgebungsvariable KUBECONFIG
ENV KUBECONFIG=/app/.kube/config

# Erstelle das Verzeichnis für den Helm-Cache und setze Berechtigungen
RUN mkdir -p /tmp/.cache/helm && chown -R spring:spring /tmp/.cache

# Setze die richtigen Berechtigungen für die kopierten Dateien
RUN chown -R spring:spring /app/terraform /app/helm /app/scripts \
    && chmod -R u+rwx /app/terraform /app/helm /app/scripts

# Setze den Benutzer zurück auf spring
USER spring:spring

# Starte die Anwendung
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
