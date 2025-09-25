provider "aws" {
  region     = var.aws_region
  access_key = var.aws_access_key
  secret_key = var.aws_secret_key
}

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # Configure this based on your needs
    bucket         = "swisshacks-terraform-state"
    key            = "terraform.tfstate"
    region         = "eu-central-1"
    use_lockfile   = true
  }
}

module "vpc" {
  source      = "./modules/vpc"
  environment = var.environment
  project     = var.project_name
}

module "ecr" {
  source      = "./modules/ecr"
  environment = var.environment
  project     = var.project_name
}

module "ecs" {
  source           = "./modules/ecs"
  environment      = var.environment
  project          = var.project_name
  vpc_id           = module.vpc.vpc_id
  public_subnets   = module.vpc.public_subnets
  app_port         = 8000 # Backend API port
  backend_image_url = module.ecr.repository_url
  depends_on       = [module.ecr]
}

module "rds" {
  source        = "./modules/rds"
  environment   = var.environment
  project       = var.project_name
  vpc_id        = module.vpc.vpc_id
  private_subnets = module.vpc.private_subnets
  db_username   = var.db_username
  db_password   = var.db_password
  ecs_security_group_id = module.ecs.ecs_security_group_id
  skip_final_snapshot = var.skip_final_snapshot
}

module "s3" {
  source              = "./modules/s3"
  environment         = var.environment
  project             = var.project_name
  aws_region          = var.aws_region
  backend_alb_dns_name = module.ecs.alb_dns_name
}

module "iam" {
  source        = "./modules/iam"
  environment   = var.environment
  project       = var.project_name
  create_oidc_provider = var.create_oidc_provider
  github_org    = var.github_org
  github_repo   = var.github_repo
}