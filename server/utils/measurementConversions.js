import { parseMeasurement, roundTo } from "./conversionHelpers.js";

const CM_PER_INCH = 2.54;
const CM_PER_METER = 100;
const YARDS_PER_METER = 1.0936132983;
const OZ_PER_SQ_YD_TO_GSM = 33.905747;

export function getWidthCm({ widthCm, widthInch }) {
  const parsedWidthCm = parseMeasurement(widthCm);
  if (parsedWidthCm != null) return parsedWidthCm;

  const parsedWidthInch = parseMeasurement(widthInch);
  if (parsedWidthInch == null) return null;

  return parsedWidthInch * CM_PER_INCH;
}

export function metersToYards(meters) {
  const parsedMeters = parseMeasurement(meters);
  if (parsedMeters == null) return null;
  return parsedMeters * YARDS_PER_METER;
}

export function yardsToMeters(yards) {
  const parsedYards = parseMeasurement(yards);
  if (parsedYards == null) return null;
  return parsedYards / YARDS_PER_METER;
}

export function deriveLengthConversions(input = {}) {
  const metersInput = input.meters ?? input.length_meters ?? input.length_m;
  const yardsInput = input.yards ?? input.length_yards ?? input.length_yd;

  const meters = parseMeasurement(metersInput) ?? yardsToMeters(yardsInput);
  const yards = parseMeasurement(yardsInput) ?? metersToYards(metersInput);

  return {
    length_meters: roundTo(meters),
    length_yards: roundTo(yards),
  };
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

export function deriveFabricMeasurements(input = {}) {
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
