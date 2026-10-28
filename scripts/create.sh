#!/usr/bin/env bash
# 创建项目，并把源码中的 bq 前缀换成项目名。
# 远程: curl -fsSL https://git.liangbaiqiang.com/bql/bq_nest/raw/branch/main/scripts/create.sh | bash -s -- shop
# 本地: bash scripts/create.sh local /path/to/shop
set -euo pipefail

HOST="https://git.liangbaiqiang.com"
OWNER="bql"
REPO="bq_nest"
REF="${BQ_REF:-main}"

usage() {
  echo "远程: curl -fsSL ${HOST}/${OWNER}/${REPO}/raw/branch/${REF}/scripts/create.sh | bash -s -- <项目名>" >&2
  echo "本地: bash scripts/create.sh local <目录>" >&2
  echo "项目名需为小写字母开头，只含小写字母、数字和连字符" >&2
}

require_name() {
  if [[ ! "$1" =~ ^[a-z][a-z0-9-]*$ ]]; then
    usage
    exit 1
  fi
}

require_node() {
  command -v node >/dev/null 2>&1 || {
    echo "需要 Node.js" >&2
    exit 1
  }
}

finish_project() {
  local name="$1"
  local dest="$2"
  node "$dest/scripts/apply-name.mjs" "$name" "$dest"
  rm -rf "$dest/scripts"
  cp "$dest/.env.example" "$dest/.env"
  git init -b main "$dest" >/dev/null
  (
    cd "$dest"
    npm install
    npx prisma generate
    npx prisma migrate deploy
  )
  echo "项目已创建: $dest"
  echo "bq 前缀已替换为 ${name}，例如包名 ${name}_nest"
  echo "已复制 .env，并生成 Prisma 客户端和数据库"
  echo "下一步: cd $dest && npm run start:dev"
}

create_remote() {
  local name="$1"
  require_name "$name"
  if [[ -e "$name" ]]; then
    echo "目录已存在: $name" >&2
    exit 1
  fi
  command -v curl >/dev/null 2>&1 || {
    echo "需要 curl" >&2
    exit 1
  }
  require_node

  local tmp archive url
  tmp="$(mktemp -d)"
  cleanup() { rm -rf "$tmp"; }
  trap cleanup EXIT

  archive="$tmp/src.tar.gz"
  url="${HOST}/${OWNER}/${REPO}/archive/${REF}.tar.gz"
  if ! curl -fsSL "$url" -o "$archive"; then
    echo "下载失败。请确认 ${OWNER}/${REPO} 上存在 ${REF}。" >&2
    exit 1
  fi
  if ! tar -tzf "$archive" >/dev/null 2>&1; then
    echo "下载到的不是源码包。服务器返回：" >&2
    head -c 500 "$archive" >&2 || true
    echo >&2
    exit 1
  fi

  mkdir -p "$tmp/src"
  tar -xzf "$archive" -C "$tmp/src"
  shopt -s nullglob
  local entries=("$tmp/src"/*)
  if [[ ${#entries[@]} -ne 1 || ! -d "${entries[0]}" ]]; then
    echo "压缩包结构异常" >&2
    exit 1
  fi

  mv "${entries[0]}" "$name"
  trap - EXIT
  cleanup
  finish_project "$name" "$name"
}

create_local() {
  local dest_arg="${1:-}"
  if [[ -z "$dest_arg" ]]; then
    usage
    exit 1
  fi
  if [[ -z "${BASH_SOURCE[0]:-}" || ! -f "${BASH_SOURCE[0]}" ]]; then
    echo "本地模式需要在已克隆的模板仓库里执行: bash scripts/create.sh local <目录>" >&2
    exit 1
  fi

  local source parent name dest
  source="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
  parent="$(dirname "$dest_arg")"
  if [[ ! -d "$parent" ]]; then
    echo "上级目录不存在: $parent" >&2
    exit 1
  fi
  name="$(basename "$dest_arg")"
  require_name "$name"
  dest="$(cd "$parent" && pwd)/$name"
  if [[ -e "$dest" ]]; then
    echo "目录已存在: $dest" >&2
    exit 1
  fi
  if [[ "$dest" == "$source" || "$dest" == "$source"/* ]]; then
    echo "目标目录不能放在模板仓库里面: $dest" >&2
    exit 1
  fi
  require_node

  mkdir -p "$dest"
  tar -C "$source" \
    --exclude .git \
    --exclude node_modules \
    --exclude dist \
    --exclude src/generated \
    --exclude coverage \
    --exclude '*.db' \
    --exclude .env \
    -cf - . | tar -C "$dest" -xf -
  finish_project "$name" "$dest"
}

if [[ "${1:-}" == "local" ]]; then
  create_local "${2:-}"
elif [[ -n "${1:-}" ]]; then
  create_remote "$1"
else
  usage
  exit 1
fi
