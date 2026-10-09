import sys
from pathlib import Path
from dotenv import load_dotenv

# Resolve repository root (D:\Team_Task_Manager) and insert into sys.path
root_dir = Path(__file__).resolve().parent.parent
if str(root_dir) not in sys.path:
    sys.path.insert(0, str(root_dir))

# Explicitly load .env from repository root
load_dotenv(root_dir / ".env")

from backend.app import create_app

app = create_app()

if __name__ == "__main__":
    app.run(port=5000, debug=True)