# Battery Health

A small Windows desktop app that reads battery capacity data locally and estimates battery health.

![Platform](https://img.shields.io/badge/platform-Windows-0078D4)
![Built with](https://img.shields.io/badge/built%20with-Electron-47848F)
![Version](https://img.shields.io/badge/version-1.0.0-blue)

## What it does

Battery Health reads the latest battery information reported by Windows and shows:

- Estimated battery health percentage
- Full charge capacity
- Design capacity
- Battery model
- Manufacturer
- Chemistry
- Cycle count, when reported by the device

Battery health is calculated as:

```text
Full charge capacity ÷ Design capacity × 100
```

## Privacy

Everything runs locally on your Windows device.

- No account
- No cloud sync
- No data upload
- No ads
- No tracking

## Download

Download the latest installer from the GitHub Releases page:

Battery Health Setup for Windows

## Requirements

Windows 10 or Windows 11
64-bit system

## Install

1. Download 

```
Battery Health-Setup-1.0.0.exe
```

2. Run the installer
3. Choose Only for me unless you want it installed for every Windows account
4. Open Battery Health from the Start Menu or desktop shortcut
5. Click Check battery health

## Notes

- The result is based on the latest capacity values reported by Windows.
- Capacity estimates can change after charging, discharging, battery calibration, BIOS updates, or driver updates.
- Some laptops do not report cycle count. In that case the app shows `Not reported by device`.
- Battery health is different from your current battery percentage.
  For example, a laptop can be at 62% charge while its estimated battery health is 94%.

## Development

```
npm install
npm run dev
```

### Build Windows installer

```
npm run build:win
```
The installer will be created in:

```
release/1.0.0/Battery Health-Setup-1.0.0.exe
```

## Tech stack

```
Electron
React
TypeScript
Vite
electron-builder
```

## LICENSE
This project is licensed under the MIT License. See LICENSE.