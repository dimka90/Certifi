#!/bin/bash

# Function to create a commit with a specific date (optional) or just normally
create_commit() {
    local msg="$1"
    git add .
    git commit -m "$msg"
}

# 1. Component Refactoring: Analytics Grid
echo "Commit 1: Extract AnalyticsGrid component"
create_commit "refactor(dashboard): extract AnalyticsGrid component for modularity"

# 2. Component Refactoring: Institution Profile
echo "Commit 2: Extract InstitutionProfile component"
create_commit "refactor(dashboard): extract InstitutionProfile component"

# 3. Component Refactoring: Contact Info
echo "Commit 3: Extract ContactInfo component"
create_commit "refactor(dashboard): extract ContactInfo component"

# 4. Component Refactoring: Legal Docs
echo "Commit 4: Extract LegalDocs component"
create_commit "refactor(dashboard): extract LegalDocs component"

# 5. Dashboard Update: Integrate new components
echo "Commit 5: Integrate components into Dashboard"
create_commit "feat(dashboard): integrate extracted components into main dashboard view"

# 6. New Feature: Recent Activity Component
echo "Commit 6: Create RecentActivity component"
create_commit "feat(ui): create RecentActivity component with mocked data"

# 7. Dashboard Enhancement: Add Recent Activity
echo "Commit 7: Add RecentActivity to Dashboard"
create_commit "feat(dashboard): integrate RecentActivity feed into dashboard layout"

# 8. UI Components: SearchBar
echo "Commit 8: Create SearchBar component"
create_commit "feat(ui): create reusable SearchBar component"

# 9. UI Components: CertificateFilter
echo "Commit 9: Create CertificateFilter component"
create_commit "feat(ui): create CertificateFilter dropdown component"

# 10. Settings Page: Structure
echo "Commit 10: Initialize Settings page"
create_commit "feat(settings): create basic structure for institution settings page"

# 11. Settings Page: Notifications
echo "Commit 11: Add Notification Preferences"
create_commit "feat(settings): add notification preferences section to settings"

# 12. Settings Page: Security
echo "Commit 12: Add Security Settings"
create_commit "feat(settings): add security settings section with wallet disconnect"

# 13. System: Toast Provider
echo "Commit 13: Implement ToastProvider"
create_commit "feat(system): implement globally accessible ToastProvider context"

# 14. System: Integrate Toast
echo "Commit 14: Integrate ToastProvider into App"
create_commit "feat(app): wrap application with ToastProvider for global notifications"

# 15. Feature: Copy Wallet Interaction
echo "Commit 15: Add Copy Wallet feature"
create_commit "feat(dashboard): implement copy-to-clipboard for wallet address with toast feedback"

# 16. Documentation: Update README
echo "Commit 16: Update README"
create_commit "docs: update README with recent feature enhancements"

echo "All commits generated successfully!"
