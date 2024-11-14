[Net.ServicePointManager]::SecurityProtocol = [Net.ServicePointManager]::SecurityProtocol -bor [Net.SecurityProtocolType]::Tls12

Add-Type -AssemblyName System.Web

$ProgressPreference = 'SilentlyContinue'

$game_path = ""

Write-Output "Attempting to locate Warp Url!"

if ($args.Length -eq 0) {
    $app_data = [Environment]::GetFolderPath('ApplicationData')
    $locallow_path = "$app_data\\..\\LocalLow\\Cognosphere\\Star Rail\\"

    $log_path = "$locallow_path\\Player.log"

    if (-Not [IO.File]::Exists($log_path)) {
        Write-Output "Failed to locate log file!"
        return
    }

    $log_lines = Get-Content $log_path -First 11

    if ([string]::IsNullOrEmpty($log_lines)) {
        $log_path = "$locallow_path\\Player-prev.log"

        if (-Not [IO.File]::Exists($log_path)) {
            Write-Output "Failed to locate log file!"
            return
        }

        $log_lines = Get-Content $log_path -First 11
    }

    if ([string]::IsNullOrEmpty($log_lines)) {
        Write-Output "Failed to locate game path! (1)"
        return
    }

    $log_lines = $log_lines.split([Environment]::NewLine)

    for ($i = 0; $i -lt 10; $i++) {
        $log_line = $log_lines[$i]

        if ($log_line.startsWith("Loading player data from ")) {
            $game_path = $log_line.replace("Loading player data from ", "").replace("data.unity3d", "")
            break
        }
    }
} else {
    $game_path = $args[0]
}

if ([string]::IsNullOrEmpty($game_path)) {
    Write-Output "Failed to locate game path! (2)"
    return
}

$copy_path = [IO.Path]::GetTempPath() + [Guid]::NewGuid().ToString()
$cache_path = "$game_path/webCaches/Cache/Cache_Data/data_2"
$cache_folders = Get-ChildItem "$game_path/webCaches/" -Directory
$max_version = 0

for ($i = 0; $i -le $cache_folders.Length; $i++) {
    $cache_folder = $cache_folders[$i].Name
    if ($cache_folder -match '^\d+\.\d+\.\d+\.\d+$') {
        $version = [int]-join($cache_folder.Split("."))
        if ($version -ge $max_version) {
            $max_version = $version
            $cache_path = "$game_path/webCaches/$cache_folder/Cache/Cache_Data/data_2"
        }
    }
}

Copy-Item -Path $cache_path -Destination $copy_path
$cache_data = Get-Content -Encoding UTF8 -Raw $copy_path
Remove-Item -Path $copy_path

$cache_data_split = $cache_data -split '1/0/'

# Initialize counters
$total_count = 0
$rank_4_count = 0
$rank_5_count = 0
$pulls_before_first_4 = 0
$pulls_before_first_5 = 0
$found_first_4 = $false
$found_first_5 = $false

for ($i = $cache_data_split.Length - 1; $i -ge 0; $i--) {
    $line = $cache_data_split[$i]

    if ($line.StartsWith('http') -and $line.Contains("getGachaLog")) {
        $url = ($line -split "\0")[0]

        # Modify size parameter to 20
        $url = $url -replace "size=\d+", "size=20"
        
        $size = 20
        $end_id = 0

        do {
            # Clean URL of any existing begin_id or end_id
            $paged_url = $url -replace 'begin_id=[^&]*&?', "" `
                             -replace 'end_id=[^&]*&?', ""
            
            # Ensure no trailing "&" or "?" if parameters were at the end
            $paged_url = $paged_url.TrimEnd('&', '?')

            # Add new end_id for pagination if needed
            if ($end_id -ne 0) {
                if ($paged_url.Contains("?")) {
                    $paged_url = "$paged_url&end_id=$end_id"
                } else {
                    $paged_url = "$paged_url?end_id=$end_id"
                }
            }
            Write-Output "Trying URL: $paged_url"
            # Add delay of 250ms between requests (max 4 requests per second)
            Start-Sleep -Milliseconds 250
            # Get JSON data from URL and parse it
            $response = Invoke-WebRequest -Uri $paged_url -ContentType "application/json" -UseBasicParsing | ConvertFrom-Json

            if ($response.retcode -eq 0) {
                Write-Output "Warp URL found!"
                
                # Count items based on rank_type
                foreach ($item in $response.data.list) {
                    $itemCount = [int]$item.count
                    $total_count += $itemCount
                    
                    if ($item.rank_type -eq "4") {
                        $rank_4_count += $itemCount
                        if (-not $found_first_4) {
                            $found_first_4 = $true
                        }
                    } elseif ($item.rank_type -eq "5") {
                        $rank_5_count += $itemCount
                        if (-not $found_first_5) {
                            $found_first_5 = $true
                        }
                    }
                    
                    if (-not $found_first_4) {
                        $pulls_before_first_4 += $itemCount
                    }
                    if (-not $found_first_5) {
                        $pulls_before_first_5 += $itemCount
                    }
                }

                # Set end_id for the next page and increment page
                $end_id = $response.data.list[-1].id
                $page++

            } else {
                Write-Output "Failed to retrieve data. Error code: $($response.retcode)"
                break
            }
            
        } while ($response.data.list.Count -gt 0)

        Write-Output "Total Items Parsed: $total_count"
        Write-Output "4-Star Items: $rank_4_count"
        Write-Output "5-Star Items: $rank_5_count"
        Write-Output "Pulls before first 4-star: $pulls_before_first_4"
        Write-Output "Pulls before first 5-star: $pulls_before_first_5"

        Read-Host -Prompt "Press Enter to exit"
        return
    }
}

Write-Output "Could not locate Warp URL."
Write-Output "Please make sure to open the Warp history before running the script."
