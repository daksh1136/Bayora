# 🛡️ Bayora: Adversarial AI Safety Testing Infrastructure

<p align="center">
  <b>Team Avinya</b> — <i>Hack in Hills / Web3 India / Builder Base / MEXIDO</i><br>
  <b>Daksh Sharma</b> (Backend & Security Infrastructure) • <b>Raj</b> (AI & Security Engineering) • <b>Somesh</b> (Research & Product Strategy)
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Security-Zero--Trust-blue?style=for-the-badge&logo=shield" />
  <img src="https://img.shields.io/badge/AI_Safety-Adversarial_Testing-red?style=for-the-badge&logo=openai" />
  <img src="https://img.shields.io/badge/Audit-SHA--256_Hash_Chain-purple?style=for-the-badge&logo=blockchain" />
  <img src="https://img.shields.io/badge/Policy_Engine-Python-blue?style=for-the-badge&logo=python" />
</p>

---

## 📌 Executive Summary & Problem Statement

AI systems are increasingly deployed in security- and safety-critical applications, making rigorous adversarial testing essential. However, traditional AI red-teaming typically operates within shared environments, creating severe risks of:
- **Cross-Team Information Leakage**: Red teams prematurely viewing Blue team defense heuristics, or Blue teams overfitting directly on adversarial corpora before deployment.
- **Model & Session Contamination**: Unrestricted sockets allowing attackers to directly compromise shared evaluation state or exfiltrate private credentials.
- **Side-Channel Attacks**: Threat actors measuring inference latency variations and resource contention to deduce system prompt tokens and confidential parameters.
- **Compromised Evaluation Evidence**: Fragile logs that can be tampered with or repudiated after vulnerabilities are discovered.

**Bayora** is an adversarial AI safety testing demo. It models Red Team and Blue Team workflows, simulates a client model, evaluates requests against application policies, and records tamper-evident audit events.

---

## 🏗️ Architecture & Flow

```
┌────────────────────────────────────────────────────────┐
│                      WEB DASHBOARD                     │
│    Real-Time Telemetry, Attack Matrix, Audit Verifier  │
└───────────────────────────┬────────────────────────────┘
                            │ (REST / WebSockets)
                            ▼
┌────────────────────────────────────────────────────────┐
│                   BACKEND CONTROLLER                   │
│          Zero-Trust Orchestration & Mediation          │
└───────────────────────────┬────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ 🔴 RED TEAM   │   │  🤖 CLIENT    │   │ 🔵 BLUE TEAM  │
│    SANDBOX    │   │      LLM      │   │    SANDBOX    │
│  Adversarial  │   │  Model Under  │   │  AI Defender  │
│   Attacker    │   │     Test      │   │  Guardrails   │
└───────┬───────┘   └───────┬───────┘   └───────┬───────┘
  bayora-red-net      bayora-llm-net      bayora-blue-net
  [Policy Segment]    [Model Sandbox]     [Policy Segment]
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                     SECURITY LAYER                     │
│  • Policy-Based Isolation    • Docker Network Segments │
│  • Python Policy Engine      • Resource Monitoring     │
│  • Side-Channel Detection    • Canary Checks           │
└───────────────────────────┬────────────────────────────┘
                            │
               ┌────────────┴────────────┐
               ▼                         ▼
      ┌─────────────────┐       ┌─────────────────┐
      │  TEST RESULTS   │       │   AUDIT LOGS    │
      │    DATABASE     │       │ SHA-256 LEDGER  │
      └─────────────────┘       └─────────────────┘
```

---

## 🌟 Key Features

1. **Policy-Based Isolation**: The application models separate Red Team, Blue Team, and Client LLM sandboxes and rejects prohibited direct requests through its policy engine. Docker Compose also defines internal networks for these segments. The sandboxes are application-level components, not separate containers.
2. **Role-Separated Testing Views**: Role-based access controls separate Red Team and Blue Team views. The backend mediates evaluation requests. The Client LLM is a deterministic simulation, not a connection to an external model.
3. **Policy-Based Access Control**: A Python policy engine checks mediated access, prohibited cross-sandbox requests, outbound access requests, and prompt-size limits. Rego policy examples and an OPA service are included in the Docker stack; the application currently evaluates requests in Python rather than calling the OPA service.
4. **LLM-Native Security Testing**: Automated detection and defense against:
   - DAN ("Do Anything Now") and persona-based jailbreak prompts
   - Delimiter hijacking and indirect prompt-injection patterns
   - System-prompt and canary-token disclosure patterns
   - Base64 and Unicode token-smuggling patterns
5. **Continuous Security Loop (`Attack → Detect → Defend → Retest`)**:
   - **Phase 1 (Attack)**: Red Team generates or mutates adversarial payload.
   - **Phase 2 (Detect)**: The simulated model runs the baseline test without the defense rule.
   - **Phase 3 (Defend)**: The Blue Team workflow creates a guardrail rule.
   - **Phase 4 (Retest)**: The attack is run again through the defense rule to check whether it is blocked.
6. **Tamper-Evident SHA-256 Hash Chain**: Audit events are linked by previous-hash pointers and signed with HMAC-SHA-256. The verifier checks the chain and reports the first invalid block.
7. **Resource & Side-Channel Monitoring**: The application reports CPU and memory use and analyzes response-time variation to help identify resource pressure and timing anomalies. It does not enforce operating-system cgroup limits.
8. **Role-Based Access Control (RBAC)**: Fine-grained capabilities for **Admin** (Raj), **Red Team Lead**, **Blue Team Lead**, and **Auditor** (Somesh).
9. **Observability & Cloud Readiness**: Prometheus exposition format at `/api/v1/telemetry/metrics` ready for Grafana integration.

---

## 🚀 Quickstart & Installation

### Option 1: Single-Command Quickstart (Recommended)

Run the included Bash setup and test script (Linux, macOS, or WSL):

```bash
git clone https://github.com/subwaycookiecrunch/Bayora.git
cd Bayora
./start.sh
```

This will automatically:
1. Initialize the Python virtual environment and install backend dependencies.
2. Install frontend dependencies if they are not already installed.
3. Run the automated pytest suite (27 tests).
4. Launch the FastAPI backend on port `8000` (or `8080` if 8000 is occupied).
5. Launch the React Vite dashboard on port `5173`.

### Option 2: Docker Compose (Local Stack)

```bash
docker compose up --build
```

The local stack starts these services:
- `backend` (`bayora-backend`): FastAPI controller (`http://localhost:8000`)
- `frontend` (`bayora-frontend`): React web UI (`http://localhost:3000` or `http://localhost:5173`)
- `db` (`bayora-db`): PostgreSQL (`localhost:5432`)
- `opa` (`bayora-opa`): Open Policy Agent (`http://localhost:8181`)
- `prometheus` (`bayora-prometheus`): Prometheus (`http://localhost:9090`)

The Compose file uses demo database credentials. If `BAYORA_SECRET_KEY` is not set, the app generates a fresh signing key at startup; configure this variable for stable login tokens across restarts. The default SQLite database is ephemeral on Render, so use PostgreSQL for data that must persist.

---

## 🧪 Automated Testing & Verification

Bayora includes a comprehensive test suite with **27 automated tests** covering unit, integration, and full end-to-end cycles:

```bash
python -m pytest backend/tests -v
```

On Windows, activate the virtual environment first with `.venv\Scripts\Activate.ps1`. On macOS or Linux, use `source .venv/bin/activate`.

### Test Suite Breakdown:
- `backend/tests/test_audit_chain.py`: Genesis block, SHA-256 linking, tamper detection, HMAC proofs.
- `backend/tests/test_policy_engine.py`: Policy-engine boundary checks, unmediated access blocks, and outbound-access denial.
- `backend/tests/test_sandboxes.py`: Red team payload generation, mutations, blue team guardrail filtering, canary protection.
- `backend/tests/test_orchestrator.py`: Automated 4-stage Attack → Detect → Defend → Retest loop.
- `backend/tests/test_api.py`: REST API endpoints, JWT auth, RBAC permissions.
- `backend/tests/test_side_channel.py`: Latency jitter analysis, resource spike detection.
- `backend/tests/test_e2e_full_chain.py`: Complete end-to-end pipeline test with tamper demonstration and recovery.

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Service health and configured isolation mode |
| `POST` | `/api/v1/evaluations/run` | Run a mediated adversarial test against the simulated model |
| `POST` | `/api/v1/evaluations/continuous-loop` | Execute continuous **Attack → Detect → Defend → Retest** loop |
| `GET` | `/api/v1/evaluations/` | List past evaluation records and outcomes |
| `GET` | `/api/v1/red-team/scenarios` | Retrieve adversarial attack templates |
| `POST` | `/api/v1/red-team/generate` | Generate novel attack payloads with mutation |
| `GET` | `/api/v1/blue-team/rules` | List active Blue Team LLM guardrail rules |
| `POST` | `/api/v1/blue-team/rules` | Deploy new custom defense rule |
| `PATCH` | `/api/v1/blue-team/rules/{id}/toggle` | Toggle defense rule on/off |
| `GET` | `/api/v1/audit/blocks` | Chronological SHA-256 hash chain blocks |
| `POST` | `/api/v1/audit/verify` | Cryptographically verify integrity of the entire chain |
| `POST` | `/api/v1/audit/tamper-simulate` | Tamper simulation demo endpoint for judges |
| `POST` | `/api/v1/audit/restore` | Recalculate and restore cryptographic proof |
| `GET` | `/api/v1/policies/` | List application policy definitions, including Rego examples |
| `POST` | `/api/v1/policies/evaluate` | Evaluate a request with the application policy engine |
| `GET` | `/api/v1/telemetry/metrics` | Prometheus metrics exposition format |
| `GET` | `/api/v1/telemetry/system` | System telemetry and estimated threat level |

Interactive Swagger documentation is available live at `http://localhost:8000/docs` (or `http://localhost:8080/docs`).

---

## 📊 Market Opportunity & Impact

- **Target users**: AI startups, cybersecurity red teams, financial and healthcare institutions handling sensitive data, government and defense organizations, and multi-tenant SaaS providers.
- **Value proposition**: Provides a policy-controlled environment for adversarial testing and tamper-evident audit records. Validate the isolation and security controls against your deployment requirements before using it with sensitive workloads.

---

## 👥 Team Avinya

- **Daksh Sharma** — Backend & Security Infrastructure
- **Raj** — AI & Security Engineering
- **Somesh** — Research & Product Strategy

Built with passion for **Hack in Hills / Web3 India / Builder Base / NEXIDO**.
