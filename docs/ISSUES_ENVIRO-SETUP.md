# Environment Setup Process Documentation

## Overview

This document tracks the systematic approach to improving development environment consistency across all contributors, with special attention to the workspace structure (client/server/shared) and inter-service communication reliability.

## Current Architecture

```
workspace/
├── client/          # Svelte frontend
│   └── package.json
├── server/          # Express backend
│   └── package.json
└── shared/          # Shared utilities
    └── package.json
```

### Future Considerations

1. **Dependency Management Evolution**

   - Monitor shared package growth
   - Consider monorepo managers if complexity increases:
     - Nx: Full-featured, good for large projects
     - Turborepo: Efficient build caching
     - pnpm: Fast, disk-space efficient
   - Benefits:
     - Consistent versioning
     - Simplified script management
     - Better dependency tracking

2. **Docker Optimization Strategy**

   - Implement multi-stage builds:
     - Build stage: Full development environment
     - Production stage: Minimal runtime environment
   - Layer caching strategy:
     - Cache package.json separately
     - Cache node_modules efficiently
     - Optimize rebuild times

3. **Network Architecture**
   - Inter-service Communication:
     ```
     [Frontend Container] <-> [API Gateway] <-> [Backend Container]
                                   ^
                                   |
                            [Database Container]
     ```
   - Consider:
     - API Gateway for request routing
     - Service discovery
     - Load balancing preparation
     - External service access patterns

## Goals

- Guarantee all contributors have identical development environments
- Ensure reliable communication between frontend and backend services
- Maintain separation of concerns while providing consistent tooling
- Preserve local package installations for proper module resolution

- Guarantee all contributors have identical development environments
- Reduce "works on my machine" issues
- Maintain environment stability through incremental changes
- Enable easy rollback of environment changes if needed

## Phase 1: Core Development Tools & Structure

### Directory Structure

```
.devcontainer/
├── config/
│   ├── .bashrc.dev
│   ├── .gitconfig
│   ├── init-scripts/
│   │   ├── 01-install-tools.sh
│   │   ├── 02-setup-db.sh
│   │   └── 03-setup-certs.sh
│   └── ssl/
├── Dockerfile
├── docker-compose.yml
└── devcontainer.json
```

### Changes Planned

0. **Pre-installation Steps**

- Backup existing package.json files from all three directories
- Document current working dependency versions
- Create installation verification scripts

1. **Dockerfile**

- Base image: mcr.microsoft.com/devcontainers/javascript-node:22-bullseye
- System packages (latest stable versions):
  - sqlite3
  - postgresql-client
  - curl
  - jq
  - git
- Global npm packages:
  - typescript@5.2.2
  - nodemon@3.0.1
  - concurrently@8.2.1
  - prettier@3.0.3
  - eslint@8.48.0

2. **docker-compose.yml**

- Services:
  - app: Development environment with proper networking
  - db: PostgreSQL 13.9
  - frontend-dev: Vite dev server (optional split service)
  - backend-dev: Nodemon server (optional split service)
- Volumes:
  - Individual node_modules for each workspace
  - postgres data persistence
  - git config sharing
- Networks:
  - frontend-network
  - backend-network
- Health checks:
  - Database connectivity
  - API endpoint availability
  - Frontend dev server status

### Testing Steps for Phase 1

1. Backup current working environment state
2. Implement Dockerfile changes
3. Test basic container build
4. Implement docker-compose changes
5. Test full environment startup
6. Verify all tools are accessible
7. Document any issues encountered

### Rollback Plan

- Keep copies of original configuration files
- Document exact changes made
- Test rollback procedure after each major change

## Next Phases (Pending Successful Phase 1)

### Phase 2: Initialize Scripts & Configuration

- Setup scripts for tools installation
- Database initialization
- Development certificates
- Shell environment configuration

### Phase 3: Development Environment Variables

- Standardize environment variable handling
- Setup secrets management
- Configure development/test/staging environments

### Phase 4: Git Hooks and Tooling

- Standardize Git configuration
- Setup commit hooks
- Configure branch policies

### Phase 5: Testing and Quality Assurance

- Setup testing framework
- Configure linting rules
- Setup CI integration

### Phase 6: Documentation and Maintenance

- Update README.md
- Document maintenance procedures
- Setup update processes

## Progress Tracking

### Phase 1 Status

1. **Backup & Documentation** (Day 1)

- [x] Create `.devcontainer/backups` directory
- [x] Copy all package.json files to backups with timestamps
- [x] Export and document all currently installed npm packages
- [x] Document current working environment variables
- [x] Create environment validation script

2. **Initial Container Setup** (Day 1-2)

- [x] Create basic Dockerfile without optimization
- [x] Test basic container build
- [x] Document build issues/fixes
- [x] Verify basic Node.js operation

3. **Development Environment** (Day 2-3)

- [x] Add development tools to Dockerfile
- [x] Create basic docker-compose.yml
- [x] Test PostgreSQL connection (Deferred - Using SQLite3 for v0.1)
- [ ] Verify node_modules mounting
- [ ] Test shared package resolution

4. **Service Communication** (Day 3-4)

- [ ] Implement basic health check endpoints
- [ ] Create network configuration
- [ ] Test frontend-to-backend communication
- [ ] Verify database connections
- [ ] Document connection issues/fixes

5. **Testing & Validation** (Day 4-5)

- [ ] Create environment test suite
- [ ] Test all service startups
- [ ] Verify development workflows
- [ ] Document any remaining issues
- [ ] Prepare rollback procedures

Each step should be committed separately with detailed commit messages. Expected completion: 5 working days.

### Issues Log

```
Date       | Change                  | Result    | Notes
-----------|------------------------|-----------|-------
2025-08-07 | Initial documentation | Planning  | Created setup plan
2025-08-07 | Phase 1 Planning      | Planning  | Detailed 5-day implementation schedule
2025-08-07 | Dockerfile Update     | Success   | Removed specific versions for apt packages to use stable versions
2025-08-07 | cSpell Config        | Success   | Added technical terms to custom dictionary
2025-08-07 | Module System Plan    | Planning  | Created ESM migration plan (see ESM_MIGRATION_PLAN.md)
2025-08-07 | Dev Tools Update     | Success   | Added Python, DB, and network debugging tools to Dockerfile
```

### Implementation Commands

```bash
# Day 1: Backup & Documentation
mkdir -p .devcontainer/backups/$(date +%Y%m%d)
cp client/package.json .devcontainer/backups/$(date +%Y%m%d)/client-package.json
cp server/package.json .devcontainer/backups/$(date +%Y%m%d)/server-package.json
cp shared/package.json .devcontainer/backups/$(date +%Y%m%d)/shared-package.json

# Package documentation
(cd client && npm list --json > ../.devcontainer/backups/$(date +%Y%m%d)/client-deps.json)
(cd server && npm list --json > ../.devcontainer/backups/$(date +%Y%m%d)/server-deps.json)
(cd shared && npm list --json > ../.devcontainer/backups/$(date +%Y%m%d)/shared-deps.json)

# Create validation script template
cat > .devcontainer/config/validate-env.sh << 'EOF'
#!/bin/bash
echo "Validating development environment..."
# Add validation checks here
EOF
chmod +x .devcontainer/config/validate-env.sh
```

## Contributors Notes

- Always test changes in a new branch
- Document any deviations from the plan
- Report issues immediately
- Update this document as changes are made
