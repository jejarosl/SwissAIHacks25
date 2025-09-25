# S3 and CloudFront Module

This module provisions the infrastructure needed to host the frontend static files using Amazon S3 and CloudFront.

## Resources Created

- Amazon S3 bucket configured for static website hosting
- CloudFront distribution to serve the S3 content
- S3 bucket policies for public access
- CloudFront origin access identity

## Outputs

- `bucket_name`: The name of the S3 bucket where static files are stored
- `bucket_website_endpoint`: The S3 website endpoint URL
- `cloudfront_distribution_id`: The ID of the CloudFront distribution
- `cloudfront_domain_name`: The domain name of the CloudFront distribution

## Usage

The frontend build process will generate static files that are uploaded to the S3 bucket during the deployment pipeline. CloudFront is used to distribute these files globally with low latency.