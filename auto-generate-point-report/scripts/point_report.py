"""入口委托：实际流水线统一由看板仓库 reporting/ 提供，避免两份口径独立演进。"""
import json
import os
import runpy
import sys
from pathlib import Path


def board_project():
    candidate = Path(os.environ.get("CHAIN_BOARD_PROJECT") or Path.cwd()).resolve()
    try:
        if json.loads((candidate / "package.json").read_text()).get("name") == "xlb-chain-board" and (candidate / "reporting/point_report.py").is_file():
            return candidate
    except (OSError, ValueError):
        pass
    raise SystemExit("LOCAL_BOARD_PROJECT_NOT_AVAILABLE")


project = board_project()
sys.path.insert(0, str(project / "reporting"))
runpy.run_path(str(project / "reporting/point_report.py"), run_name="__main__")
