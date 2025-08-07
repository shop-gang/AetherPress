#!/bin/bash
# start-dev.sh: Start backend and frontend services, and then more.

# Colors for output
GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m" # No Color

# ─── Service URLs
BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

# ─── Ports
free_port() {
    local PORT=$1
    if lsof -i tcp:$PORT -sTCP:LISTEN -t >/dev/null; then
        echo -e "${RED}Killing process on port $PORT...${NC}"
        kill -9 $(lsof -i tcp:$PORT -sTCP:LISTEN -t)
    fi
}

# ─── Service Start Commands
start_backend() {
    (cd server && npm run dev) &
    BACKEND_PID=$!
}

start_frontend() {
    (cd client && npm run dev) &
    FRONTEND_PID=$!
}

# ─── Health Check Logic
health_check() {
    local url=$1
    if curl --silent --fail "$url" >/dev/null; then
        # If this is the backend URL, add stabilization delay on first success
        if [ "$url" = "$BACKEND_URL" ] && [ -z "$BACKEND_STABILIZED" ]; then
            echo -e "${GREEN}Backend is listening! Giving it a moment to stabilize...${NC}"
            sleep 10  # Same magic number as in start-app.sh
            export BACKEND_STABILIZED=1
            echo -e "${GREEN}Backend is ready!${NC}"
        fi
        return 0
    fi
    return 1
}

# ─── Watchdog Function
watch_process_with_health() {
    local name=$1
    local start_func=$2
    local pid_var=$3
    local url=$4

    while true; do
        eval "$start_func"
        eval "local pid=\$$pid_var"
        echo -e "${GREEN}[$name] Started with PID $pid.${NC}"

        local failure_count=0

        while kill -0 "$pid" >/dev/null 2>&1; do
            if health_check "$url"; then
                failure_count=0
            else
                failure_count=$((failure_count + 1))
                echo -e "${RED}[$name] Health check failed ($failure_count)...${NC}"
                if [ "$failure_count" -ge 5 ]; then
                    echo -e "${RED}[$name] Restarting due to failed health checks...${NC}"
                    kill -9 "$pid"
                    break
                fi
            fi
            sleep 5
        done
        echo -e "${RED}[$name] Process exited or was killed. Restarting...${NC}"
        sleep 2
    done
}

# ─── Run Startup Checks
free_port 3000
free_port 5173
(cd shared && npm install && npm run build)

# ─── Watch both services in parallel
watch_process_with_health "Backend" start_backend BACKEND_PID "$BACKEND_URL" &
watch_process_with_health "Frontend" start_frontend FRONTEND_PID "$FRONTEND_URL" &

wait
