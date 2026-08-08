// Minimal Win32 call: set the desktop shell window as the owner of our window.
// Owned windows are NOT hidden by Show Desktop / Win+D / clicking the desktop.
// We use PowerShell with a cached compiled assembly for speed (first call ~1.5s, subsequent ~0.3s).

import { exec } from 'child_process'
import { writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { tmpdir } from 'os'
import { join } from 'path'

const CACHE_DIR = join(tmpdir(), 'simpletodo_pscache')
const DLL_PATH = join(CACHE_DIR, 'dtwin32.dll')

const CSHARP_SRC = `
using System;
using System.Runtime.InteropServices;
public class DTWin32 {
    [DllImport("user32.dll")] public static extern IntPtr GetShellWindow();
    [DllImport("user32.dll")] public static extern IntPtr SetWindowLongPtr(IntPtr hWnd, int nIndex, IntPtr dwNewLong);
    [DllImport("user32.dll")] public static extern IntPtr GetWindowLongPtr(IntPtr hWnd, int nIndex);
}
`

// Compile the C# type once and cache the DLL to avoid ~2s Add-Type per call
function compileOnce(): Promise<boolean> {
  return new Promise((resolve) => {
    if (existsSync(DLL_PATH)) { resolve(true); return }
    try { mkdirSync(CACHE_DIR, { recursive: true }) } catch { /* ok */ }

    const srcPath = join(CACHE_DIR, 'dtwin32.cs')
    writeFileSync(srcPath, CSHARP_SRC, 'utf8')

    const psScript = `
Add-Type -TypeDefinition (Get-Content "${srcPath.replace(/\\/g, '\\\\')}" -Raw) -OutputAssembly "${DLL_PATH.replace(/\\/g, '\\\\')}" -OutputType Library
Write-Output "OK"
`
    const scriptPath = join(CACHE_DIR, 'compile.ps1')
    writeFileSync(scriptPath, psScript, 'utf8')

    exec(
      `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${scriptPath}"`,
      { encoding: 'utf8', timeout: 30000, windowsHide: true },
      (_err, stdout) => {
        try { unlinkSync(srcPath) } catch { /* */ }
        try { unlinkSync(scriptPath) } catch { /* */ }
        resolve((stdout || '').includes('OK'))
      }
    )
  })
}

function runPS(psCode: string): Promise<string> {
  return new Promise((resolve) => {
    const scriptPath = join(tmpdir(), `st_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.ps1`)
    try { writeFileSync(scriptPath, psCode, 'utf8') } catch { resolve('') }
    exec(
      `powershell -NoProfile -NonInteractive -ExecutionPolicy Bypass -File "${scriptPath}"`,
      { encoding: 'utf8', timeout: 10000, windowsHide: true },
      (_err, stdout) => {
        try { unlinkSync(scriptPath) } catch { /* */ }
        resolve((stdout || '').trim())
      }
    )
  })
}

const GWL_HWNDPARENT = -8

export async function setDesktopOwner(hwndHex: string): Promise<boolean> {
  const dllReady = await compileOnce()
  const addType = dllReady
    ? `Add-Type -Path "${DLL_PATH.replace(/\\/g, '\\\\')}"`
    : `Add-Type -TypeDefinition @"\n${CSHARP_SRC}\n"@`

  const script = `
${addType}

$hwnd = [IntPtr]::new([int64]::Parse("${hwndHex}", [System.Globalization.NumberStyles]::HexNumber))
$shell = [DTWin32]::GetShellWindow()
if ($shell -eq [IntPtr]::Zero) { Write-Output "FAIL"; exit 0 }
[DTWin32]::SetWindowLongPtr($hwnd, ${GWL_HWNDPARENT}, [Int64]$shell) | Out-Null
Write-Output "OK"
`
  return (await runPS(script)).includes('OK')
}

export async function clearDesktopOwner(hwndHex: string): Promise<boolean> {
  const dllReady = await compileOnce()
  const addType = dllReady
    ? `Add-Type -Path "${DLL_PATH.replace(/\\/g, '\\\\')}"`
    : `Add-Type -TypeDefinition @"\n${CSHARP_SRC}\n"@`

  const script = `
${addType}

$hwnd = [IntPtr]::new([int64]::Parse("${hwndHex}", [System.Globalization.NumberStyles]::HexNumber))
[DTWin32]::SetWindowLongPtr($hwnd, ${GWL_HWNDPARENT}, [Int64]0) | Out-Null
Write-Output "OK"
`
  return (await runPS(script)).includes('OK')
}
