# 项目重命名脚本 (Windows PowerShell)
# 用法: .\rename-project.ps1 -NewName "新项目名称"
# 示例: .\rename-project.ps1 -NewName "my awesome project"

param(
    [Parameter(Mandatory=$true, HelpMessage="请输入新项目名称")]
    [string]$NewName
)

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

function ConvertTo-KebabCase {
    param([string]$text)
    $text.ToLower() -replace '\s+', '-' -replace '[^a-z0-9\-]', ''
}

function ConvertTo-SnakeCase {
    param([string]$text)
    $text.ToLower() -replace '\s+', '_' -replace '[^a-z0-9_]', ''
}

function ConvertTo-CamelCase {
    param([string]$text)
    $words = $text.Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
    $result = ""
    for ($i = 0; $i -lt $words.Count; $i++) {
        $word = $words[$i].ToLower()
        if ($i -eq 0) {
            $result = $word
        } else {
            $result += $word.Substring(0,1).ToUpper() + $word.Substring(1)
        }
    }
    $result
}

function ConvertTo-PascalCase {
    param([string]$text)
    $words = $text.Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
    $result = ""
    foreach ($word in $words) {
        $result += $word.Substring(0,1).ToUpper() + $word.Substring(1).ToLower()
    }
    $result
}

function Get-EnvPrefix {
    param([string]$text)
    $words = $text.Split(' ', [System.StringSplitOptions]::RemoveEmptyEntries)
    $prefix = ""
    foreach ($word in $words) {
        $prefix += $word.Substring(0,1).ToUpper()
    }
    $prefix.Substring(0, [Math]::Min(4, $prefix.Length))
}

function ConvertTo-TitleCase {
    param([string]$text)
    (Get-Culture).TextInfo.ToTitleCase($text.ToLower())
}

$NewKebab = ConvertTo-KebabCase $NewName
$NewSnake = ConvertTo-SnakeCase $NewName
$NewCamel = ConvertTo-CamelCase $NewName
$NewPascal = ConvertTo-PascalCase $NewName
$NewEnvPrefix = Get-EnvPrefix $NewName
$NewLower = $NewName.ToLower()
$NewTitle = ConvertTo-TitleCase $NewName

$OldKebab = "vibe-testing"
$OldSnake = "vibetesting"
$OldCamel = "vibeTesting"
$OldPascal = "VibeTesting"
$OldEnvPrefix = "VT"
$OldLower = "vibe testing"
$OldTitle = "Vibe Testing"

Write-Host "=========================================="
Write-Host "项目重命名脚本"
Write-Host "=========================================="
Write-Host ""
Write-Host "当前项目名称:"
Write-Host "  kebab-case:  $OldKebab"
Write-Host "  snake_case:  $OldSnake"
Write-Host "  camelCase:   $OldCamel"
Write-Host "  PascalCase:  $OldPascal"
Write-Host "  ENV Prefix:  $OldEnvPrefix"
Write-Host "  Title:       $OldTitle"
Write-Host ""
Write-Host "新项目名称:"
Write-Host "  kebab-case:  $NewKebab"
Write-Host "  snake_case:  $NewSnake"
Write-Host "  camelCase:   $NewCamel"
Write-Host "  PascalCase:  $NewPascal"
Write-Host "  ENV Prefix:  $NewEnvPrefix"
Write-Host "  Title:       $NewTitle"
Write-Host ""
Write-Host "项目根目录: $ProjectRoot"
Write-Host ""

$confirm = Read-Host "确认执行重命名? (y/n)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "操作已取消"
    exit 0
}

Write-Host ""
Write-Host "开始重命名..."
Write-Host ""

Set-Location $ProjectRoot

$excludeDirs = @("node_modules", ".git", "dist", "build", ".next", "coverage", "bin", ".cache")
$excludeFiles = @("*.log", "*.lock", "*.sum", "rename-project.*")

function Replace-InFiles {
    param(
        [string]$OldPattern,
        [string]$NewPattern,
        [string]$Description
    )
    
    Write-Host "  [$Description] '$OldPattern' -> '$NewPattern'"
    
    $files = Get-ChildItem -Recurse -File | Where-Object {
        $dir = $_.DirectoryName
        $exclude = $false
        foreach ($excludeDir in $excludeDirs) {
            if ($dir -like "*\$excludeDir\*" -or $dir -like "*$excludeDir*") {
                $exclude = $true
                break
            }
        }
        foreach ($excludeFile in $excludeFiles) {
            if ($_.Name -like $excludeFile) {
                $exclude = $true
                break
            }
        }
        -not $exclude
    }
    
    foreach ($file in $files) {
        try {
            $content = Get-Content -Path $file.FullName -Raw -Encoding UTF8
            if ($content -match [regex]::Escape($OldPattern)) {
                $newContent = $content -replace [regex]::Escape($OldPattern), $NewPattern
                Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8 -NoNewline
            }
        } catch {
            # 跳过无法读写的文件
        }
    }
}

Write-Host "1. 替换文件内容..."
Replace-InFiles $OldTitle $NewTitle "Title"
Replace-InFiles $OldPascal $NewPascal "PascalCase"
Replace-InFiles $OldCamel $NewCamel "camelCase"
Replace-InFiles $OldKebab $NewKebab "kebab-case"
Replace-InFiles $OldSnake $NewSnake "snake_case"
Replace-InFiles $OldEnvPrefix $NewEnvPrefix "ENV Prefix"
Replace-InFiles $OldLower $NewLower "lowercase"

Write-Host ""
Write-Host "2. 替换目录名..."
$dirs = Get-ChildItem -Recurse -Directory | Where-Object {
    $_.Name -like "*$OldKebab*"
} | Sort-Object { $_.FullName.Length } -Descending

foreach ($dir in $dirs) {
    $newName = $dir.Name -replace [regex]::Escape($OldKebab), $NewKebab
    if ($dir.Name -ne $newName) {
        Write-Host "  目录: $($dir.FullName) -> $newName"
        try {
            Rename-Item -Path $dir.FullName -NewName $newName
        } catch {
            Write-Host "  警告: 无法重命名目录 $($dir.FullName)"
        }
    }
}

Write-Host ""
Write-Host "3. 替换文件名..."
$files = Get-ChildItem -Recurse -File | Where-Object {
    $_.Name -like "*$OldKebab*"
} | Sort-Object { $_.FullName.Length } -Descending

foreach ($file in $files) {
    $newName = $file.Name -replace [regex]::Escape($OldKebab), $NewKebab
    if ($file.Name -ne $newName) {
        Write-Host "  文件: $($file.FullName) -> $newName"
        try {
            Rename-Item -Path $file.FullName -NewName $newName
        } catch {
            Write-Host "  警告: 无法重命名文件 $($file.FullName)"
        }
    }
}

Write-Host ""
Write-Host "=========================================="
Write-Host "重命名完成!"
Write-Host "=========================================="
Write-Host ""
Write-Host "建议执行以下操作:"
Write-Host "  1. 检查 git status 确认更改"
Write-Host "  2. 运行 go build ./... 验证后端编译"
Write-Host "  3. 运行 npm install 和 npm run build 验证前端"
Write-Host "  4. 检查并更新任何遗漏的配置"
Write-Host ""
