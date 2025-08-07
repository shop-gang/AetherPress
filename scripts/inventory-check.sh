#!/bin/bash
echo "System Packages:"
dpkg -l | tee system_packages.txt

echo "Node Dependencies:"
npm ls --depth=0 | tee node_dependencies.txt

echo "Devcontainer Configs:"
cat .devcontainer/devcontainer.json | tee devcontainer_config.txt
