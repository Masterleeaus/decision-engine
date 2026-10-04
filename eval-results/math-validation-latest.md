# Simulated confidence and ranking math validation

- Date: 2026-10-04T03:49:19.703Z
- Seed: 20261004
- Training outcomes: 60000
- Held-out outcomes: 40000

## Confidence calibration

| Metric | Raw | Calibrated | Improvement |
| --- | ---: | ---: | ---: |
| Brier score (lower is better) | 0.14704 | 0.13945656 | 0.00758344 |
| Expected calibration error (lower is better) | 0.06975 | 0.00696667 | 0.06278333 |

## Ranking method comparison

- Confidence-adjusted weighted ranking: option-c → option-b → option-f → option-e → option-d → option-g → option-a
- TOPSIS: option-c → option-b → option-f → option-e → option-d → option-g → option-a
- Top choice agrees: true
- Kendall tau: 1

This is a deterministic simulation, not a field calibration claim. The ranking comparison uses one synthetic seven-option fixture; it measures agreement rather than declaring either method universally correct.

Overall: **PASS**
