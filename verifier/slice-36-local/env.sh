# Slice 36 stand-in = the Slice 33 stand-in (../slice-33-local → ../slice-32-local) with its own
# dir/ports, plus slice-36/sql/36-01 + 36-02 applied to THIS local Postgres only.
# Never the real project. Override any value from the environment.
HERE36="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
export S32_DIR=${S32_DIR:-/tmp/s36}
export S32_GATEWAY_PORT=${S32_GATEWAY_PORT:-54740}
export S32_PG_PORT=${S32_PG_PORT:-54741}
export S32_POSTGREST_PORT=${S32_POSTGREST_PORT:-54742}
export S32_GOTRUE_PORT=${S32_GOTRUE_PORT:-54743}
export S32_SMTP_PORT=${S32_SMTP_PORT:-54745}
export S32_PREVIEW_PORT=${S32_PREVIEW_PORT:-4200}
export S32_MAGIC_LINK_TEMPLATE=${S32_MAGIC_LINK_TEMPLATE:-$HERE36/../slice-33-local/magic-link.html}
export S32_OTP_LENGTH=${S32_OTP_LENGTH:-6}
export S32_OTP_EXP=${S32_OTP_EXP:-3600}
L32="$HERE36/../slice-32-local"
SQL36="$HERE36/../../slice-36/sql"
