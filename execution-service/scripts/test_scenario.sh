#!/bin/bash
# test_scenario.sh
# A dummy script to simulate an incident response scenario.

echo "[INFO] Starting test scenario deployment..."
sleep 2

echo "[INFO] Provisioning required resources..."
sleep 3

echo "[DEBUG] Connecting to target environment..."
sleep 5

echo "[INFO] Scenario running"

# Simulate some ongoing process that takes up the rest of the 30 seconds
for i in {1..4}; do
    echo "[DEBUG] Executing phase $i of scenario simulation..."
    sleep 5
done

echo "[INFO] Cleaning up temporary files..."
sleep 2

echo "[INFO] Scenario simulation completed successfully."
exit 0
