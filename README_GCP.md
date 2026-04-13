# GCP Deployment Guide: Cyber-Kinetic Crisis Dashboard

This guide outlines the steps to deploy the extracted Targon assets to **Google Cloud Platform (GCP)**.

## Prerequisites
- [Google Cloud SDK (gcloud CLI)](https://cloud.google.com/sdk/docs/install) installed and initialized.
- An active GCP Project with Billing enabled.
- Docker installed locally (if building images manually).

## 1. Secret Management
Before deploying, store the sensitive credentials discovered in the Targon environment in **GCP Secret Manager**.

```bash
# Create secrets for API access
gcloud secrets create BLUEWAVE_USER --replication-policy="automatic"
echo -n "john.doe@bluewave.com" | gcloud secrets versions add BLUEWAVE_USER --data-file=-

gcloud secrets create BLUEWAVE_PASS --replication-policy="automatic"
echo -n "Criticalasset@2026" | gcloud secrets versions add BLUEWAVE_PASS --data-file=-
```

## 2. Porting the Backend (Cloud Run)
The `company_api_mcp.py` script has been extracted and a `Dockerfile.api` has been provided.

```bash
# Build and Push to Artifact Registry
gcloud builds submit --tag gcr.io/[PROJECT_ID]/cyber-api . --dockerfile Dockerfile.api

# Deploy to Cloud Run
gcloud run deploy cyber-api \
  --image gcr.io/[PROJECT_ID]/cyber-api \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 3. Porting the Frontend (Cloud Run)
The dashboard resides in the `dashboard/` directory. Use the provided `Dockerfile`.

```bash
# Build and Push
gcloud builds submit --tag gcr.io/[PROJECT_ID]/cyber-dashboard ./dashboard

# Deploy
gcloud run deploy cyber-dashboard \
  --image gcr.io/[PROJECT_ID]/cyber-dashboard \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

## 4. Resource Allocation Note
> [!IMPORTANT]
> The Targon environment allocated **50GB of RAM** for this workload. While the dashboard itself is lightweight, if you are running heavy data processing or numerous MCP tools, ensure your Cloud Run service is configured with at least 8GB-16GB of RAM to start, and scale up if needed.

## 5. SSH Configuration
To allow Aaron to access the new GCP environment:
1. Navigate to **Compute Engine > Metadata > SSH Keys**.
2. Add the following public key:
   `ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIDCMCRDoTgTGxchRMg7i/JlbCESBTuy7e6x3dOJVPBWF aaron@insuremep.com`
