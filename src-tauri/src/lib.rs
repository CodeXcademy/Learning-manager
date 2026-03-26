// REMOVE_TAURI_DEV_AUTH — When removing dev auto-login, set the env below to "false" or delete the line.
#[cfg(not(debug_assertions))]
const LM_DEV_AUTO_LOGIN_VALUE: &str = "true";

use std::process::Child;
use std::sync::Mutex;

use tauri::Manager;

struct ApiChild(Mutex<Option<Child>>);

#[cfg(not(debug_assertions))]
fn sidecar_exe_name() -> &'static str {
  if cfg!(target_os = "windows") {
    "learning-manager-api.exe"
  } else {
    "learning-manager-api"
  }
}

#[cfg(not(debug_assertions))]
fn spawn_api_sidecar(app: &tauri::AppHandle) -> Result<Option<Child>, Box<dyn std::error::Error>> {
  let data_dir = app.path().app_data_dir()?;
  std::fs::create_dir_all(&data_dir)?;
  let Some(exe_dir) = std::env::current_exe()
    .ok()
    .and_then(|p| p.parent().map(|p| p.to_path_buf()))
  else {
    return Ok(None);
  };
  let api = exe_dir.join(sidecar_exe_name());
  if !api.exists() {
    log::warn!(
      "API sidecar not found at {:?}. Build it with: npm run tauri:prepare-sidecar (Windows).",
      api
    );
    return Ok(None);
  }
  let child = std::process::Command::new(&api)
    .current_dir(&exe_dir)
    .env(
      "LEARNING_MANAGER_DATA_DIR",
      data_dir.to_string_lossy().as_ref(),
    )
    .env("LM_DEV_AUTO_LOGIN", LM_DEV_AUTO_LOGIN_VALUE)
    .env("DEBUG", "false")
    .spawn()?;
  Ok(Some(child))
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  let mut builder = tauri::Builder::default();

  if cfg!(debug_assertions) {
    builder = builder.plugin(
      tauri_plugin_log::Builder::default()
        .level(log::LevelFilter::Info)
        .build(),
    );
  }

  let app = builder
    .manage(ApiChild(Mutex::new(None)))
    .setup(|app| {
      #[cfg(not(debug_assertions))]
      {
        if let Some(child) = spawn_api_sidecar(app.handle())? {
          let state = app.state::<ApiChild>();
          state.0.lock().expect("api child mutex").replace(child);
        }
      }
      #[cfg(debug_assertions)]
      {
        log::info!("API runs via npm run dev:tauri (Vite + uvicorn).");
        let _ = app;
      }
      Ok(())
    })
    .build(tauri::generate_context!())
    .expect("error while building tauri application");

  app.run(|app_handle, event| {
    if let tauri::RunEvent::Exit = event {
      let state = app_handle.state::<ApiChild>();
      let mut slot = match state.0.lock() {
        Ok(g) => g,
        Err(p) => p.into_inner(),
      };
      if let Some(mut child) = slot.take() {
        let _ = child.kill();
      }
    }
  });
}
