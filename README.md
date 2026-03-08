# IncidentResponseSimulator

### System Context Diagram
- Purpose: Illustrates users, external systems, and ownership boundaries between developer-managed application services and infrastructure-managed scenario environments.
```mermaid
C4Context
title Incident Response Simulator
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
