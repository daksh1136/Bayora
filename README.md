# 🛡️ Bayora: Securing Adversarial AI Safety Testing Infrastructure

<p align="center">
  <b>Team Avinya</b> — <i>Hack in Hills / Web3 India / Builder Base / MEXIDO</i><br>
  <b>Daksh Sharma</b> (Backend & Security Infrastructure) • <b>Raj</b> (AI & Security Engineering) • <b>Somesh</b> (Research & Product Strategy)
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Security-Zero--Trust-blue?style=for-the-badge&logo=shield" />
  <img src="https://img.shields.io/badge/AI_Safety-Adversarial_Testing-red?style=for-the-badge&logo=openai" />
  <img src="https://img.shields.io/badge/Audit-SHA--256_Hash_Chain-purple?style=for-the-badge&logo=blockchain" />
  <img src="https://img.shields.io/badge/Policy_Engine-Open_Policy_Agent-emerald?style=for-the-badge&logo=open-policy-agent" />
  <img src="https://img.shields.io/badge/Tests-100%25_Passing-success?style=for-the-badge&logo=pytest" />
</p>

---

## 📌 Executive Summary & Problem Statement

AI systems are increasingly deployed in security- and safety-critical applications, making rigorous adversarial testing essential. However, traditional AI red-teaming typically operates within shared environments, creating severe risks of:
- **Cross-Team Information Leakage**: Red teams prematurely viewing Blue team defense heuristics, or Blue teams overfitting directly on adversarial corpora before deployment.
- **Model & Session Contamination**: Unrestricted sockets allowing attackers to directly compromise shared evaluation state or exfiltrate private credentials.
- **Side-Channel Attacks**: Threat actors measuring inference latency variations and resource contention to deduce system prompt tokens and confidential parameters.
- **Compromised Evaluation Evidence**: Fragile logs that can be tampered with or repudiated after vulnerabilities are discovered.

**Bayora** is a zero-trust AI safety testing platform that securely isolates the **Red Team**, **Blue Team**, and **Client LLM** while enabling continuous, blind adversarial testing and generating tamper-evident cryptographic evidence.

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
  [Micro-Seg]         [No Sockets]        [Blind Testing]
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
┌────────────────────────────────────────────────────────┐
│                     SECURITY LAYER                     │
│  • Workload Isolation        • Micro-Segmentation      │
│  • OPA Rego Access Control   • Resource cgroups Limits │
│  • Side-Channel Jitter Guard • Canary Tripwires        │
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

1. **Zero-Trust Isolation**: Red Team, Blue Team, and LLM run in strictly isolated sandboxes with micro-segmented networks (`bayora-red-net`, `bayora-blue-net`, `bayora-llm-net`). Direct peer cross-talk is rejected at the network and policy layer.
2. **Blind Adversarial Testing**: Red Team cannot inspect active defense rules or model weights; Blue Team defends incoming prompts without prior leakage of the attack corpus. The Backend Controller serves as the verifiable mediator.
3. **Policy-Based Access Control (PBAC / OPA)**: Powered by Open Policy Agent (Rego rules) that inspect all packets, payload boundaries, and capabilities before execution.
4. **LLM-Native Security Testing**: Automated detection and defense against:
   - DAN (Do Anything Now) & Persona Assumption Jailbreaks
   - Delimiter Hijacking & Indirect Prompt Injections
   - System Prompt & Confidential Canary Token Leakage
   - Token Smuggling via Base64/Unicode Obfuscation
5. **Continuous Security Loop (`Attack → Detect → Defend → Retest`)**:
   - **Phase 1 (Attack)**: Red Team generates or mutates adversarial payload.
   - **Phase 2 (Detect)**: Baseline test runs unshielded, establishing vulnerability and compromise.
   - **Phase 3 (Defend)**: Blue Team autonomously synthesizes a dynamic guardrail defense rule.
   - **Phase 4 (Retest)**: The exact same attack is executed through the new defense layer to verify remediation!
6. **Tamper-Evident SHA-256 Hash Chain**: Every evaluation and policy event is cryptographically linked via previous-hash pointers and HMAC signatures. A one-click cryptographic verifier validates all blocks and flags any tampering down to the exact block index.
7. **Resource & Side-Channel Protection**: Continuous monitoring of CPU, RAM, and response latency jitter to neutralize timing attacks and noisy-neighbor resource starvation.
8. **Role-Based Access Control (RBAC)**: Fine-grained capabilities for **Admin** (Raj), **Red Team Lead**, **Blue Team Lead**, and **Auditor** (Somesh).
9. **Observability & Cloud Readiness**: Prometheus exposition format at `/api/v1/telemetry/metrics` ready for Grafana integration.

---

## 🚀 Quickstart & Installation

### Option 1: Single-Command Quickstart (Recommended)

Run the included automated setup and test script:

```bash
git clone https://github.com/team-avinya/bayora.git
cd Bayora
./start.sh
```

This will automatically:
1. Initialize the Python virtual environment and install backend dependencies.
2. Install frontend dependencies and build assets.
3. Run the automated pytest suite (27 tests).
4. Launch the FastAPI backend on port `8000` (or `8080` if 8000 is occupied).
5. Launch the React Vite dashboard on port `5173`.

### Option 2: Docker Compose (Full Cloud Stack)

```bash
docker compose up --build
```

Services started:
- `bayora-backend`: FastAPI Backend Controller (`http://localhost:8000`)
- `bayora-frontend`: React Web UI (`http://localhost:3000` or `http://localhost:5173`)
- `bayora-db`: PostgreSQL Database (`localhost:5432`)
- `bayora-opa`: Open Policy Agent Server (`http://localhost:8181`)
- `bayora-prometheus`: Prometheus Metrics Server (`http://localhost:9090`)

---

## 🧪 Automated Testing & Verification

Bayora includes a comprehensive test suite with **27 automated tests** covering unit, integration, and full end-to-end cycles:

```bash
source .venv/bin/activate
pytest backend/tests -v
```

### Test Suite Breakdown:
- `backend/tests/test_audit_chain.py`: Genesis block, SHA-256 linking, tamper detection, HMAC proofs.
- `backend/tests/test_policy_engine.py`: OPA zero-trust isolation, unmediated access blocks, internet egress prevention.
- `backend/tests/test_sandboxes.py`: Red team payload generation, mutations, blue team guardrail filtering, canary protection.
- `backend/tests/test_orchestrator.py`: Automated 4-stage Attack → Detect → Defend → Retest loop.
- `backend/tests/test_api.py`: REST API endpoints, JWT auth, RBAC permissions.
- `backend/tests/test_side_channel.py`: Latency jitter analysis, resource spike detection.
- `backend/tests/test_e2e_full_chain.py`: Complete end-to-end pipeline test with tamper demonstration and recovery.

---

## 🌐 API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | System health and sandbox isolation status |
| `POST` | `/api/v1/evaluations/run` | Execute isolated adversarial test through mediated pipeline |
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
| `GET` | `/api/v1/policies/` | List OPA Rego zero-trust policies |
| `POST` | `/api/v1/policies/evaluate` | Interactive policy request evaluation |
| `GET` | `/api/v1/telemetry/metrics` | Prometheus metrics exposition format |
| `GET` | `/api/v1/telemetry/system` | Real-time system telemetry and threat gauge |

Interactive Swagger documentation is available live at `http://localhost:8000/docs` (or `http://localhost:8080/docs`).

---

## 📊 Market Opportunity & Impact

- **Market Size**: The global Generative AI Cybersecurity market was estimated at **\$8.9B in 2025** and is projected to reach **\$56.8B by 2033** (26.8% CAGR). India's enterprise AI market is growing at **44.9% CAGR** towards \$9.92B by 2030.
- **Target Users**: AI Startups, Cybersecurity Red-Teams, Financial & Healthcare institutions handling sensitive data, Government & Defense, and Multi-tenant SaaS providers.
- **Value Proposition**: Replaces insecure, ad-hoc red-teaming scripts with an enterprise-grade, cryptographically auditable zero-trust infrastructure.

---

## 👥 Team Avinya

- **Daksh Sharma** — Backend & Security Infrastructure
- **Raj** — AI & Security Engineering
- **Somesh** — Research & Product Strategy

Built with passion for **Hack in Hills / Web3 India / Builder Base / MEXIDO**.
