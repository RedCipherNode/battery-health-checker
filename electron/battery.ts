import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";
import * as cheerio from "cheerio";

const execFileAsync = promisify(execFile);

export type BatteryHealthResult = {
  designCapacityMWh: number;
  fullChargeCapacityMWh: number;
  healthPercent: number;
};

function parseCapacity(value: string): number | null {
  const digits = value.replace(/[^\d]/g, "");
  return digits ? Number(digits) : null;
}

export async function getBatteryHealth(): Promise<BatteryHealthResult> {
  const reportPath = path.join(
    os.tmpdir(),
    `battery-report-${Date.now()}.html`
  );

  try {
    await execFileAsync(
      "powercfg",
      ["/batteryreport", "/output", reportPath],
      { windowsHide: true }
    );

    const html = await fs.readFile(reportPath, "utf8");
    const $ = cheerio.load(html);

    let designCapacity: number | null = null;
    let fullChargeCapacity: number | null = null;

    $("tr").each((_, row) => {
      const cells = $(row).find("td");
      const label = $(cells[0]).text().trim().toLowerCase();
      const value = $(cells[1]).text().trim();

      if (label.includes("design capacity")) {
        designCapacity = parseCapacity(value);
      }

      if (label.includes("full charge capacity")) {
        fullChargeCapacity = parseCapacity(value);
      }
    });

    if (!designCapacity || !fullChargeCapacity) {
      throw new Error(
        "Capacity data is unavailable on this device."
      );
    }

    return {
      designCapacityMWh: designCapacity,
      fullChargeCapacityMWh: fullChargeCapacity,
      healthPercent: Math.round(
        (fullChargeCapacity / designCapacity) * 100
      )
    };
  } finally {
    await fs.unlink(reportPath).catch(() => {});
  }
}