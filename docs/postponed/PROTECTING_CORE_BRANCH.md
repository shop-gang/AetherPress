# Protecting the `core` Branch

To guarantee that nothing touches the `core` branch, follow these steps to set up branch protection on GitHub and enforce best practices locally.

## 1. Enable Branch Protection Rules on GitHub

1. Go to your repository on GitHub.
2. Click on **Settings** > **Branches**.
3. Under **Branch protection rules**, click **Add rule**.
4. Enter `core` as the branch name pattern.

## 2. Recommended Protection Settings

- **Restrict who can push to matching branches**: Add only trusted users, or leave empty to block all direct pushes.
- **Require pull request reviews before merging**: Set the number of required reviewers to the maximum allowed.
- **Do not allow direct pushes**: Enable this option if available.
- **Require status checks to pass before merging**: Enable if you use CI/CD.

## 3. Local Enforcement (Optional)

- Communicate to your team: No one should work directly on `core`.
- Use a pre-push or pre-commit git hook to block pushes to `core` (advanced, see below).

### Example Pre-Push Hook

Create a file named `.git/hooks/pre-push` with the following content:

```sh
#!/bin/sh
branch=$(git symbolic-ref --short HEAD)
if [ "$branch" = "core" ]; then
  echo "Pushing directly to 'core' is not allowed."
  exit 1
fi
```

Make it executable:

```sh
chmod +x .git/hooks/pre-push
```

---

By following these steps, you can guarantee that the `core` branch remains protected from direct changes.
