import subprocess
import os

def main(request):
    # Setze den Pfad zum Helm-Repo
    terraform_repo_dir = "/workspace/GM/terraform"
    helm_repo_dir = "/workspace/GM/helm"

    # Terraform/Helm-Befehle
    helm_cmd = f"helm install my-release {helm_repo_dir}/charts"
    terraform_cmd = "terraform apply -auto-approve"

    try:
        # Führt Helm-Befehl aus
        subprocess.run(terraform_cmd, shell=True, cwd=terraform_repo_dir, check=True)

        subprocess.run(helm_cmd, shell=True, cwd=helm_repo_dir, check=True)
        
        return "Helm erfolgreich ausgeführt!", 200
    except subprocess.CalledProcessError as e:
        return f"Fehler: {e}", 500
