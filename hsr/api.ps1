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

# Function to process gacha data for a specific type
function Process-GachaType {
    param (
        [string]$baseUrl,
        [int]$gachaType
    )
    
    $stats = @{
        total_count = 0
        rank_4_count = 0
        rank_5_count = 0
        pulls_before_first_4 = 0
        pulls_before_first_5 = 0
        found_first_4 = $false
        found_first_5 = $false
    }

    # Add or update gacha_type parameter
    $url = $baseUrl
    if ($url -match "gacha_type=\d+") {
        $url = $url -replace "gacha_type=\d+", "gacha_type=$gachaType"
    } else {
        $url = if ($url.Contains("?")) {
            "$url&gacha_type=$gachaType"
        } else {
            "$url?gacha_type=$gachaType"
        }
    }

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
        
        Write-Output "Trying URL (Type $gachaType): $paged_url"
        # Add delay of 250ms between requests (max 4 requests per second)
        Start-Sleep -Milliseconds 250
        # Get JSON data from URL and parse it
        $response = Invoke-WebRequest -Uri $paged_url -ContentType "application/json" -UseBasicParsing | ConvertFrom-Json

        if ($response.retcode -eq 0) {
            # Count items based on rank_type
            foreach ($item in $response.data.list) {
                $itemCount = [int]$item.count
                $stats.total_count += $itemCount
                
                if ($item.rank_type -eq "4") {
                    $stats.rank_4_count += $itemCount
                    if (-not $stats.found_first_4) {
                        $stats.found_first_4 = $true
                    }
                } elseif ($item.rank_type -eq "5") {
                    $stats.rank_5_count += $itemCount
                    if (-not $stats.found_first_5) {
                        $stats.found_first_5 = $true
                    }
                }
                
                if (-not $stats.found_first_4) {
                    $stats.pulls_before_first_4 += $itemCount
                }
                if (-not $stats.found_first_5) {
                    $stats.pulls_before_first_5 += $itemCount
                }
            }

            # Set end_id for the next page
            $end_id = $response.data.list[-1].id

        } else {
            Write-Output "Failed to retrieve data. Error code: $($response.retcode)"
            break
        }
        
    } while ($response.data.list.Count -gt 0)

    return $stats
}

$gachaTypes = @{
    11 = "Character Event Warp"
    2 = "Departure Warp"
    1 = "Stellar Warp"
}

$results = @{}

for ($i = $cache_data_split.Length - 1; $i -ge 0; $i--) {
    $line = $cache_data_split[$i]

    if ($line.StartsWith('http') -and $line.Contains("getGachaLog")) {
        $baseUrl = ($line -split "\0")[0]
        Write-Output "Warp URL found!"

        foreach ($type in @(11,2,1)) {
            Write-Output "`nProcessing $($gachaTypes[$type])..."
            $results[$type] = Process-GachaType -baseUrl $baseUrl -gachaType $type
        }

        # Display results in a table format
        Write-Output "`n=== Warp Statistics ===`n"
        $header = "Banner Type".PadRight(25) + "|" + 
                 "4*".PadLeft(6) + "|" + 
                 "5*".PadLeft(6) + "|" + 
                 "Total".PadLeft(8) + "|" + 
                 "4* Pity".PadLeft(10) + "/10|" + 
                 "5* Pity".PadLeft(10) + "/90"
        Write-Output $header
        Write-Output ("-" * $header.Length)

        foreach ($type in @(11,1,2)) {
            $stats = $results[$type]
            $line = $gachaTypes[$type].PadRight(25) + "|" + 
                   $stats.rank_4_count.ToString().PadLeft(6) + "|" + 
                   $stats.rank_5_count.ToString().PadLeft(6) + "|" + 
                   $stats.total_count.ToString().PadLeft(8) + "|" + 
                   $stats.pulls_before_first_4.ToString().PadLeft(10) + "/10|" + 
                   $stats.pulls_before_first_5.ToString().PadLeft(10) + "/90"
            Write-Output $line
        }

        Write-Output ""
        Read-Host -Prompt "Press Enter to exit"
        return
    }
}

Write-Output "Could not locate Warp URL."
Write-Output "Please make sure to open the Warp history before running the script."
