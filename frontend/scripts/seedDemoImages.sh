#!/bin/bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DEST="$ROOT/public/demo-images"

echo "Seeding local demo images into $DEST"
mkdir -p "$DEST"

seed_demo () {
  local serviceSlug="$1"
  local demoSlug="$2"
  local count="${3:-4}" # number of images per demo
  local folder="$DEST/$serviceSlug/$demoSlug"

  mkdir -p "$folder"
  echo "  -> $serviceSlug / $demoSlug ($count images)"

  for i in $(seq 1 "$count"); do
    local url="https://picsum.photos/seed/${serviceSlug}-${demoSlug}-${i}/1200/1200"
    local out="$folder/$i.jpg"
    if [[ ! -f "$out" ]]; then
      curl -sL "$url" -o "$out"
    fi
  done
}

########################################
# Social media management
########################################
SERVICE="social-media-management"
seed_demo "$SERVICE" "facebook-page-management"
seed_demo "$SERVICE" "instagram-page-management"
seed_demo "$SERVICE" "whatsapp-business-setup"
seed_demo "$SERVICE" "content-planning-scheduling"
seed_demo "$SERVICE" "post-design-captions"
seed_demo "$SERVICE" "social-media-posters-flyers"
seed_demo "$SERVICE" "audience-engagement"
seed_demo "$SERVICE" "page-optimization"
seed_demo "$SERVICE" "performance-analytics"
seed_demo "$SERVICE" "social-media-captions-copywriting"

########################################
# Digital marketing
########################################
SERVICE="digital-marketing"
seed_demo "$SERVICE" "facebook-ads"
seed_demo "$SERVICE" "google-ads"
seed_demo "$SERVICE" "lead-generation-campaigns"
seed_demo "$SERVICE" "marketing-strategy-planning"
seed_demo "$SERVICE" "conversion-optimization"
seed_demo "$SERVICE" "analytics-reporting"
seed_demo "$SERVICE" "search-engine-optimization-seo"
seed_demo "$SERVICE" "local-seo"
seed_demo "$SERVICE" "google-business-profile-setup"

########################################
# Graphic design & branding
########################################
SERVICE="graphic-design-branding"
seed_demo "$SERVICE" "logo-design"
seed_demo "$SERVICE" "brand-identity-design-colors-fonts-guidelines"
seed_demo "$SERVICE" "brand-guidelines"
seed_demo "$SERVICE" "brand-messaging-support"
seed_demo "$SERVICE" "social-media-graphics"
seed_demo "$SERVICE" "flyers-posters"
seed_demo "$SERVICE" "banners-signage"
seed_demo "$SERVICE" "business-cards"
seed_demo "$SERVICE" "brochures-company-profiles"
seed_demo "$SERVICE" "company-profiles-presentations"
seed_demo "$SERVICE" "image-editing-design"
seed_demo "$SERVICE" "branded-merchandise-design"

########################################
# Mobile apps
########################################
SERVICE="mobile-app-development"
seed_demo "$SERVICE" "android-app-development"
seed_demo "$SERVICE" "ios-app-development"
seed_demo "$SERVICE" "cross-platform-apps"
seed_demo "$SERVICE" "app-ui-ux-design"
seed_demo "$SERVICE" "app-updates-maintenance"
seed_demo "$SERVICE" "app-performance-optimization"

########################################
# Software
########################################
SERVICE="software-development"
seed_demo "$SERVICE" "custom-web-applications"
seed_demo "$SERVICE" "business-management-systems"
seed_demo "$SERVICE" "inventory-pos-systems"
seed_demo "$SERVICE" "school-management-systems"
seed_demo "$SERVICE" "ngo-management-data-reporting-systems"
seed_demo "$SERVICE" "booking-service-management-systems"
seed_demo "$SERVICE" "system-integrations-admin-panels"
seed_demo "$SERVICE" "custom-admin-dashboards-reporting-tools"

########################################
# Cloud hosting
########################################
SERVICE="cloud-hosting"
seed_demo "$SERVICE" "website-hosting-setup"
seed_demo "$SERVICE" "domain-registration-support"
seed_demo "$SERVICE" "cloud-storage-setup"
seed_demo "$SERVICE" "email-hosting-and-workspace-setup-google-workspace"
seed_demo "$SERVICE" "server-configuration"
seed_demo "$SERVICE" "data-backup-solutions"
seed_demo "$SERVICE" "basic-security-setup-backups-https-basic-hardening"

########################################
# Printing services
########################################
SERVICE="printing-services"
seed_demo "$SERVICE" "business-cards"
seed_demo "$SERVICE" "flyers"
seed_demo "$SERVICE" "posters"
seed_demo "$SERVICE" "banners-indoor-outdoor"
seed_demo "$SERVICE" "brochures"
seed_demo "$SERVICE" "stickers-labels"
seed_demo "$SERVICE" "branded-merchandise-t-shirts-mugs-caps"
seed_demo "$SERVICE" "event-promotional-materials"

echo "Done. Local demo images seeded."

