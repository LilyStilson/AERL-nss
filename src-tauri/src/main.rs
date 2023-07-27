// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod aeparser;

use window_shadows::set_shadow;
use tauri::Manager;
use sysinfo::{System, SystemExt};
use aeparser::parse_project;

/// Get the total memory of the current platform in kilobytes
#[tauri::command]
fn get_platform_memory() -> u64 {
    let mut sys = System::new_all();
    sys.refresh_all();

    sys.total_memory()
}

#[tauri::command]
fn get_platform_cpu() -> usize {
    let mut sys = System::new_all();
    sys.refresh_all();

    let p = sys.cpus();

    p.len()
}

#[tauri::command]
fn parse_aep(project_path: String) -> Result<String, String> {
    match parse_project(&project_path) {
        Some(project) => {
            let json = serde_json::to_string(&project)
                .expect("Serialization failed!");
            Ok(json)
        }
        None => {
            Err("Failed to parse project".to_string())  
        }
    }
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();

            #[cfg(any(windows, target_os = "macos"))]
            set_shadow(&window, true).unwrap();
            Ok(())
        }) 
        .invoke_handler(tauri::generate_handler![
            get_platform_memory, 
            get_platform_cpu,
            parse_aep
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}