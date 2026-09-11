from .electrical import ElectricalSwitchScenario
from .plumbing import PTrapScenario
from .base import Scenario

REGISTRY = {
    ElectricalSwitchScenario.id: ElectricalSwitchScenario(),
    PTrapScenario.id: PTrapScenario(),
}


def get_scenario(sid: str) -> Scenario:
    if sid not in REGISTRY:
        raise KeyError(f"Unknown scenario '{sid}'. Available: {list(REGISTRY)}")
    return REGISTRY[sid]


def list_scenarios():
    return list(REGISTRY.values())
