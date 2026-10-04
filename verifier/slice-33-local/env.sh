# Slice 33 stand-in = the Slice 32 stand-in (../slice-32-local) with its own dir/ports and the
# login mail from slice-33/content/setup-christoffer.md 12c ({{ .Token }}, no link).
# Override any of these from the environment (see ../slice-32-local/README.md).
HERE33="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export S32_DIR=${S32_DIR:-/tmp/s33}
export S32_GATEWAY_PORT=${S32_GATEWAY_PORT:-54640}
export S32_PG_PORT=${S32_PG_PORT:-54641}
export S32_POSTGREST_PORT=${S32_POSTGREST_PORT:-54642}
export S32_GOTRUE_PORT=${S32_GOTRUE_PORT:-54643}
export S32_SMTP_PORT=${S32_SMTP_PORT:-54645}
export S32_PREVIEW_PORT=${S32_PREVIEW_PORT:-4196}     # bank build preview (S33_ON_URL)
export S32_MAGIC_LINK_TEMPLATE=${S32_MAGIC_LINK_TEMPLATE:-$HERE33/magic-link.html}
export S32_OTP_LENGTH=${S32_OTP_LENGTH:-6}
export S32_OTP_EXP=${S32_OTP_EXP:-3600}
L32="$HERE33/../slice-32-local"
