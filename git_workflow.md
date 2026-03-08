
# Signals Master — Professional Git Workflow

## 1. Create an Issue First

Every change starts with an issue.

Example issue titles:

```
#42 Add exam start screen
#43 Implement signal answer validation
#44 Fix timer reset bug
```

Issue types you’ll typically have:

* **Feature**
* **Bug**
* **Refactor**
* **Documentation**
* **Chore**

---

# 2. Create a Branch From the Issue

Create the branch **from `main`**.

Branch naming format:

```
<type>/<issue-number>-<short-description>
```

Examples:

```
feat/42-exam-start-screen
fix/44-timer-reset
refactor/51-signal-validation-service
docs/60-readme-update
chore/61-update-dependencies
```

Create it locally:

```bash
git checkout main
git pull origin main
git checkout -b feat/42-exam-start-screen
```

---

# 3. Work Normally (Small Commits)

Use **Conventional Commit style**. This keeps history readable and works well with releases.

Format:

```
type(scope): short description
```

Common types:

```
feat
fix
refactor
docs
test
chore
style
ci
```

Examples:

```
feat(exam): add exam start screen
feat(exam): implement rules acknowledgement checkbox
fix(timer): prevent timer reset on refresh
refactor(validation): move answer validation to service
docs(readme): add architecture diagram
test(exam): add exam submission unit tests
```

Commit normally:

```bash
git add .
git commit -m "feat(exam): add exam start screen"
```

Push progress anytime:

```bash
git push origin feat/42-exam-start-screen
```

---

# 4. Open a Pull Request

When the feature is done:

Open PR:

```
feat/42-exam-start-screen → main
```

PR Title:

```
feat: Exam Start & Rules Acknowledgement
```

PR Description example:

```
Closes #42

## Summary
Adds the exam start screen and rules acknowledgement.

## Changes
- Added start exam page
- Implemented rules acknowledgement checkbox
- Prevent exam start unless rules accepted

## Screenshots
(Add UI screenshot)

## Testing
- Verified exam cannot start without acknowledgement
- Verified timer starts correctly
```

---

# 5. CI Runs

Typical CI checks on PR:

* security scan
* unit tests
* component tests
* lint
* build

Once all checks pass → **merge PR**.

---

# 6. Merge Strategy

Use **Squash and Merge**.

This keeps `main` clean.

Final commit message automatically becomes:

```
feat: exam start & rules acknowledgement (#42)
```

---

# 7. Pull Latest Main

After merge:

```bash
git checkout main
git pull origin main
```

Delete old branch:

```bash
git branch -d feat/42-exam-start-screen
```

---

# 8. Tag a Release (Semantic Versioning)

Signals Master is pre-production, so **v0.x.x** is correct.

Version rules:

```
MAJOR.MINOR.PATCH
```

Meaning:

```
MAJOR → breaking change
MINOR → new feature
PATCH → bug fix
```

Examples:

```
v0.1.0 → first feature release
v0.2.0 → new feature added
v0.2.1 → bug fix
```

---

## Create the Tag

Example:

```bash
git tag -a v0.2.0 -m "Pre-Alpha: Exam Start & Rules Acknowledgement"
```

Push tag:

```bash
git push origin v0.2.0
```

---

# 9. Create a GitHub Release

After pushing the tag, create a release.

Release format:

### Tag

```
v0.2.0
```

### Title

```
Pre-Alpha: Exam Start & Rules Acknowledgement
```

### Description

```
## Overview
Introduces the exam start flow and rules acknowledgement.

## Features
- Exam start screen
- Mandatory rules acknowledgement
- Timer initialization

## Improvements
- Improved exam validation logic

## Fixes
- Timer reset issue

## Technical Changes
- Added exam service
- Updated validation layer

## Version
v0.2.0
```

---

# 10. Deployment

Your pipeline then deploys automatically (for example to **Vercel**).

Typical flow:

```
PR → tests
Merge to main → CI build
Tag → Release
Release → Production deployment
```

---

# The Full Workflow (Start → Finish)

```
Create Issue
      ↓
Create Branch
feat/#-feature-name
      ↓
Develop with Conventional Commits
      ↓
Push branch
      ↓
Open Pull Request
      ↓
CI runs tests
      ↓
Squash & Merge into main
      ↓
Pull latest main
      ↓
Create tag (v0.x.x)
      ↓
Push tag
      ↓
Create GitHub Release
      ↓
Deploy
```

---

# Example Real Workflow

Example for **Issue #42**

### Branch

```
feat/42-exam-start-screen
```

### Commits

```
feat(exam): add exam start page
feat(exam): implement rules acknowledgement
fix(timer): prevent timer reset on reload
```

### PR

```
feat: Exam Start & Rules Acknowledgement
```

### Tag

```
v0.2.0
```

### Release

```
Pre-Alpha: Exam Start & Rules Acknowledgement
```

