#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

cleanup() {
  if [[ -n "${SERVER_PID:-}" ]] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
  fi
  if [[ -n "${CLIENT_PID:-}" ]] && kill -0 "${CLIENT_PID}" 2>/dev/null; then
    kill "${CLIENT_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT INT TERM

echo "Starting DevBoard server..."
(
  cd "${ROOT_DIR}/server"
  npm run dev
) &
SERVER_PID=$!

echo "Starting DevBoard client..."
(
  cd "${ROOT_DIR}/client"
  npm run dev
) &
CLIENT_PID=$!

echo "Server PID: ${SERVER_PID}"
echo "Client PID: ${CLIENT_PID}"
echo "Press Ctrl+C to stop both."

wait -n "${SERVER_PID}" "${CLIENT_PID}"
echo "One process exited. Stopping remaining process..."
