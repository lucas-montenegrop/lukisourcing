import {
  normalizeDateString,
  parseMeasurement,
  roundTo,
} from "./conversionHelpers.js";

const YARDS_PER_METER = 1.0936132983;

export function getExchangeRateForDate({ exchangeRatesByDate = {}, entryDate }) {
  const normalizedDate = normalizeDateString(entryDate);
  if (!normalizedDate) return null;
  return exchangeRatesByDate[normalizedDate] ?? null;
}

export function convertCurrencyAmount({
  amount,
  fromCurrency,
  toCurrency,
  exchangeRate,
}) {
  const parsedAmount = parseMeasurement(amount);
  if (parsedAmount == null) return null;
  if (!fromCurrency || !toCurrency) return null;

  const source = String(fromCurrency).toUpperCase();
  const target = String(toCurrency).toUpperCase();

  if (source === target) return parsedAmount;
  if (exchangeRate == null || Number.isNaN(Number(exchangeRate))) return null;

  const rate = Number(exchangeRate);

  // Assumption: exchangeRate means how many USD equal 1 EUR on that date.
  if (source === "EUR" && target === "USD") return parsedAmount * rate;
  if (source === "USD" && target === "EUR") return parsedAmount / rate;

  return null;
}

export function convertPricePerUnit({
  price,
  fromUnit,
  toUnit,
  exchangeRate,
  fromCurrency,
  toCurrency,
}) {
  const convertedCurrencyAmount = convertCurrencyAmount({
    amount: price,
    fromCurrency,
    toCurrency,
    exchangeRate,
  });

  if (convertedCurrencyAmount == null) return null;

  const sourceUnit = String(fromUnit || "").toLowerCase();
  const targetUnit = String(toUnit || "").toLowerCase();

  if (sourceUnit === targetUnit) return convertedCurrencyAmount;
  if (sourceUnit === "meter" && targetUnit === "yard") {
    return convertedCurrencyAmount / YARDS_PER_METER;
  }
  if (sourceUnit === "yard" && targetUnit === "meter") {
    return convertedCurrencyAmount * YARDS_PER_METER;
  }

  return null;
}

export function derivePriceConversions(input = {}) {
  const entryDate = input.entryDate ?? input.record_date ?? input.date;
  const exchangeRatesByDate = input.exchangeRatesByDate ?? {};
  const exchangeRate = getExchangeRateForDate({
    exchangeRatesByDate,
    entryDate,
  });
  const price = input.price ?? input.price_per_unit;
  const unit = input.unit ?? input.price_unit;
  const currency = input.currency ?? input.price_currency;

  const priceUsdPerMeter = convertPricePerUnit({
    price,
    fromUnit: unit,
    toUnit: "meter",
    exchangeRate,
    fromCurrency: currency,
    toCurrency: "USD",
  });

  const priceUsdPerYard = convertPricePerUnit({
    price,
    fromUnit: unit,
    toUnit: "yard",
    exchangeRate,
    fromCurrency: currency,
    toCurrency: "USD",
  });

  const priceEurPerMeter = convertPricePerUnit({
    price,
    fromUnit: unit,
    toUnit: "meter",
    exchangeRate,
    fromCurrency: currency,
    toCurrency: "EUR",
  });

  const priceEurPerYard = convertPricePerUnit({
    price,
    fromUnit: unit,
    toUnit: "yard",
    exchangeRate,
    fromCurrency: currency,
    toCurrency: "EUR",
  });

  return {
    entry_date: normalizeDateString(entryDate),
    exchange_rate_eur_to_usd: roundTo(exchangeRate, 6),
    price_usd_per_meter: roundTo(priceUsdPerMeter, 4),
    price_usd_per_yard: roundTo(priceUsdPerYard, 4),
    price_eur_per_meter: roundTo(priceEurPerMeter, 4),
    price_eur_per_yard: roundTo(priceEurPerYard, 4),
  };
}
