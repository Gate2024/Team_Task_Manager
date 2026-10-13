import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Resolve repository root (D:\Team_Task_Manager) and backend directory
backend_dir = Path(__file__).resolve().parent
root_dir = backend_dir.parent

for p in (str(backend_dir), str(root_dir)):
    if p not in sys.path:
        sys.path.insert(0, p)

# Auto-detect local virtualenv site-packages if running in global Python interpreter
venv_site_packages = root_dir / "venv" / "Lib" / "site-packages"
if venv_site_packages.exists() and str(venv_site_packages) not in sys.path:
    sys.path.insert(0, str(venv_site_packages))

# Explicitly load .env from repository root or backend directory
if (root_dir / ".env").exists():
    load_dotenv(root_dir / ".env")
elif (backend_dir / ".env").exists():
    load_dotenv(backend_dir / ".env")

try:
    from backend.app import create_app
except ModuleNotFoundError:
    from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)