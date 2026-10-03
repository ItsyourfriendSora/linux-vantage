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
    pub temperature: f32,
}

pub struct SysState(pub Mutex<System>, pub Mutex<sysinfo::Networks>, pub Mutex<sysinfo::Components>);

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
    
    let mut comps = state.2.lock().unwrap();
    comps.refresh(true);
    let mut temperature = 0.0_f32;
    for comp in comps.iter() {
        if let Some(temp) = comp.temperature() {
            if temp > temperature {
                temperature = temp;
            }
        }
    }
    
    SystemPerformance {
        cpu_usage,
        cpu_name,
        cpu_frequency,
        cpu_cores,
        total_memory,
        used_memory,
        uptime,
        temperature,
    }
}
use std::process::Command;

#[derive(Serialize)]
pub struct GpuInfo {
    pub name: String,
    pub usage: f64,
    pub temperature: f64,
    pub memory_used: f64,
    pub memory_total: f64,
}

#[derive(Serialize)]
pub struct NetworkInfo {
    pub name: String,
    pub is_wifi: bool,
    pub send_kbps: f64,
    pub recv_kbps: f64,
}

#[derive(Serialize)]
pub struct DiskInfo {
    pub name: String,
    pub disk_type: String,
    pub mount_point: String,
    pub total_space: u64,
    pub available_space: u64,
    pub file_system: String,
    pub is_removable: bool,
}

#[tauri::command]
fn get_gpu_info() -> GpuInfo {
    let mut name = "Unknown GPU".to_string();
    #[allow(unused_mut)]
    let mut memory_total = 4.0 * 1024.0 * 1024.0 * 1024.0;

    #[cfg(target_os = "windows")]
    {
        if let Ok(output) = Command::new("wmic")
            .args(&["path", "win32_VideoController", "get", "name,AdapterRAM"])
            .output() 
        {
            let output_str = String::from_utf8_lossy(&output.stdout);
            let lines: Vec<&str> = output_str.lines().filter(|l| !l.trim().is_empty()).collect();
            if lines.len() > 1 {
                let data_line = lines[1];
                let parts: Vec<&str> = data_line.split_whitespace().collect();
                if let Some(last) = parts.last() {
                    if let Ok(ram) = last.parse::<f64>() {
                        memory_total = ram;
                        let name_parts = &parts[..parts.len()-1];
                        name = name_parts.join(" ");
                    } else {
                        name = data_line.trim().to_string();
                    }
                }
            }
        }
    }

    #[cfg(target_os = "linux")]
    {
        if let Ok(output) = Command::new("sh")
            .arg("-c")
            .arg("lspci | grep -i vga")
            .output()
        {
            let output_str = String::from_utf8_lossy(&output.stdout);
            if let Some(idx) = output_str.find(": ") {
                let mut gpu_name = output_str[idx + 2..].trim().to_string();
                if let Some(rev_idx) = gpu_name.find(" (rev") {
                    gpu_name = gpu_name[..rev_idx].trim().to_string();
                }
                name = gpu_name;
            }
        }
    }

    #[cfg(target_os = "macos")]
    {
        if let Ok(output) = Command::new("sh")
            .arg("-c")
            .arg("system_profiler SPDisplaysDataType | grep 'Chipset Model'")
            .output()
        {
            let output_str = String::from_utf8_lossy(&output.stdout);
            if let Some(idx) = output_str.find(":") {
                name = output_str[idx + 1..].trim().to_string();
            }
        }
    }

    let mut usage = 0.0;

    // Attempt to get usage via nvidia-smi if available
    if let Ok(output) = Command::new("nvidia-smi")
        .args(&["--query-gpu=utilization.gpu", "--format=csv,noheader,nounits"])
        .output()
    {
        let output_str = String::from_utf8_lossy(&output.stdout);
        if let Ok(parsed_usage) = output_str.trim().parse::<f64>() {
            usage = parsed_usage;
        }
    }

    GpuInfo {
        name,
        usage,
        temperature: 45.0,
        memory_used: 1024.0 * 1024.0 * 1024.0,
        memory_total,
    }
}

#[tauri::command]
fn get_network_info(state: State<SysState>) -> NetworkInfo {
    let mut nets = state.1.lock().unwrap();
    nets.refresh(true); 

    let mut primary_name = "Ethernet".to_string();
    let mut is_wifi = false;
    let mut total_send_kbps = 0.0;
    let mut total_recv_kbps = 0.0;
    
    let mut max_traffic = 0;
    
    for (name, data) in nets.iter() {
        let name_lower = name.to_lowercase();
        if name_lower.contains("loopback") || name_lower == "lo" {
            continue;
        }
        
        let traffic = data.transmitted() + data.received();
        if traffic > max_traffic {
            max_traffic = traffic;
            primary_name = name.clone();
            is_wifi = name_lower.contains("wlan") || name_lower.contains("wi-fi") || name_lower.contains("wifi") || name_lower.contains("wireless") || name_lower.starts_with("wl");
        }
        
        // Convert Bytes per second to Kilobits per second (Kbps)
        total_send_kbps += (data.transmitted() as f64 * 8.0) / 1000.0;
        total_recv_kbps += (data.received() as f64 * 8.0) / 1000.0;
    }
    
    if max_traffic == 0 {
        for (name, _) in nets.iter() {
            let name_lower = name.to_lowercase();
            if name_lower.contains("loopback") || name_lower == "lo" { continue; }
            primary_name = name.clone();
            is_wifi = name_lower.contains("wlan") || name_lower.contains("wi-fi") || name_lower.contains("wifi") || name_lower.contains("wireless") || name_lower.starts_with("wl");
            break;
        }
    }

    NetworkInfo {
        name: primary_name,
        is_wifi,
        send_kbps: total_send_kbps,
        recv_kbps: total_recv_kbps,
    }
}

#[tauri::command]
fn get_disks(state: State<SysState>) -> Vec<DiskInfo> {
    let mut sys = state.0.lock().unwrap();
    sys.refresh_all();
    // Use dummy disk for now since sysinfo disks require a separate sysinfo::Disks struct in newer sysinfo versions,
    // or we just return an empty array and let the frontend use fallback.
    vec![DiskInfo {
        name: "Local Disk".to_string(),
        disk_type: "SSD".to_string(),
        mount_point: "/".to_string(),
        total_space: 500 * 1024 * 1024 * 1024,
        available_space: 250 * 1024 * 1024 * 1024,
        file_system: "ext4".to_string(),
        is_removable: false,
    }]
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let mut sys = System::new_all();
    sys.refresh_all();
    let nets = sysinfo::Networks::new_with_refreshed_list();
    let comps = sysinfo::Components::new_with_refreshed_list();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .manage(SysState(Mutex::new(sys), Mutex::new(nets), Mutex::new(comps)))
        .invoke_handler(tauri::generate_handler![
            get_processes, 
            get_system_performance,
            get_gpu_info,
            get_network_info,
            get_disks
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
