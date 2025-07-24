
# WhatUp Application

This repository contains the backend services for the WhatUp application.

## Development Setup with Docker Compose

The `docker-compose.dev.yaml` file defines the services required for local development, including a MinIO S3-compatible storage instance.

### MinIO Configuration

The `minio` service runs a MinIO server, providing S3-compatible object storage. It exposes API on port `9000` and a web UI on port `9001`.
The `minio-setup` service is a one-time container that configures the MinIO instance. It creates a bucket named `whatup` and applies a policy defined in `minio/policy.json`.

### MinIO Policy (`minio/policy.json`)

The current policy for the `whatup` bucket grants public read-only access to all objects. Any user can download files from the bucket, but uploading and deleting objects is not permitted.

**Policy Details:**
- **Effect:** Allow
- **Principal:** All users (`"AWS": "*"`).
- **Action:** Only `s3:GetObject` (read/download).
- **Resource:** All objects in the `whatup` bucket (`arn:aws:s3:::whatup/*`).

**Example Policy:**
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": {
        "AWS": "*"
      },
      "Action": [
        "s3:GetObject"
      ],
      "Resource": [
        "arn:aws:s3:::whatup/*"
      ]
    }
  ]
}
```

**Implications:**
- Anyone can read/download files from the bucket.
- Uploading and deleting objects is restricted (not allowed by this policy).
- Suitable for development or public file sharing scenarios.
