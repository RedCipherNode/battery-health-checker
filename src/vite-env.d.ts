/// <reference types="vite/client" />

type BatteryHealthResult = {
  designCapacityMWh: number
  fullChargeCapacityMWh: number
  healthPercent: number
  batteryName: string | null
  manufacturer: string | null
  chemistry: string | null
  cycleCount: number | null
}

interface Window {
  batteryAPI: {
    getHealth: () => Promise<BatteryHealthResult>
  }
}