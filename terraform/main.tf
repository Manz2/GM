# Terraform Version und Provider
terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 4.0"
    }
  }
  required_version = ">= 1.3.0"
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# Variablen
variable "project_id" {
  description = "Die Google Cloud Projekt-ID"
  type        = string
}

variable "region" {
  description = "Die Region, in der das Cluster erstellt wird"
  type        = string
  default     = "europe-west1"
}

variable "cluster_name" {
  description = "Der Name des Kubernetes-Clusters"
  type        = string
  default     = "my-kubernetes-cluster"
}

variable "node_count" {
  description = "Die Anzahl der Knoten im Cluster"
  type        = number
  default     = 2
}

variable "node_machine_type" {
  description = "Der Maschinentyp der Knoten"
  type        = string
  default     = "e2-small"
}

# GKE Cluster
resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region

  initial_node_count = var.node_count

  node_config {
    machine_type = var.node_machine_type
    disk_size_gb = 50

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }

  networking_mode = "VPC_NATIVE"
  ip_allocation_policy {}
}

# Ausgabe
output "kubeconfig" {
  description = "Der Inhalt der kubeconfig-Datei für Zugriff auf das Cluster"
  value       = google_container_cluster.primary.endpoint
}

output "cluster_name" {
  description = "Der Name des Clusters"
  value       = google_container_cluster.primary.name
}
