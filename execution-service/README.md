# Execution Service

/execution-service is the root directory to run the bash script execution microservice from.
This is a minimalist Flask application designed to listen for POST requests from the Django backend and execute corresponding predefined bash scripts for incident response scenarios.

To set up the virtual environment:
```bash
python3 -m venv venv
```

To activate the virtual environment:
```bash
source venv/bin/activate
```

To install required dependencies:
```bash
pip install -r requirements.txt
```

Run the Flask execution server (runs on port 5001 by default):
```bash
python app.py
```

## Testing the Service Locally

You can simulate what the Django backend does by sending a POST request to the `/run-scenario` endpoint.

```bash
curl -X POST http://localhost:5001/run-scenario \
     -H "Content-Type: application/json" \
     -d '{"scenario_id": "test-scenario-1"}'
```

The server blocks completely until the bash script finishes (up to 30 seconds for the test scenario) and then returns a JSON response containing the success/failure status and the stdout/stderr of the script.

## Architecture & Security

- **Whitelisting**: In `app.py`, there is a mapping dict `SCENARIOS`. This mapping enforce a strict whitelist. The API will *only* run a script if its predefined ID matches exactly what's on the whitelist.
- **Absolute Paths**: Scripts are resolved via absolute paths constructed relative to the `app.py` root to prevent traversal attacks.
- **No Direct Shell Execution**: We use Python's `subprocess.run([...], shell=False)` to prevent shell injection vulnerabilities. Execution is handled strictly as an array of arguments passed to the bash interpreter.
