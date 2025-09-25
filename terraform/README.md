# SwissHacks Terraform Infrastructure

This directory contains Terraform configurations to provision AWS infrastructure for the SwissHacks application.

## Infrastructure Components

- **VPC**: Network infrastructure with public and private subnets
- **ECR**: Docker image repositories for backend and frontend
- **ECS**: Fargate cluster for running containerized applications
- **RDS**: PostgreSQL database
- **S3 + CloudFront**: Static website hosting with API proxy capabilities

## Prerequisites

- [Terraform](https://www.terraform.io/downloads.html) 1.0+
- AWS CLI configured with appropriate permissions
- S3 bucket for Terraform state (optional but recommended)

## Getting Started

1. Initialize Terraform:

```bash
terraform init
```

2. Create a `terraform.tfvars` file with your variables:

```hcl
aws_region   = "eu-central-1"
environment  = "dev"
project_name = "swisshacks"
db_username  = "dbuser"  # Don't commit sensitive values to git
db_password  = "dbpass"  # Use AWS Secrets Manager or similar in production
```

3. Validate the Terraform configuration:

```bash
terraform validate
```

4. Plan the deployment:

```bash
terraform plan -out=tfplan
```

5. Apply the changes:

```bash
terraform apply tfplan
```

## Remote State Configuration

For team collaboration, it's recommended to configure a remote state backend. Uncomment and update the backend configuration in `main.tf`.

## Deployment

After infrastructure provisioning:

1. Build and push Docker images to ECR
2. ECS will pull and deploy the latest images

## Destruction

To destroy all resources:

```bash
terraform destroy
```

**Warning**: This will delete all resources including the database. Make sure to take backups before destruction.