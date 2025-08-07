# Root package.json and node_modules Removal

As of July 2025, all dependency management and scripts are handled within the `client/` and `server/` directories. The application root no longer requires a `package.json` or `node_modules` directory. All installs and commands should be run from the respective subdirectories.

If you encounter issues, you can restore a minimal root `package.json` as a placeholder, but this should not be necessary for standard development workflows.
