"""Frozen entry point for PyInstaller sidecar (starts uvicorn)."""
import multiprocessing

if __name__ == "__main__":
    multiprocessing.freeze_support()
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        log_level="info",
        factory=False,
    )
