#!/bin/sh
# run-server-tests.sh: Ensure DB tables exist, then run all backend (server/) tests from anywhere in the project
SCRIPT_DIR="$(dirname "$0")"
cd "$SCRIPT_DIR/../server" && node check-and-migrate.js "$@"
