output "ecr_repository_url" {
  description = "Backend ECR repository URL"
  value       = module.ecr.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "ecs_service_name" {
  description = "ECS service name"
  value       = module.ecs.service_name
}

output "rds_endpoint" {
  description = "RDS instance endpoint"
  value       = module.rds.db_endpoint
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name"
  value       = module.ecs.alb_dns_name
}

output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions role"
  value       = module.iam.github_actions_role_arn
}

output "frontend_bucket_name" {
  description = "S3 bucket name for frontend static files"
  value       = module.s3.bucket_name
}

output "cloudfront_domain_name" {
  description = "CloudFront distribution domain name"
  value       = module.s3.cloudfront_domain_name
}

output "cloudfront_distribution_id" {
  description = "CloudFront distribution ID"
  value       = module.s3.cloudfront_distribution_id
}

# Training data S3 bucket and credentials
output "training_data_bucket_name" {
  description = "Name of the training data S3 bucket"
  value       = module.s3.training_data_bucket_name
}

output "training_data_user_name" {
  description = "Name of the IAM user for training data access"
  value       = module.s3.training_data_user_name
}

output "training_data_access_key" {
  description = "Access key for the training data user"
  value       = module.s3.training_data_access_key
  sensitive   = false
}

output "training_data_secret_key" {
  description = "Secret key for the training data user"
  value       = module.s3.training_data_secret_key
  sensitive   = true
}