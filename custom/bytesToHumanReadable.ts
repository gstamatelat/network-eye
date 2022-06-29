/**
 * Converts a number indicating number of bytes into a human readable representation.
 * 
 * @param bytes the initial number of bytes
 * @param unit the base unit, default 'B'
 * @param ratio the ratio, default 1024
 * @param threshold the threshold of changing unit, default 1500
 * @returns the given bytes in human readable form
 */
export function bytesToHumanReadable(
  bytes: number,
  unit: string = 'B',
  ratio: number = 1024,
  threshold: number = 1500
): string {
  const units: string[] = ['', 'K', 'M', 'G', 'T']
  let unitsCounter: number = 0
  while (true) {
    if (bytes < threshold || unitsCounter == units.length - 1) {
      return `${bytes.toFixed(2)} ${units[unitsCounter]}${unit}`
    }
    bytes /= ratio
    unitsCounter++
  }
}
