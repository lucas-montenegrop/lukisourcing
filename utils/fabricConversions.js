const CM_PER_INCH = 2.54;
const CM_PER_METER = 100;
const OZ_PER_SQ_YD_TO_GSM = 33.905747;

function roundTo(value, decimals = 2) {
  if (value == null || Number.isNaN(value)) return null;
  return Number(value.toFixed(decimals));
}

function average(numbers) {
  if (!numbers.length) return null;
  const total = numbers.reduce((sum, value) => sum + value, 0);
  return total / numbers.length;
}

function parseMeasurement(value) {
  if (value == null || value === "") return null;
  if (typeof value === "number") return value;

  const matches = String(value).match(/\d+(\.\d+)?/g);
  if (!matches) return null;

  const numbers = matches.map(Number).filter((number) => !Number.isNaN(number));
  return average(numbers);
}

function getWidthCm({ widthCm, widthInch }) {
  const parsedWidthCm = parseMeasurement(widthCm);
  if (parsedWidthCm != null) return parsedWidthCm;

  const parsedWidthInch = parseMeasurement(widthInch);
  if (parsedWidthInch == null) return null;

  return parsedWidthInch * CM_PER_INCH;
}

function gsmFromInput({ weightGsm, weightGlm, weightOz, widthCm, widthInch }) {
  const parsedWeightGsm = parseMeasurement(weightGsm);
  if (parsedWeightGsm != null) return parsedWeightGsm;

  const resolvedWidthCm = getWidthCm({ widthCm, widthInch });
  const widthMeters = resolvedWidthCm != null ? resolvedWidthCm / CM_PER_METER : null;

  const parsedWeightGlm = parseMeasurement(weightGlm);
  if (parsedWeightGlm != null && widthMeters) {
    return parsedWeightGlm / widthMeters;
  }

  const parsedWeightOz = parseMeasurement(weightOz);
  if (parsedWeightOz != null) {
    return parsedWeightOz * OZ_PER_SQ_YD_TO_GSM;
  }

  return null;
}

function deriveFabricMeasurements(input = {}) {
  const resolvedWidthCm = getWidthCm({
    widthCm: input.widthCm ?? input.width_cm,
    widthInch: input.widthInch ?? input.width_inch,
  });

  const resolvedWidthInch =
    resolvedWidthCm != null ? resolvedWidthCm / CM_PER_INCH : null;
  const widthMeters =
    resolvedWidthCm != null ? resolvedWidthCm / CM_PER_METER : null;

  const gsm = gsmFromInput({
    weightGsm: input.weightGsm ?? input.weight_gsm,
    weightGlm: input.weightGlm ?? input.weight_glm,
    weightOz: input.weightOz ?? input.weight_oz,
    widthCm: resolvedWidthCm,
    widthInch: resolvedWidthInch,
  });

  const glm = gsm != null && widthMeters != null ? gsm * widthMeters : null;
  const oz = gsm != null ? gsm / OZ_PER_SQ_YD_TO_GSM : null;

  return {
    width_cm_normalized: roundTo(resolvedWidthCm),
    width_inch_normalized: roundTo(resolvedWidthInch),
    weight_gsm: roundTo(gsm),
    weight_glm: roundTo(glm),
    weight_oz: roundTo(oz),
  };
}

module.exports = {
  deriveFabricMeasurements,
  getWidthCm,
  parseMeasurement,
  roundTo,
};
