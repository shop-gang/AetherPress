# Devcontainer Dependency Management

## Overview

This project uses a devcontainer to automate the installation of backend and frontend dependencies for rapid prototyping and consistent developer environments.

## Automated Installs

On container creation, the following commands are run automatically:

```
cd client && npm install && cd ../server && npm install express puppeteer && npm install --save-dev nodemon && cd ..
```

- Installs all frontend dependencies in `client/`.
- Installs `express` and `puppeteer` as dependencies and `nodemon` as a devDependency in `server/`.

## Pros

- **Automation:** Developers get a ready-to-code environment without manual setup.
- **Consistency:** Ensures all team members and CI environments have the same dependencies.
- **Speed:** Reduces onboarding time—just open the Codespace and start coding.
- **Error Reduction:** Avoids “works on my machine” issues due to missing dependencies.

## Cons

- **Build Time:** Every time the container rebuilds, it runs all install commands, which can slow down startup, especially if dependencies are large (like Puppeteer).
- **Less Flexibility:** If you want to customize or skip certain installs, you must edit the devcontainer config.
- **Potential Redundancy:** If dependencies rarely change, repeated installs may be unnecessary.
- **Hardcoded Stack:** Tightly couples the devcontainer to Node.js/Express/Puppeteer; switching stacks requires config changes.

## Recommendations

- For rapid prototyping and small teams, this approach is ideal.
- For larger projects, consider optimizing with dependency caching or more granular install scripts.
