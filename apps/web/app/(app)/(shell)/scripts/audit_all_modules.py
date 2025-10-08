#!/usr/bin/env python3
"""
GHXSTSHIP Module Comprehensive Audit Script
Audits all modules for complete full-stack implementation
"""

import os
import json
from pathlib import Path
from typing import Dict, List, Set
import re

MODULES_DIR = Path("/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app/(app)/(shell)")
API_DIR = Path("/Users/julianclarkson/Library/Mobile Documents/com~apple~CloudDocs/Dragonfly26/ATLVS/apps/web/app/api/v1")

# Expected data views for a complete module
EXPECTED_VIEWS = {
    'ListView.tsx', 'GridView.tsx', 'KanbanView.tsx', 'CalendarView.tsx',
    'TimelineView.tsx', 'DashboardView.tsx', 'BoardView.tsx', 'GanttView.tsx',
    'TableView.tsx', 'FormView.tsx', 'CardView.tsx', 'ChartView.tsx',
    'GalleryView.tsx', 'ViewSwitcher.tsx'
}

# Expected drawers for a complete module
EXPECTED_DRAWERS = {
    'CreateDrawer.tsx', 'EditDrawer.tsx', 'DetailDrawer.tsx', 'ViewDrawer.tsx',
    'DeleteDrawer.tsx', 'BulkDrawer.tsx', 'ImportDrawer.tsx', 'ExportDrawer.tsx',
    'HistoryDrawer.tsx'
}

# Directories to skip
SKIP_DIRS = {'scripts', 'design-system', 'validation-reports', 'lib', 'components', 'hooks', 'utils', 'create', '[id]'}

def find_tsx_files(directory: Path, pattern: str = "*.tsx") -> Set[str]:
    """Find all TSX files matching pattern in directory"""
    if not directory.exists():
        return set()
    try:
        return {f.name for f in directory.glob(pattern) if f.is_file()}
    except:
        return set()

def has_supabase_integration(file_path: Path) -> bool:
    """Check if file contains Supabase integration"""
    try:
        content = file_path.read_text()
        patterns = [
            r'createBrowserClient',
            r'createClient',
            r'from.*supabase',
            r'\.from\([\'"]',
            r'supabase\.'
        ]
        return any(re.search(pattern, content) for pattern in patterns)
    except:
        return False

def count_api_routes(module_name: str) -> int:
    """Count API route files for a module"""
    api_path = API_DIR / module_name
    if not api_path.exists():
        return 0
    count = 0
    for root, _, files in os.walk(api_path):
        count += sum(1 for f in files if f == 'route.ts')
    return count

def find_submodules(module_path: Path) -> List[str]:
    """Find submodule directories (exclude utility dirs)"""
    if not module_path.exists():
        return []
    submodules = []
    for item in module_path.iterdir():
        if item.is_dir() and item.name not in SKIP_DIRS and not item.name.startswith('.'):
            submodules.append(item.name)
    return sorted(submodules)

def audit_module(module_name: str) -> Dict:
    """Comprehensive audit of a single module"""
    module_path = MODULES_DIR / module_name
    
    result = {
        'name': module_name,
        'exists': module_path.exists(),
        'main_client': None,
        'views': [],
        'views_count': 0,
        'expected_views_coverage': 0,
        'drawers': [],
        'drawers_count': 0,
        'expected_drawers_coverage': 0,
        'service_files': [],
        'has_service_layer': False,
        'api_routes_count': 0,
        'has_supabase': False,
        'submodules': [],
        'submodules_count': 0,
        'status': 'UNKNOWN'
    }
    
    if not module_path.exists():
        result['status'] = 'NOT_FOUND'
        return result
    
    # Check for main client
    possible_clients = [
        f"{module_name.capitalize()}Client.tsx",
        f"{module_name.title().replace('_', '')}Client.tsx",
        f"{module_name.upper()}Client.tsx"
    ]
    
    for client_name in possible_clients:
        client_path = module_path / client_name
        if client_path.exists():
            result['main_client'] = client_name
            result['has_supabase'] = has_supabase_integration(client_path)
            break
    
    # Check views
    views_dir = module_path / 'views'
    if views_dir.exists():
        result['views'] = sorted(list(find_tsx_files(views_dir)))
        result['views_count'] = len(result['views'])
        # Calculate coverage of expected views
        found_views = set(result['views'])
        result['expected_views_coverage'] = len(found_views & EXPECTED_VIEWS)
    
    # Check drawers
    drawers_dir = module_path / 'drawers'
    if drawers_dir.exists():
        result['drawers'] = sorted(list(find_tsx_files(drawers_dir)))
        result['drawers_count'] = len(result['drawers'])
        # Calculate coverage of expected drawers
        found_drawers = set(result['drawers'])
        result['expected_drawers_coverage'] = len(found_drawers & EXPECTED_DRAWERS)
    
    # Check service layer
    lib_dir = module_path / 'lib'
    if lib_dir.exists():
        service_files = list(find_tsx_files(lib_dir, "*service*.ts"))
        result['service_files'] = sorted(service_files)
        result['has_service_layer'] = len(service_files) > 0
    
    # Check API routes
    result['api_routes_count'] = count_api_routes(module_name)
    
    # Check submodules
    result['submodules'] = find_submodules(module_path)
    result['submodules_count'] = len(result['submodules'])
    
    # Determine status
    if result['main_client'] and result['views_count'] >= 3 and result['drawers_count'] >= 2:
        result['status'] = 'GOOD'
    elif result['main_client'] and (result['views_count'] > 0 or result['drawers_count'] > 0):
        result['status'] = 'PARTIAL'
    elif result['main_client']:
        result['status'] = 'MINIMAL'
    else:
        result['status'] = 'INCOMPLETE'
    
    return result

def generate_report(results: List[Dict]) -> str:
    """Generate markdown report from audit results"""
    lines = [
        "# GHXSTSHIP MODULE COMPREHENSIVE AUDIT REPORT",
        "",
        "**Generated**: 2025-01-07",
        "**Purpose**: Full-stack validation of all modules for data views, drawers, and Supabase integration",
        "",
        "---",
        "",
        "## EXECUTIVE SUMMARY",
        ""
    ]
    
    # Calculate summary statistics
    total = len(results)
    good = sum(1 for r in results if r['status'] == 'GOOD')
    partial = sum(1 for r in results if r['status'] == 'PARTIAL')
    minimal = sum(1 for r in results if r['status'] == 'MINIMAL')
    incomplete = sum(1 for r in results if r['status'] == 'INCOMPLETE')
    
    with_views = sum(1 for r in results if r['views_count'] > 0)
    with_drawers = sum(1 for r in results if r['drawers_count'] > 0)
    with_service = sum(1 for r in results if r['has_service_layer'])
    with_api = sum(1 for r in results if r['api_routes_count'] > 0)
    with_supabase = sum(1 for r in results if r['has_supabase'])
    
    lines.extend([
        f"**Total Modules**: {total}",
        "",
        "### Status Distribution",
        f"- ✅ **GOOD** (Full implementation): {good} ({good/total*100:.1f}%)",
        f"- 🟡 **PARTIAL** (Partial implementation): {partial} ({partial/total*100:.1f}%)",
        f"- 🟠 **MINIMAL** (Basic structure only): {minimal} ({minimal/total*100:.1f}%)",
        f"- ❌ **INCOMPLETE** (Missing core components): {incomplete} ({incomplete/total*100:.1f}%)",
        "",
        "### Feature Coverage",
        f"- **Modules with Views**: {with_views}/{total} ({with_views/total*100:.1f}%)",
        f"- **Modules with Drawers**: {with_drawers}/{total} ({with_drawers/total*100:.1f}%)",
        f"- **Modules with Service Layer**: {with_service}/{total} ({with_service/total*100:.1f}%)",
        f"- **Modules with API Routes**: {with_api}/{total} ({with_api/total*100:.1f}%)",
        f"- **Modules with Supabase**: {with_supabase}/{total} ({with_supabase/total*100:.1f}%)",
        "",
        "---",
        "",
        "## DETAILED MODULE AUDIT",
        ""
    ])
    
    # Detailed module reports
    for result in sorted(results, key=lambda x: x['name']):
        status_emoji = {
            'GOOD': '✅',
            'PARTIAL': '🟡',
            'MINIMAL': '🟠',
            'INCOMPLETE': '❌',
            'NOT_FOUND': '🚫'
        }.get(result['status'], '❓')
        
        lines.extend([
            f"### {status_emoji} {result['name'].upper()}",
            "",
            f"**Status**: {result['status']}",
            ""
        ])
        
        # Main client
        if result['main_client']:
            supabase_status = "✅ Yes" if result['has_supabase'] else "❌ No"
            lines.append(f"- **Main Client**: {result['main_client']} | Supabase: {supabase_status}")
        else:
            lines.append(f"- **Main Client**: ❌ NOT FOUND")
        
        # Views
        if result['views_count'] > 0:
            lines.append(f"- **Data Views**: {result['views_count']} implemented ({result['expected_views_coverage']}/{len(EXPECTED_VIEWS)} expected)")
            lines.append(f"  - {', '.join(result['views'][:5])}{'...' if len(result['views']) > 5 else ''}")
        else:
            lines.append(f"- **Data Views**: ❌ None found")
        
        # Drawers
        if result['drawers_count'] > 0:
            lines.append(f"- **Drawers**: {result['drawers_count']} implemented ({result['expected_drawers_coverage']}/{len(EXPECTED_DRAWERS)} expected)")
            lines.append(f"  - {', '.join(result['drawers'][:5])}{'...' if len(result['drawers']) > 5 else ''}")
        else:
            lines.append(f"- **Drawers**: ❌ None found")
        
        # Service layer
        if result['has_service_layer']:
            lines.append(f"- **Service Layer**: ✅ {', '.join(result['service_files'])}")
        else:
            lines.append(f"- **Service Layer**: ❌ Not found")
        
        # API routes
        if result['api_routes_count'] > 0:
            lines.append(f"- **API Routes**: ✅ {result['api_routes_count']} endpoints")
        else:
            lines.append(f"- **API Routes**: ❌ None found")
        
        # Submodules
        if result['submodules_count'] > 0:
            lines.append(f"- **Submodules**: {result['submodules_count']} ({', '.join(result['submodules'][:3])}{'...' if len(result['submodules']) > 3 else ''})")
        
        lines.append("")
    
    lines.extend([
        "---",
        "",
        "## RECOMMENDATIONS",
        "",
        "### Critical Actions Required",
        "",
        "1. **Modules with INCOMPLETE status**: Implement missing core components",
        "2. **Modules without Supabase**: Add live data integration",
        "3. **Modules with minimal views**: Add missing data view types",
        "4. **Modules without drawers**: Implement CRUD drawers",
        "5. **Modules without API**: Create backend endpoints",
        "",
        "### Next Steps",
        "",
        "1. **Phase 1**: Fix INCOMPLETE modules (highest priority)",
        "2. **Phase 2**: Upgrade MINIMAL modules to PARTIAL",
        "3. **Phase 3**: Complete PARTIAL modules to GOOD status",
        "4. **Phase 4**: Enhance GOOD modules with advanced features",
        "",
        "---",
        "",
        "*End of Report*"
    ])
    
    return "\n".join(lines)

def main():
    """Main audit function"""
    print("🔍 Starting comprehensive module audit...")
    print(f"📂 Scanning: {MODULES_DIR}")
    print("")
    
    # Get all module directories
    modules = []
    for item in MODULES_DIR.iterdir():
        if item.is_dir() and item.name not in SKIP_DIRS and not item.name.startswith('.'):
            modules.append(item.name)
    
    modules.sort()
    print(f"Found {len(modules)} modules to audit")
    print("")
    
    # Audit each module
    results = []
    for module_name in modules:
        print(f"Auditing: {module_name}")
        result = audit_module(module_name)
        results.append(result)
    
    # Generate report
    print("")
    print("📝 Generating report...")
    report = generate_report(results)
    
    # Save report
    output_file = MODULES_DIR / "COMPREHENSIVE_AUDIT_REPORT.md"
    output_file.write_text(report)
    
    print(f"✅ Audit complete!")
    print(f"📄 Report saved to: {output_file}")
    
    # Also save JSON for programmatic access
    json_file = MODULES_DIR / "audit_results.json"
    json_file.write_text(json.dumps(results, indent=2))
    print(f"📊 JSON data saved to: {json_file}")

if __name__ == "__main__":
    main()
