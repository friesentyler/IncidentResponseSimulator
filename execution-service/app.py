import os
import subprocess
from flask import Flask, request, jsonify

app = Flask(__name__)

# Base directory for the execution scripts
SCRIPTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), 'scripts'))

# Whitelist mapping of scenario IDs (from Django DB) to absolute bash script paths
# We map each valid scenario ID to its specific setup and teardown scripts.
# Example: Scenario ID 1 maps to Credential_Theft_Script.sh (start) and reset.sh (stop)
SCENARIOS = {
    "1": {
        "start": os.path.join(SCRIPTS_DIR, "Credential_Theft_Script.sh"),
        "stop": os.path.join(SCRIPTS_DIR, "reset.sh")
    }
}

@app.route('/run-scenario', methods=['POST'])
def run_scenario():
    """
    Receives POST requests to execute a specific incident response scenario script.
    """
    data = request.get_json(silent=True)
    
    if not data or 'scenario_id' not in data or 'action' not in data:
        return jsonify({"status": "error", "message": "Missing 'scenario_id' or 'action' parameter"}), 400
        
    scenario_id = str(data['scenario_id'])
    action = data['action']

    if action not in ['start', 'stop']:
        return jsonify({"status": "error", "message": "Invalid action. Must be 'start' or 'stop'"}), 400
    
    # Validate against the whitelist
    if scenario_id not in SCENARIOS:
        return jsonify({"status": "error", "message": f"Invalid scenario_id: {scenario_id}"}), 400
        
    script_path = SCENARIOS[scenario_id].get(action)
    
    if not script_path or not os.path.exists(script_path):
        return jsonify({"status": "error", "message": f"Scenario {action} script not found on disk"}), 500

    try:
        # Execute the script synchronously. shell=True is avoided for security.
        # This will block until the 30-second script finishes.
        result = subprocess.run(
            ["bash", script_path],
            capture_output=True,
            text=True,
            check=True
        )
        
        return jsonify({
            "status": "success",
            "message": "Scenario completed successfully",
            "stdout": result.stdout
        })
        
    except subprocess.CalledProcessError as e:
        # Raised when a process returns a non-zero exit status
        return jsonify({
            "status": "failure",
            "message": "Scenario script exited with an error",
            "stdout": e.stdout,
            "stderr": e.stderr
        }), 500
    except Exception as e:
        # Catch any other unexpected exceptions
        return jsonify({
            "status": "error",
            "message": "An unexpected server error occurred",
            "details": str(e)
        }), 500

if __name__ == '__main__':
    # We can run on port 5001 to avoid conflicting with standard services
    app.run(host='0.0.0.0', port=5001, debug=True)
