#!/usr/bin/env bash
set -euo pipefail

repo_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
app_dir="$repo_dir/MPowered-Health"

if [[ ! -f "$app_dir/package.json" ]]; then
  echo "Could not find the Expo app at $app_dir" >&2
  exit 1
fi

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  if [[ "$(uname -s)" == "Darwin" ]] && command -v brew >/dev/null 2>&1; then
    echo "Node.js/npm are missing. Installing Node.js with Homebrew..."
    brew install node
  else
    echo "Node.js and npm are required. Install the current Node.js LTS release from https://nodejs.org/en/download, then rerun this script." >&2
    exit 1
  fi
fi

if ! command -v npx >/dev/null 2>&1; then
  echo "npx is missing from this npm installation. Update Node.js/npm and rerun this script." >&2
  exit 1
fi

cd "$app_dir"

if [[ ! -f .env ]] || ! grep -Eq '^EXPO_PUBLIC_SUPABASE_URL=.+$' .env || ! grep -Eq '^EXPO_PUBLIC_SUPABASE_ANON_KEY=.+$' .env; then
  echo "Supabase settings are missing from $app_dir/.env" >&2
  echo "Copy .env.example to .env, add the team's Supabase URL and publishable key, then rerun this script." >&2
  exit 1
fi

echo "Installing app dependencies..."
npm install

echo "Starting the Expo development server (clearing its cache)..."
npx expo start --clear
