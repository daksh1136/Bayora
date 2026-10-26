import abc
from typing import Dict, Any

class BaseSandbox(abc.ABC):
    """Abstract Base Class for isolated sandboxes in Bayora."""

    def __init__(self, name: str, network_segment: str):
        self.name = name
        self.network_segment = network_segment
        self.is_active = True

    @abc.abstractmethod
    def execute(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        """Execute workload inside the isolated sandbox."""
        pass

    @abc.abstractmethod
    def health_check(self) -> Dict[str, Any]:
        """Verify sandbox isolation and resource status."""
        pass
