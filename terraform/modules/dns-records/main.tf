data "cloudflare_zones" "smurfville_app" {
  filter {
    name = "smurfville.app"
  }
}

resource "cloudflare_record" "playday" {
  zone_id = data.cloudflare_zones.smurfville_app.zones[0].id
  name    = "playday"
  value   = var.do1_cname
  type    = "CNAME"

  ttl     = 1
  proxied = true
}
