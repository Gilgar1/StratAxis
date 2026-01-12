#!/bin/bash

# StratAxis Monitoring Script
echo "--- StratAxis System Status ---"
echo "Date: $(date)"

echo "--- PM2 Processes ---"
pm2 list

echo "--- Disk Usage ---"
df -h | grep '^/dev/'

echo "--- Memory Usage ---"
free -h

echo "--- Nginx Status ---"
systemctl status nginx | grep Active

echo "--- PostgreSQL Status ---"
systemctl status postgresql | grep Active
