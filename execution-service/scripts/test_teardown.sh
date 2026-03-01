#!/bin/bash
# test_teardown.sh
# A dummy script to simulate teardown of an incident response scenario.

echo "[INFO] Starting test scenario teardown..."
sleep 2

echo "[INFO] Deprovisioning resources..."
sleep 3

echo "[DEBUG] Disconnecting from target environment..."
sleep 5

echo "[INFO] Scenario stopped"

# Simulate some ongoing process that takes up the rest of the time
for i in {1..2}; do
    echo "[DEBUG] Executing phase $i of teardown simulation..."
    sleep 5
done

echo "[INFO] Teardown simulation completed successfully."
exit 0
