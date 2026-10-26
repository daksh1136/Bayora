package bayora.authz

# Default deny all traffic
default allow = false

# Rule 1: Allow mediated requests through Backend Controller
allow if {
    input.mediated_by == "orchestrator_controller"
    input.target != "external_internet"
    input.prompt_length <= 8000
}

# Rule 2: Deny direct cross-sandbox communication between Red and Blue
allow = false if {
    input.source == "red_sandbox"
    input.target == "blue_sandbox"
}

# Rule 3: Deny direct unmediated access to LLM from Red
allow = false if {
    input.source == "red_sandbox"
    input.target == "client_llm"
    not input.mediated_by_controller
}

# Rule 4: Zero outbound internet egress for any isolated sandbox
allow = false if {
    input.target == "external_internet"
}
