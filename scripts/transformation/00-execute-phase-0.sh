#!/bin/bash

##############################################################################
# GHXSTSHIP Transformation Master Script
# Phase 0: Foundation (Weeks 1-2)
#
# This script orchestrates the complete Phase 0 transformation, executing
# all steps in the correct order with validation and rollback capabilities.
#
# Usage: ./scripts/transformation/00-execute-phase-0.sh
##############################################################################

set -e
set -u

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/../.." && pwd)"

# Log file
LOG_FILE="${PROJECT_ROOT}/transformation-$(date +%Y%m%d_%H%M%S).log"

##############################################################################
# Helper Functions
##############################################################################

log() {
    echo -e "${1}" | tee -a "$LOG_FILE"
}

log_step() {
    log "${CYAN}▶ ${1}${NC}"
}

log_success() {
    log "${GREEN}✅ ${1}${NC}"
}

log_error() {
    log "${RED}❌ ${1}${NC}"
}

log_warning() {
    log "${YELLOW}⚠️  ${1}${NC}"
}

check_prerequisites() {
    log_step "Checking prerequisites..."
    
    local missing=0
    
    # Check for required commands
    for cmd in git docker docker-compose pnpm node terraform; do
        if ! command -v $cmd &> /dev/null; then
            log_error "$cmd is not installed"
            missing=1
        else
            log_success "$cmd is installed ($(command -v $cmd))"
        fi
    done
    
    # Check Node version
    NODE_VERSION=$(node -v | cut -d'v' -f2)
    if [[ $(echo "$NODE_VERSION < 18" | bc) -eq 1 ]]; then
        log_error "Node.js version must be >= 18 (current: $NODE_VERSION)"
        missing=1
    else
        log_success "Node.js version $NODE_VERSION"
    fi
    
    # Check if in git repository
    if ! git rev-parse --git-dir > /dev/null 2>&1; then
        log_error "Not in a git repository"
        missing=1
    else
        log_success "Git repository detected"
    fi
    
    if [ $missing -eq 1 ]; then
        log_error "Prerequisites not met. Please install missing dependencies."
        exit 1
    fi
    
    log_success "All prerequisites met"
}

create_backup() {
    log_step "Creating backup..."
    
    local backup_dir="${PROJECT_ROOT}/backups/transformation-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$backup_dir"
    
    # Backup critical files
    cp -r packages "$backup_dir/" 2>/dev/null || true
    cp -r apps "$backup_dir/" 2>/dev/null || true
    cp package.json "$backup_dir/" 2>/dev/null || true
    cp pnpm-lock.yaml "$backup_dir/" 2>/dev/null || true
    
    log_success "Backup created at: $backup_dir"
    echo "$backup_dir" > .last-backup-location
}

confirm_execution() {
    log ""
    log "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
    log "${MAGENTA}║   GHXSTSHIP TRANSFORMATION - PHASE 0 EXECUTION PLAN      ║${NC}"
    log "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
    log ""
    log "${CYAN}This script will execute the following steps:${NC}"
    log ""
    log "  ${YELLOW}Step 1:${NC} Setup Infrastructure Directory Structure"
    log "  ${YELLOW}Step 2:${NC} Setup Docker Containerization"
    log "  ${YELLOW}Step 3:${NC} Extract Database Package"
    log ""
    log "${YELLOW}Estimated Duration:${NC} 10-15 minutes"
    log "${YELLOW}Changes:${NC} Directory structure, new files, package reorganization"
    log "${YELLOW}Backup:${NC} Automatic backup will be created"
    log ""
    log "${RED}⚠️  WARNING:${NC} This will modify your codebase structure"
    log ""
    
    read -p "$(echo -e ${CYAN}"Do you want to proceed? (yes/no): "${NC})" -r
    echo
    
    if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        log_warning "Transformation cancelled by user"
        exit 0
    fi
    
    log_success "User confirmed execution"
}

execute_step() {
    local step_num=$1
    local step_name=$2
    local script_name=$3
    
    log ""
    log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log "${BLUE}  STEP ${step_num}: ${step_name}${NC}"
    log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log ""
    
    local script_path="${SCRIPT_DIR}/${script_name}"
    
    if [ ! -f "$script_path" ]; then
        log_error "Script not found: $script_path"
        return 1
    fi
    
    chmod +x "$script_path"
    
    if bash "$script_path" 2>&1 | tee -a "$LOG_FILE"; then
        log_success "Step ${step_num} completed successfully"
        return 0
    else
        log_error "Step ${step_num} failed"
        return 1
    fi
}

validate_step() {
    local step_num=$1
    local validation_checks=$2
    
    log_step "Validating Step ${step_num}..."
    
    case $step_num in
        1)
            # Validate infrastructure directory
            if [ -d "infrastructure/terraform" ] && [ -d "infrastructure/docker" ]; then
                log_success "Infrastructure directories created"
                return 0
            fi
            ;;
        2)
            # Validate Docker files
            if [ -f "docker-compose.yml" ] && [ -f "infrastructure/docker/Dockerfile.web" ]; then
                log_success "Docker configuration created"
                return 0
            fi
            ;;
        3)
            # Validate database package
            if [ -d "packages/database" ] && [ -f "packages/database/package.json" ]; then
                log_success "Database package extracted"
                return 0
            fi
            ;;
    esac
    
    log_error "Step ${step_num} validation failed"
    return 1
}

##############################################################################
# Main Execution
##############################################################################

main() {
    cd "$PROJECT_ROOT"
    
    # Print header
    clear
    log "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
    log "${MAGENTA}║                                                            ║${NC}"
    log "${MAGENTA}║        GHXSTSHIP 2030 TRANSFORMATION - PHASE 0            ║${NC}"
    log "${MAGENTA}║                                                            ║${NC}"
    log "${MAGENTA}║        Foundation Sprint (Weeks 1-2)                      ║${NC}"
    log "${MAGENTA}║                                                            ║${NC}"
    log "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
    log ""
    log "${CYAN}Date:${NC} $(date)"
    log "${CYAN}Log:${NC} $LOG_FILE"
    log ""
    
    # Check prerequisites
    check_prerequisites
    
    # Confirm execution
    confirm_execution
    
    # Create backup
    create_backup
    
    # Track success
    local failed=0
    
    # Execute steps
    log ""
    log "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    log "${YELLOW}  STARTING TRANSFORMATION EXECUTION${NC}"
    log "${YELLOW}═══════════════════════════════════════════════════════════${NC}"
    
    # Step 1: Infrastructure Setup
    if execute_step 1 "Setup Infrastructure Directory" "01-setup-infrastructure.sh"; then
        validate_step 1 || failed=1
    else
        failed=1
    fi
    
    # Step 2: Docker Setup
    if [ $failed -eq 0 ]; then
        if execute_step 2 "Setup Docker Containerization" "02-setup-docker.sh"; then
            validate_step 2 || failed=1
        else
            failed=1
        fi
    fi
    
    # Step 3: Database Extraction
    if [ $failed -eq 0 ]; then
        if execute_step 3 "Extract Database Package" "03-extract-database-package.sh"; then
            validate_step 3 || failed=1
        else
            failed=1
        fi
    fi
    
    # Summary
    log ""
    log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if [ $failed -eq 0 ]; then
        log "${GREEN}╔════════════════════════════════════════════════════════════╗${NC}"
        log "${GREEN}║                                                            ║${NC}"
        log "${GREEN}║              ✅ PHASE 0 COMPLETED SUCCESSFULLY              ║${NC}"
        log "${GREEN}║                                                            ║${NC}"
        log "${GREEN}╚════════════════════════════════════════════════════════════╝${NC}"
        log ""
        log "${GREEN}All transformation steps completed successfully!${NC}"
        log ""
        log "${CYAN}Created:${NC}"
        log "  • Infrastructure directory with Terraform and Docker configurations"
        log "  • Docker containerization setup with multi-stage builds"
        log "  • Dedicated database package extracted from infrastructure"
        log "  • Helper scripts and comprehensive documentation"
        log ""
        log "${YELLOW}Next Steps:${NC}"
        log "  1. Review: infrastructure/README.md"
        log "  2. Review: packages/database/MIGRATION_NOTES.md"
        log "  3. Configure: Copy .env.example to .env.local and set variables"
        log "  4. Test Docker: docker-compose build && docker-compose up -d"
        log "  5. Test Terraform: cd infrastructure/terraform/environments/dev && terraform init"
        log "  6. Update imports to use @ghxstship/database"
        log "  7. Run: pnpm --filter @ghxstship/database generate"
        log ""
        log "${CYAN}Documentation:${NC}"
        log "  • Audit: docs/architecture/2030_ENTERPRISE_AUDIT.md"
        log "  • Plan: docs/architecture/TRANSFORMATION_ORCHESTRATION_PLAN.md"
        log "  • Log: $LOG_FILE"
        log ""
        log "${GREEN}Phase 0 Duration:${NC} 2 weeks estimated"
        log "${GREEN}Next Phase:${NC} Phase 1 - Infrastructure Layer (4 weeks)"
        log ""
        
        # Create completion marker
        cat > .transformation-phase-0-complete <<EOF
Phase 0 Completed: $(date)
Log File: $LOG_FILE
Status: SUCCESS

Steps Completed:
1. Infrastructure Directory Setup
2. Docker Containerization
3. Database Package Extraction

Next: Begin Phase 1 - Infrastructure Layer
EOF
        
    else
        log "${RED}╔════════════════════════════════════════════════════════════╗${NC}"
        log "${RED}║                                                            ║${NC}"
        log "${RED}║              ❌ PHASE 0 FAILED                              ║${NC}"
        log "${RED}║                                                            ║${NC}"
        log "${RED}╚════════════════════════════════════════════════════════════╝${NC}"
        log ""
        log "${RED}Transformation encountered errors. Please check the log file:${NC}"
        log "  $LOG_FILE"
        log ""
        log "${YELLOW}Rollback Steps:${NC}"
        log "  1. Review error messages in log file"
        log "  2. Restore from backup if needed: $(cat .last-backup-location 2>/dev/null || echo 'No backup found')"
        log "  3. Fix issues and re-run: ./scripts/transformation/00-execute-phase-0.sh"
        log ""
        
        exit 1
    fi
    
    log "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    log ""
}

# Trap errors
trap 'log_error "Script failed at line $LINENO"' ERR

# Execute main
main "$@"

exit 0
