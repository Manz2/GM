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

variable "project_id" {
  description = "Die Google Cloud Projekt-ID"
  type        = string
}

variable "region" {
  description = "Die Region, in der das Cluster erstellt wird"
  type        = string
  default     = "europe-west1-b"
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
  default     = "e2-medium"
}

# Service Account erstellen
resource "google_service_account" "cluster_service_account" {
  account_id   = var.cluster_name
  display_name = "${var.cluster_name} Service Account"
}

# Rolle: Übernahme der Identität von Dienstkonten
resource "google_project_iam_member" "service_account_identity" {
  project = var.project_id
  role    = "roles/iam.serviceAccountTokenCreator"
  member  = "serviceAccount:${google_service_account.cluster_service_account.email}"
}

# Rolle: GCS Storage Admin
resource "google_project_iam_member" "storage_admin" {
  project = var.project_id
  role    = "roles/storage.admin"
  member  = "serviceAccount:${google_service_account.cluster_service_account.email}"
}

# Rolle: Firestore User
resource "google_project_iam_member" "datastore_user" {
  project = var.project_id
  role    = "roles/datastore.user"
  member  = "serviceAccount:${google_service_account.cluster_service_account.email}"
}

# Rolle: Firebase Authentication Admin
resource "google_project_iam_member" "firebase_auth_admin" {
  project = var.project_id
  role    = "roles/firebaseauth.admin"
  member  = "serviceAccount:${google_service_account.cluster_service_account.email}"
}

resource "google_container_cluster" "primary" {
  name                  = var.cluster_name
  location              = var.region
  networking_mode       = "VPC_NATIVE"
  ip_allocation_policy  {}

  initial_node_count    = var.node_count

  node_config {
    machine_type = var.node_machine_type
    disk_size_gb = 50

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }
}

output "cluster_name" {
  description = "Der Name des Clusters"
  value       = google_container_cluster.primary.name
}

