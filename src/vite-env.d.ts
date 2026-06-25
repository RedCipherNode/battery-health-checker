/// <reference types="vite/client" />

type BatteryHealthResult = {
  designCapacityMWh: number
  fullChargeCapacityMWh: number
  healthPercent: number
}

interface Window {
  batteryAPI: {
    getHealth: () => Promise<BatteryHealthResult>
  }
}