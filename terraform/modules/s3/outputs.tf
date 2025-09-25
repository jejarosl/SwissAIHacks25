output "bucket_name" {
  description = "Name of the S3 bucket"
  value       = aws_s3_bucket.frontend.id
}

output "bucket_website_endpoint" {
  description = "Website endpoint for the S3 bucket"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "training_data_bucket_name" {
  description = "Name of the training data S3 bucket"
  value       = aws_s3_bucket.training_data.id
}

output "training_data_user_name" {
  description = "Name of the IAM user for training data access"
  value       = aws_iam_user.training_data_user.name
}

output "training_data_access_key" {
  description = "Access key for the training data user"
  value       = aws_iam_access_key.training_data_key.id
  sensitive   = false
}

output "training_data_secret_key" {
  description = "Secret key for the training data user"
  value       = aws_iam_access_key.training_data_key.secret
  sensitive   = true
}