// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use window_shadows::set_shadow;
use tauri::Manager;
use sysinfo::{System, SystemExt};

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

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            let window = app.get_window("main").unwrap();

            #[cfg(any(windows, target_os = "macos"))]
            set_shadow(&window, true).unwrap();
            Ok(())
        }) 
        .invoke_handler(tauri::generate_handler![get_platform_memory, get_platform_cpu])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}