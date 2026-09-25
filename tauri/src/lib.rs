use sysinfo::System;
use std::sync::Mutex;
use tauri::State;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize)]
pub struct ProcessInfo {
    pub pid: u32,
    pub name: String,
    pub cpu: f32,
    pub memory: u64,
    pub disk_read: u64,
    pub disk_write: u64,
}

#[derive(Serialize, Deserialize)]
pub struct SystemPerformance {
    pub cpu_usage: f32,
    pub cpu_name: String,
    pub cpu_frequency: u64,
    pub cpu_cores: usize,
    pub total_memory: u64,
    pub used_memory: u64,
    pub uptime: u64,
}

pub struct SysState(pub Mutex<System>);

#[tauri::command]
fn get_processes(state: State<SysState>) -> Vec<ProcessInfo> {
    let mut sys = state.0.lock().unwrap();
    sys.refresh_all();
    
    let mut procs: Vec<ProcessInfo> = sys.processes().iter().map(|(pid, process)| {
        ProcessInfo {
            pid: pid.as_u32(),
            name: process.name().to_string_lossy().into_owned(),
            cpu: process.cpu_usage(),
            memory: process.memory(),
            disk_read: process.disk_usage().read_bytes,
            disk_write: process.disk_usage().written_bytes,
        }
    }).collect();
    
    procs.sort_by(|a, b| b.cpu.partial_cmp(&a.cpu).unwrap_or(std::cmp::Ordering::Equal));
    procs.truncate(150);
    procs
}

#[tauri::command]
fn get_system_performance(state: State<SysState>) -> SystemPerformance {
    let mut sys = state.0.lock().unwrap();
    sys.refresh_all();
    
    let cpus = sys.cpus();
    let cpu_usage = if !cpus.is_empty() {
        cpus.iter().map(|c| c.cpu_usage()).sum::<f32>() / cpus.len() as f32
    } else {
        0.0
    };
    let cpu_name = cpus.first().map(|c| c.brand().to_string()).unwrap_or_default();
    let cpu_frequency = cpus.first().map(|c| c.frequency()).unwrap_or_default();
    let cpu_cores = cpus.len();
    
    let total_memory = sys.total_memory();
    let used_memory = sys.used_memory();
    let uptime = System::uptime();
    
    SystemPerformance {
        cpu_usage,
        cpu_name,
        cpu_frequency,
        cpu_cores,
        total_memory,
        used_memory,
        uptime,
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut sys = System::new_all();
    sys.refresh_all();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(SysState(Mutex::new(sys)))
        .invoke_handler(tauri::generate_handler![get_processes, get_system_performance])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
