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
  default     = "europe-west1-b"
}

variable "regionStorage" {
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
  default     = "e2-medium"
}

# Firestore Datenbank
resource "google_firestore_database" "firestore" {
  name        = var.cluster_name
  project     = var.project_id
  location_id = var.regionStorage  # Gleiche Region wie das Cluster
  type        = "FIRESTORE_NATIVE" # Firestore im nativen Modus
}

# Storage Bucket
resource "google_storage_bucket" "bucket" {
  name          = var.cluster_name  # Gleicher Name wie das Cluster
  location      = var.regionStorage # Gleiche Region wie das Cluster
  storage_class = "STANDARD"        # Standard-Speicherklasse

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 365
    }
  }
}

# GKE Cluster
resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.region

  networking_mode = "VPC_NATIVE"
  ip_allocation_policy {}
  remove_default_node_pool = true  # Deaktiviert den Standard-Node-Pooln
  initial_node_count       = 1     # Muss gesetzt sein, auch wenn der Node-Pool entfernt wird

}

resource "google_container_node_pool" "primary_nodes" {
  name     = "primary-node-pool"
  cluster  = google_container_cluster.primary.name
  location = google_container_cluster.primary.location

  node_config {
    machine_type = var.node_machine_type
    disk_size_gb = 50

    oauth_scopes = [
      "https://www.googleapis.com/auth/cloud-platform",
    ]
  }

  autoscaling {
    min_node_count = 1
    max_node_count = 4
  }

  initial_node_count = var.node_count
}

# Ausgabe
output "cluster_name" {
  description = "Der Name des Clusters"
  value       = google_container_cluster.primary.name
}

output "firestore_region" {
  description = "Region der Firestore-Datenbank"
  value       = google_firestore_database.firestore.location_id
}

output "storage_bucket_name" {
  description = "Name des Storage-Buckets"
  value       = google_storage_bucket.bucket.name
}
