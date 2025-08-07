#!/bin/bash
# start-app.sh: Rearchitected controlled startup

GREEN="\033[0;32m"
RED="\033[0;31m"
NC="\033[0m"

BACKEND_URL="http://localhost:3000"
FRONTEND_URL="http://localhost:5173"

# ─── Prerequisite Check
if ! command -v lsof &> /dev/null; then
    echo -e "${RED}Error: 'lsof' command is not found. Please install it to continue.${NC}"
    exit 1
fi

# ─── Kill Port Occupants {Corrected kill_port function}
kill_port() {
    local port=$1
    local pid=$(lsof -ti tcp:$port)

    if [ -n "$pid" ]; then
        echo -e "${RED}Process with PID $pid found on port $port. Terminating...${NC}"
        kill -9 $pid
        # Wait until the port is confirmed to be free
        local attempts=0
        local max_attempts=10
        while lsof -ti tcp:$port &> /dev/null; do
            ((attempts++))
            if [[ $attempts -ge $max_attempts ]]; then
                echo -e "${RED}Failed to free port $port after $max_attempts attempts. Aborting.${NC}"
                exit 1
            fi
            sleep 1
        done
        echo "Process on port $port terminated and port is now clear."
    else
        echo -e "${GREEN}Port $port is already clear.${NC}"
    fi
}

# ─── Wait for Health Gate (Backend only)
await_health() {
    local url=$1
    local max_attempts=25
    local attempts=0

    echo -e "${GREEN}Awaiting health check at ${url}/health...${NC}"
    while true; do
        response=$(curl -s "${url}/health")
        
        if ! [[ "$response" =~ ^\{.*\}$ ]]; then
            echo -e "${RED}Invalid response format. Got: $response${NC}"
            ((attempts++))
            if [[ $attempts -ge $max_attempts ]]; then
                echo -e "${RED}Health check failed: Invalid response format${NC}"
                exit 1
            fi
            sleep 2
            continue
        fi

        http_code=$(curl -s -o /dev/null -w "%{http_code}" "${url}/health")
        if [[ "$http_code" != "200" ]]; then
            echo -e "${RED}Backend returned HTTP ${http_code}${NC}"
            ((attempts++))
            if [[ $attempts -ge $max_attempts ]]; then
                echo -e "${RED}Health check failed: Server returning ${http_code}${NC}"
                exit 1
            fi
            sleep 2
            continue
        fi

        status=$(echo "$response" | grep -o '"status":"[^"]*"' | cut -d':' -f2 | tr -d '"')
        db_status=$(echo "$response" | grep -o '"db":"[^"]*"' | cut -d':' -f2 | tr -d '"')
        puppeteer_status=$(echo "$response" | grep -o '"puppeteer":"[^"]*"' | cut -d':' -f2 | tr -d '"')

        echo -e "${RED}Health check status [$((attempts + 1))/${max_attempts}] - Status: \"$status\", DB: \"$db_status\", Puppeteer: \"$puppeteer_status\"${NC}"

        if [[ "$status" == "ok" && "$db_status" == "sqlite3" && "$puppeteer_status" == "ok" ]]; then
            echo -e "${GREEN}Health check passed: All systems ready${NC}"
            break
        fi

        ((attempts++))
        if [[ $attempts -ge $max_attempts ]]; then
            echo -e "${RED}Health check timeout at $url. Aborting.${NC}"
            exit 1
        fi
        sleep 2
    done
}

# ─── Start Services
start_backend() {
    echo -e "${GREEN}→ Starting backend...${NC}"
    # Start nodemon in the background and pipe its output to a log file.
    # We remove the tee command to simplify the process.
    (cd server && DEBUG=* npm run dev > /tmp/backend.log 2>&1) &
    BACKEND_PID=$!
    
    # We now have to wait for the backend to start up before checking its health.
    # A simple sleep is not enough, as we saw from the logs.
    # The await_health function is still necessary and should be called after a brief pause.
    echo "Backend started with PID: $BACKEND_PID. Waiting for startup..."
    sleep 5 # Give nodemon time to start the child process
    
    # Check if the process is still running after a moment
    if ! ps -p $BACKEND_PID > /dev/null; then
        echo -e "${RED}Backend process with PID $BACKEND_PID failed to start. Check /tmp/backend.log.${NC}"
        cat /tmp/backend.log
        exit 1
    fi
}

start_frontend() {
    echo -e "${GREEN}→ Starting frontend...${NC}"
    (cd client && npm run dev) &
    FRONTEND_PID=$!
    
    # Wait for Vite to be ready
    local attempts=0
    local max_attempts=10
    while ! curl -s http://localhost:5173 > /dev/null; do
        ((attempts++))
        if [[ $attempts -ge $max_attempts ]]; then
            echo -e "${RED}Frontend failed to start after $max_attempts attempts${NC}"
            exit 1
        fi
        echo "Waiting for frontend to be ready... ($attempts/$max_attempts)"
        sleep 2
    done
    echo -e "${GREEN}Frontend is ready${NC}"
}

# --- Init Workflow ---
kill_port 3000
kill_port 5173

# --- New: Check ports again after a brief pause to be absolutely sure ---
echo "Verifying ports are clear..."
if lsof -ti tcp:3000 &> /dev/null || lsof -ti tcp:5173 &> /dev/null; then
    echo -e "${RED}Ports are still occupied. Manual intervention required.${NC}"
    exit 1
fi

echo -e "${GREEN}🚧 Building shared package...${NC}"
(cd shared && npm install && npm run build) || {
    echo -e "${RED}Failed to install/build shared package${NC}"
    exit 1
}

echo -e "${GREEN}→ Installing backend dependencies...${NC}"
(cd server && npm install) || {
    echo -e "${RED}Failed to install backend dependencies${NC}"
    exit 1
}

echo -e "${GREEN}→ Installing frontend dependencies...${NC}"
(cd client && npm install) || {
    echo -e "${RED}Failed to install frontend dependencies${NC}"
    exit 1
}
echo -e "${GREEN}✅ All dependencies installed and packages built successfully.${NC}"

# ─── Launch and Enforce Staging
start_backend
await_health "$BACKEND_URL"

start_frontend

echo -e "${GREEN}✅ All services are up and healthy.${NC}"
wait