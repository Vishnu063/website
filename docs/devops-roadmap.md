# DevOps practice with Yoru

Start from a working website. Introduce one change or controlled failure at a time.

1. Linux and Git: serve `dist`, inspect permissions, create a branch and recover a reverted change.
2. Docker: build the image, inspect logs and health, stop/restart the container, change port mapping.
3. CI: inspect the GitHub Actions check/build/smoke stages. Break an asset path, observe failure, fix it.
4. EC2 and nginx: deploy with Compose, expose only required ports, add a domain and HTTPS.
5. CD: build immutable image tags, push to ECR, deploy an approved version; verify health and rollback.
6. Kubernetes: create Deployment, Service, probes, ConfigMap and resource requests; diagnose a wrong image tag.
7. Monitoring: collect nginx logs and availability signals; alert on failures and write a short incident report.

Current scope: static site, Docker configuration, health endpoints, CI definition. ECR, EC2, Jenkins, Kubernetes and monitoring are future labs, not configured integrations. Never commit AWS credentials or `.env` files.
