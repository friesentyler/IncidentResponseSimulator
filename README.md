# IncidentResponseSimulator

### System Context Diagram
- Purpose: Illustrates users, external systems, and ownership boundaries between developer-managed application services and infrastructure-managed scenario environments.
- For clarity, while the Scenario Orchestration VM is owned by Network Admin, the User Web Application talks to the Scenario Orchestration VM via an HTTP protocol, the webserver on the Scenario Orchestration VM that chooses which bash script to run is owned by development. The bash scripts are owned by Network Admin though.
```mermaid
C4Context
title Incident Response Simulator - System Context Diagram
%% System Context Diagram
%% Purpose: Illustrates users, external systems, and ownership boundaries
%% between developer-managed application services and infrastructure-managed
%% scenario environments.

Person(user, "Simulator User", "Security professional or student running incident response scenarios.")

System_Ext(stripe, "Stripe", "External payment processor used for subscription billing.")

System_Boundary(simulator, "Incident Response Simulator") {

    System_Boundary(dev, "Developer Owned Systems") {
        System(webapp, "User Web Application", "Web interface used to manage accounts, billing, and launch scenarios.")
    }

    System_Boundary(infra, "Infrastructure / Network Admin Owned Systems") {
        System(orchestrator_vm, "Scenario Orchestration VM", "Kali-based VM hosting the orchestration API and automation scripts that configure scenarios.")
        System(corp_network, "Mock Corporate Network", "Virtual enterprise network used during simulations.")
    }

}

Rel(user, webapp, "Uses platform via browser")
Rel(user, stripe, "Provides billing information")

Rel(webapp, stripe, "Processes billing", "Stripe API")
Rel(webapp, orchestrator_vm, "Requests scenario execution", "HTTPS API")

Rel(orchestrator_vm, corp_network, "Creates and manages scenarios", "SSH/Bash")

UpdateRelStyle(user, webapp, $lineColor="Blue", $textColor="Blue")
UpdateRelStyle(user, stripe, $lineColor="Blue", $textColor="Blue", $offsetX="-30", $offsetY="15")
UpdateRelStyle(webapp, stripe, $lineColor="Blue", $textColor="Blue", $offsetX="30", $offsetY="-50")
UpdateRelStyle(webapp, orchestrator_vm, $lineColor="Blue", $textColor="Blue", $offsetX="-50", $offsetY="30")
UpdateRelStyle(orchestrator_vm, corp_network, $lineColor="Blue", $textColor="Blue")
```

### Container Diagram
- Purpose: Details the high-level technology choices and communication protocols within the web application, mapping the distribution of responsibilities between the user interface, core API logic, and the background orchestration thread that manages state and external service integrations.
```mermaid
C4Container
title User Web Application – Container Diagram

Person(user, "Simulator User", "Security professional or student running incident response scenarios.")

System_Boundary(webapp, "User Web Application") {
    %% Row 1: Columns 1, 2, 3
    Container(background_worker, "Background Task", "Python Thread", "Executes VM spin-up, orchestrates VM control.")
    Container(backend_api, "Django API", "Django + DRF", "API business logic, Simple JWT auth, and billing integration.")
    Container(frontend, "Angular SPA", "Angular", "SPA for account mgmt, scenario control, and status polling.")
    
    %% Row 2: Column 1
    ContainerDb(sqlite_db, "SQLite Database", "SQLite", "Persistent storage for user accounts and scenario execution metadata.")
}

System_Ext(stripe, "Stripe", "External payment processor for user subscriptions and billing.")
System_Ext(orchestrator_vm, "Scenario Orchestrator VM", "API endpoint controlling the mock corporate network environment.")

Rel(user, frontend, "Uses", "HTTPS")

%% Relationships
Rel(frontend, backend_api, "API calls & status polling", "HTTPS / JSON")
Rel(backend_api, sqlite_db, "Reads/Writes user & scenario data", "ORM")
Rel(backend_api, stripe, "Processes billing", "Stripe API")
Rel(backend_api, background_worker, "Delegates long-running tasks", "Internal call")
Rel(background_worker, orchestrator_vm, "Requests VM creation", "HTTPS REST API")
Rel(background_worker, sqlite_db, "Updates scenario status", "ORM")

UpdateRelStyle(user, frontend, $lineColor="#0000FF", $textColor="#0000FF", $offsetX="60")
UpdateRelStyle(frontend, backend_api, $lineColor="#0000FF", $textColor="#0000FF", $offsetY="-40", $offsetX="-40")
UpdateRelStyle(backend_api, sqlite_db, $lineColor="#0000FF", $textColor="#0000FF")
UpdateRelStyle(backend_api, stripe, $lineColor="#0000FF", $textColor="#0000FF", $offsetY="-70", $offsetX="10")
UpdateRelStyle(backend_api, background_worker, $lineColor="#0000FF", $textColor="#0000FF", $offsetY="-30", $offsetX="-30")
UpdateRelStyle(background_worker, orchestrator_vm, $lineColor="#0000FF", $textColor="#0000FF")
UpdateRelStyle(background_worker, sqlite_db, $lineColor="#0000FF", $textColor="#0000FF")

UpdateLayoutConfig($c4ShapeInRow="3", $c4BoundaryInRow="1")
```
