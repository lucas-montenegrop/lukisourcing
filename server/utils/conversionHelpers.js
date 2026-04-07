export function roundTo(value, decimals = 2) {
  if (value == null || Number.isNaN(value)) return null;
  return Number(value.toFixed(decimals));
}

function average(numbers) {
  if (!numbers.length) return null;
  const total = numbers.reduce((sum, value) => sum + value, 0);
  return total / numbers.length;
}

export function parseMeasurement(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number") return value;

  const matches = String(value).match(/\d+(\.\d+)?/g);
  if (!matches) return null;

  const numbers = matches.map(Number).filter((number) => !Number.isNaN(number));
  return average(numbers);
}

export function normalizeDateString(value) {
  if (!value) return null;
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().slice(0, 10);
  }

  const parsedDate = new Date(value);
  if (Number.isNaN(parsedDate.getTime())) return null;
  return parsedDate.toISOString().slice(0, 10);
}
