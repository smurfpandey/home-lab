terraform {
  required_version = ">= 1.0.2"
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 2.0"
    }
  }

  backend "remote" {
    hostname     = "app.terraform.io"
    organization = "Smurfville"

    workspaces {
      name = "home-lab"
    }
  }
}

provider "cloudflare" {}
