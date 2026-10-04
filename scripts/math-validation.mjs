import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

import { calibrateConfidence } from "../engines/23-confidence-engine/runtime/confidenceEngine.ts";
import { rankAlternatives } from "../engines/20-ranking-engine/runtime/rankingEngine.ts";

const seed = Number(process.env.MATH_VALIDATION_SEED ?? 20261004);
const levels = [0.1, 0.3, 0.5, 0.7, 0.9];
const trueRates = [0.04, 0.16, 0.38, 0.68, 0.91];
const trainingPerLevel = 12000;
const evaluationPerLevel = 8000;

function randomGenerator(initialSeed) {
  let state = initialSeed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 0x100000000;
  };
}

function simulateOutcomes(perLevel, initialSeed) {
  const random = randomGenerator(initialSeed);
  return levels.map((predicted, index) => {
    let successes = 0;
    for (let sample = 0; sample < perLevel; sample += 1) {
      if (random() < trueRates[index]) successes += 1;
    }
    return {
      predicted,
      true_probability: trueRates[index],
      successes,
      sample_count: perLevel,
      observed_success: successes / perLevel,
    };
  });
}

function evaluateCalibration(profile, perLevel) {
  const random = randomGenerator(seed ^ 0xa51ce);
  let brierRaw = 0;
  let brierCalibrated = 0;
  let total = 0;
  const buckets = levels.map((predicted, index) => {
    const calibrated = calibrateConfidence("math-validation-company", predicted, profile, "simulated-outcome");
    let successes = 0;
    for (let sample = 0; sample < perLevel; sample += 1) {
      const observed = random() < trueRates[index] ? 1 : 0;
      const label = observed ? 1 : 0;
      successes += label;
      brierRaw += (predicted - label) ** 2;
      brierCalibrated += (calibrated.calibrated_confidence - label) ** 2;
      total += 1;
    }
    return {
      prediction: predicted,
      calibrated_prediction: calibrated.calibrated_confidence,
      observed_rate: successes / perLevel,
      sample_count: perLevel,
    };
  });

  const ece = (field) => buckets.reduce((sum, bucket) => (
    sum + (bucket.sample_count / total) * Math.abs(bucket.observed_rate - bucket[field])
  ), 0);

  return {
    brier_raw: Number((brierRaw / total).toFixed(8)),
    brier_calibrated: Number((brierCalibrated / total).toFixed(8)),
    ece_raw: Number(ece("prediction").toFixed(8)),
    ece_calibrated: Number(ece("calibrated_prediction").toFixed(8)),
    evaluation_count: total,
    buckets,
  };
}

function topsis(alternatives, dimensions) {
  const vectorLengths = Object.fromEntries(dimensions.map((dimension) => [
    dimension.dimension_id,
    Math.sqrt(alternatives.reduce((sum, option) => {
      const value = option.measurements.find((measurement) => measurement.dimension_id === dimension.dimension_id)?.normalized_score ?? 0;
      return sum + value * value;
    }, 0)),
  ]));
  const normalized = alternatives.map((option) => {
    const weighted = Object.fromEntries(dimensions.map((dimension) => {
      const raw = option.measurements.find((measurement) => measurement.dimension_id === dimension.dimension_id)?.normalized_score ?? 0;
      const length = vectorLengths[dimension.dimension_id] || 1;
      return [dimension.dimension_id, (raw / length) * dimension.weight];
    }));
    return { option_id: option.option_id, weighted };
  });
  const positive = Object.fromEntries(dimensions.map((dimension) => [
    dimension.dimension_id,
    Math.max(...normalized.map((option) => option.weighted[dimension.dimension_id])),
  ]));
  const negative = Object.fromEntries(dimensions.map((dimension) => [
    dimension.dimension_id,
    Math.min(...normalized.map((option) => option.weighted[dimension.dimension_id])),
  ]));

  return normalized.map((option) => {
    const distancePositive = Math.sqrt(dimensions.reduce((sum, dimension) => (
      sum + (option.weighted[dimension.dimension_id] - positive[dimension.dimension_id]) ** 2
    ), 0));
    const distanceNegative = Math.sqrt(dimensions.reduce((sum, dimension) => (
      sum + (option.weighted[dimension.dimension_id] - negative[dimension.dimension_id]) ** 2
    ), 0));
    return {
      option_id: option.option_id,
      score: distancePositive + distanceNegative === 0 ? 0 : distanceNegative / (distancePositive + distanceNegative),
    };
  }).sort((left, right) => right.score - left.score || left.option_id.localeCompare(right.option_id));
}

function kendallTau(left, right) {
  const position = new Map(right.map((id, index) => [id, index]));
  let concordant = 0;
  let discordant = 0;
  for (let first = 0; first < left.length; first += 1) {
    for (let second = first + 1; second < left.length; second += 1) {
      if (position.get(left[first]) < position.get(left[second])) concordant += 1;
      else discordant += 1;
    }
  }
  const pairs = concordant + discordant;
  return pairs ? Number(((concordant - discordant) / pairs).toFixed(6)) : 1;
}

const training = simulateOutcomes(trainingPerLevel, seed);
const profile = {
  profile_id: "simulated-calibration-" + seed,
  company_id: "math-validation-company",
  decision_scope: "simulated-outcome",
  revision: 1,
  created_at: "2026-10-04T00:00:00.000Z",
  bins: levels.map((prediction, index) => ({
    lower: index === 0 ? 0 : (levels[index - 1] + prediction) / 2,
    upper: index === levels.length - 1 ? 1 : (prediction + levels[index + 1]) / 2,
    observed_success: training[index].observed_success,
    sample_count: training[index].sample_count,
  })),
};
const calibration = evaluateCalibration(profile, evaluationPerLevel);

const dimensions = [
  { dimension_id: "dim-reliability", name: "reliability", weight: 0.3 },
  { dimension_id: "dim-cost", name: "cost", weight: 0.25 },
  { dimension_id: "dim-sustainability", name: "sustainability", weight: 0.2 },
  { dimension_id: "dim-quality", name: "quality", weight: 0.15 },
  { dimension_id: "dim-reversibility", name: "reversibility", weight: 0.1 },
];
const scoreRows = [
  ["option-a", [0.94, 0.35, 0.45, 0.92, 0.25]],
  ["option-b", [0.8, 0.78, 0.82, 0.78, 0.72]],
  ["option-c", [0.65, 0.96, 0.92, 0.62, 0.95]],
  ["option-d", [0.88, 0.58, 0.54, 0.86, 0.47]],
  ["option-e", [0.74, 0.68, 0.72, 0.91, 0.62]],
  ["option-f", [0.57, 0.88, 0.84, 0.72, 0.86]],
  ["option-g", [0.91, 0.42, 0.77, 0.69, 0.55]],
];
const alternatives = scoreRows.map(([option_id, values]) => ({
  option_id,
  title: option_id,
  eligible: true,
  coverage: 1,
  measurements: dimensions.map((dimension, index) => ({
    dimension_id: dimension.dimension_id,
    normalized_score: values[index],
    confidence: 1,
    evidence_refs: ["synthetic:" + option_id + ":" + dimension.name],
  })),
}));
const comparison = {
  comparison_id: "math-validation-topsis-fixture",
  company_id: "math-validation-company",
  decision_subject_id: "topsis-fixture",
  dimensions,
  alternatives,
};
const engineRanking = rankAlternatives(comparison.company_id, comparison.decision_subject_id, comparison, {
  created_at: "2026-10-04T00:00:00.000Z",
});
const topsisRanking = topsis(alternatives, dimensions);
const engineOrder = engineRanking.ranked_alternatives.map((row) => row.option_id);
const topsisOrder = topsisRanking.map((row) => row.option_id);
const report = {
  schema_version: 1,
  evaluated_at: new Date().toISOString(),
  seed,
  training_count: trainingPerLevel * levels.length,
  evaluation_count: calibration.evaluation_count,
  calibration_simulation: {
    generator: "seeded Bernoulli outcomes with fixed per-bin true success probabilities",
    training_per_probability_bin: trainingPerLevel,
    evaluation_per_probability_bin: evaluationPerLevel,
    training_buckets: training,
    evaluation_buckets: calibration.buckets,
    metrics: {
      brier_score: {
        raw: calibration.brier_raw,
        calibrated: calibration.brier_calibrated,
        improvement: Number((calibration.brier_raw - calibration.brier_calibrated).toFixed(8)),
      },
      expected_calibration_error: {
        raw: calibration.ece_raw,
        calibrated: calibration.ece_calibrated,
        improvement: Number((calibration.ece_raw - calibration.ece_calibrated).toFixed(8)),
        bins: levels.length,
      },
    },
    passed: calibration.brier_calibrated < calibration.brier_raw &&
      calibration.ece_calibrated < calibration.ece_raw,
  },
  ranking_comparison: {
    fixture: "seven synthetic alternatives across five benefit-oriented normalized dimensions",
    engine_method: "confidence-adjusted weighted arithmetic ranking",
    reference_method: "TOPSIS with vector normalization and weighted Euclidean distances",
    engine_order: engineOrder,
    topsis_order: topsisOrder,
    engine_top: engineOrder[0],
    topsis_top: topsisOrder[0],
    top_choice_agrees: engineOrder[0] === topsisOrder[0],
    kendall_tau: kendallTau(engineOrder, topsisOrder),
    interpretation: "Method comparison only; differing rankings are reported and are not treated as a defect.",
  },
  passed: calibration.brier_calibrated < calibration.brier_raw &&
    calibration.ece_calibrated < calibration.ece_raw,
};

const outputDirectory = resolve(process.cwd(), "eval-results");
mkdirSync(outputDirectory, { recursive: true });
writeFileSync(resolve(outputDirectory, "math-validation-latest.json"), JSON.stringify(report, null, 2) + "\n");
const markdown = [
  "# Simulated confidence and ranking math validation",
  "",
  "- Date: " + report.evaluated_at,
  "- Seed: " + report.seed,
  "- Training outcomes: " + report.training_count,
  "- Held-out outcomes: " + report.evaluation_count,
  "",
  "## Confidence calibration",
  "",
  "| Metric | Raw | Calibrated | Improvement |",
  "| --- | ---: | ---: | ---: |",
  "| Brier score (lower is better) | " + calibration.brier_raw + " | " + calibration.brier_calibrated + " | " + report.calibration_simulation.metrics.brier_score.improvement + " |",
  "| Expected calibration error (lower is better) | " + calibration.ece_raw + " | " + calibration.ece_calibrated + " | " + report.calibration_simulation.metrics.expected_calibration_error.improvement + " |",
  "",
  "## Ranking method comparison",
  "",
  "- Confidence-adjusted weighted ranking: " + engineOrder.join(" → "),
  "- TOPSIS: " + topsisOrder.join(" → "),
  "- Top choice agrees: " + report.ranking_comparison.top_choice_agrees,
  "- Kendall tau: " + report.ranking_comparison.kendall_tau,
  "",
  "This is a deterministic simulation, not a field calibration claim. The ranking comparison uses one synthetic seven-option fixture; it measures agreement rather than declaring either method universally correct.",
  "",
  "Overall: **" + (report.passed ? "PASS" : "FAIL") + "**",
].join("\n") + "\n";
writeFileSync(resolve(outputDirectory, "math-validation-latest.md"), markdown);
console.log(markdown);
if (!report.passed) process.exitCode = 1;
