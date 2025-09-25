# Deploy user outputs removed

output "github_actions_role_arn" {
  description = "ARN of the GitHub Actions role"
  value       = var.create_oidc_provider ? aws_iam_role.github_actions_role[0].arn : null
}