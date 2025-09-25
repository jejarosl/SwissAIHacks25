variable "environment" {
  description = "Environment name"
  type        = string
}

variable "project" {
  description = "Project name"
  type        = string
}

variable "vpc_id" {
  description = "VPC ID"
  type        = string
}

variable "public_subnets" {
  description = "Public subnet IDs"
  type        = list(string)
}

variable "app_port" {
  description = "Port exposed by the backend container"
  type        = number
  default     = 8000
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "eu-central-1"
}

variable "backend_image_url" {
  description = "ECR repository URL for backend image"
  type        = string
  default     = "" # This will be overridden in the module call
}