export type UserRole = 'admin' | 'red_lead' | 'blue_lead' | 'auditor';

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  is_active: boolean;
  created_at: string;
}

export interface Evaluation {
  id: number;
  test_id: string;
  name: string;
  status: string;
  attack_type: string;
  category: 'JAILBREAK' | 'PROMPT_INJECTION' | 'CONTEXT_LEAKAGE' | 'SIDE_CHANNEL' | 'TOKEN_SMUGGLING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  target_model: string;
  original_prompt: string;
  sanitized_prompt?: string | null;
  model_response?: string | null;
  compromised: boolean;
  defense_triggered: boolean;
  defense_rule_applied?: string | null;
  latency_ms: number;
  cpu_percent: number;
  memory_mb: number;
  side_channel_flag: boolean;
  is_retest: boolean;
  parent_eval_id?: number | null;
  audit_block_hash?: string | null;
  created_at: string;
}

export interface DefenseRule {
  id: number;
  name: string;
  description?: string;
  category: string;
  pattern: string;
  action: 'BLOCK' | 'SANITIZE' | 'QUARANTINE';
  enabled: boolean;
  hits: number;
  created_at: string;
}

export interface AttackScenario {
  id: number;
  title: string;
  category: string;
  severity: string;
  payload: string;
  description?: string;
  created_at: string;
}

export interface AuditBlock {
  id: number;
  block_index: number;
  timestamp: string;
  event_type: string;
  actor: string;
  data_payload: string;
  payload_hash: string;
  prev_hash: string;
  block_hash: string;
  signature?: string;
  verified: boolean;
}

export interface AuditVerificationResult {
  valid: boolean;
  total_blocks: number;
  broken_index?: number | null;
  latest_hash?: string | null;
  details: string;
}

export interface LoopStep {
  step: number;
  phase: 'ATTACK' | 'DETECT' | 'DEFEND' | 'RETEST';
  title: string;
  status: string;
  details: any;
  timestamp: number;
}

export interface LoopResult {
  cycle_id: string;
  total_duration_ms: number;
  remediated: boolean;
  summary: string;
  steps: LoopStep[];
  audit_hash: string;
}

export interface SystemTelemetry {
  resources: {
    cpu_percent: number;
    memory_used_mb: number;
    memory_percent: number;
    timestamp: number;
  };
  sandboxes: {
    red_sandbox: any;
    blue_sandbox: any;
    client_llm_sandbox: any;
    isolation_active: boolean;
    zero_trust_status: string;
  };
  side_channel_history_samples: number;
  threat_level: string;
}

export interface SecurityPolicy {
  id: string;
  name: string;
  source: string;
  target: string;
  action: string;
  description: string;
  rego: string;
}
