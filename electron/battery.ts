import { execFile } from 'node:child_process'
import { promisify } from 'node:util'
import { promises as fs } from 'node:fs'
import path from 'node:path'
import os from 'node:os'
import * as cheerio from 'cheerio'

const execFileAsync = promisify(execFile)

export type BatteryHealthResult = {
  designCapacityMWh: number
  fullChargeCapacityMWh: number
  healthPercent: number
  batteryName: string | null
  manufacturer: string | null
  chemistry: string | null
  cycleCount: number | null
}

type ReportRow = {
  label: string
  value: string
}

function parseCapacity(value: string): number | null {
  const digits = value.replace(/[^\d]/g, '')
  return digits ? Number(digits) : null
}

function parseCycleCount(value: string): number | null {
  const digits = value.replace(/[^\d]/g, '')
  return digits ? Number(digits) : null
}

function getValue(rows: ReportRow[], label: string): string | null {
  return rows.find((row) => row.label === label)?.value || null
}

export async function getBatteryHealth(): Promise<BatteryHealthResult> {
  const reportPath = path.join(
    os.tmpdir(),
    `battery-report-${Date.now()}.html`
  )

  try {
    await execFileAsync(
      'powercfg',
      ['/batteryreport', '/output', reportPath],
      { windowsHide: true }
    )

    const html = await fs.readFile(reportPath, 'utf8')
    const $ = cheerio.load(html)

    const allRows: ReportRow[] = $('tr')
      .map((_, row) => {
        const cells = $(row).find('td')

        return {
          label: $(cells.eq(0)).text().trim().toLowerCase(),
          value: $(cells.eq(1)).text().trim(),
        }
      })
      .get()
      .filter((row) => row.label.length > 0)

    // The first "name" row belongs to the first installed battery.
    // Read only until cycle count, before later report sections begin.
    const startIndex = allRows.findIndex((row) => row.label === 'name')

    if (startIndex === -1) {
      throw new Error(
        'Windows did not provide installed battery details for this device.'
      )
    }

    const endIndex = allRows.findIndex(
      (row, index) => index >= startIndex && row.label === 'cycle count'
    )

    const installedBatteryRows = allRows.slice(
      startIndex,
      endIndex === -1 ? startIndex + 12 : endIndex + 1
    )

    const designCapacity = parseCapacity(
      getValue(installedBatteryRows, 'design capacity') ?? ''
    )

    const fullChargeCapacity = parseCapacity(
      getValue(installedBatteryRows, 'full charge capacity') ?? ''
    )

    if (!designCapacity || !fullChargeCapacity) {
      throw new Error(
        'Windows did not provide complete battery capacity data for this device.'
      )
    }

    return {
      designCapacityMWh: designCapacity,
      fullChargeCapacityMWh: fullChargeCapacity,
      healthPercent: Math.round(
        (fullChargeCapacity / designCapacity) * 100
      ),
      batteryName: getValue(installedBatteryRows, 'name'),
      manufacturer: getValue(installedBatteryRows, 'manufacturer'),
      chemistry: getValue(installedBatteryRows, 'chemistry'),
      cycleCount: parseCycleCount(
        getValue(installedBatteryRows, 'cycle count') ?? ''
      ),
    }
  } finally {
    await fs.unlink(reportPath).catch(() => {})
  }
}