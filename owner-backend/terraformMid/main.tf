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
}

variable "project_id" {
  description = "Die Google Cloud Projekt-ID"
  type        = string
}


variable "regionStorage" {
  description = "Die Region, in der das Cluster erstellt wird"
  type        = string
  default     = "europe-west1"
}

variable "tenantid" {
  description = "Die ID des Tenant"
  type        = string
  default     = "123"
}

resource "google_firestore_database" "firestore" {
  name        = var.tenantid
  project     = var.project_id
  location_id = var.regionStorage
  type        = "FIRESTORE_NATIVE"
}

resource "google_storage_bucket" "bucket" {
  name          = var.tenantid
  location      = var.regionStorage
  storage_class = "STANDARD"

  lifecycle_rule {
    action {
      type = "Delete"
    }
    condition {
      age = 365
    }
  }
}


output "firestore_region" {
  description = "Region der Firestore-Datenbank"
  value       = google_firestore_database.firestore.location_id
}

output "storage_bucket_name" {
  description = "Name des Storage-Buckets"
  value       = google_storage_bucket.bucket.name
}
