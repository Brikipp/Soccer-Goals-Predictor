// src/services/predictionEngine.ts

export interface Match {
  id: string;
  home_team: string;
  away_team: string;
  league: string;
  match_date: string;
  home_avg_goals: number;
  away_avg_goals: number;
  home_form: number[];
  away_form: number[];
  h2h_history: number[];
  status: string;
}

export interface Prediction {
  totalGoals: number;
  homeGoals: number;
  awayGoals: number;
  confidence: number;
  range: {
    min: number;
    max: number;
  };
}

/**
 * Calculate prediction for a match
 * This uses a simplified Poisson-based approach
 */
export function calculatePrediction(match: Match): Prediction {
  // Constants for weighting different factors
  const HOME_ADVANTAGE = 0.35;
  const FORM_WEIGHT = 0.4;
  const AVG_GOALS_WEIGHT = 0.5;
  const H2H_WEIGHT = 0.3;

  // Calculate recent form (percentage of wins)
  const calculateForm = (form: number[]): number => {
    if (form.length === 0) return 0.5;
    return form.reduce((a, b) => a + b, 0) / form.length;
  };

  const homeForm = calculateForm(match.home_form);
  const awayForm = calculateForm(match.away_form);

  // Calculate expected goals for home team
  let homeExpectedGoals =
    match.home_avg_goals * AVG_GOALS_WEIGHT +
    homeForm * FORM_WEIGHT * 2.5 +
    HOME_ADVANTAGE;

  // Calculate expected goals for away team
  let awayExpectedGoals =
    match.away_avg_goals * AVG_GOALS_WEIGHT +
    awayForm * FORM_WEIGHT * 2.0;

  // Factor in head-to-head history if available
  if (match.h2h_history && match.h2h_history.length > 0) {
    const h2hAvg =
      match.h2h_history.reduce((a, b) => a + b, 0) / match.h2h_history.length;
    const currentTotal = homeExpectedGoals + awayExpectedGoals;
    
    // Blend current prediction with H2H average
    const adjustedTotal =
      currentTotal * (1 - H2H_WEIGHT) + h2hAvg * H2H_WEIGHT;
    const ratio = adjustedTotal / currentTotal;
    
    homeExpectedGoals *= ratio;
    awayExpectedGoals *= ratio;
  }

  const totalGoals = homeExpectedGoals + awayExpectedGoals;

  // Calculate confidence based on data quality
  let confidence = 0.7; // Base confidence

  // More games = higher confidence
  const totalGames = match.home_form.length;
  if (totalGames >= 5) confidence += 0.05;
  if (totalGames >= 10) confidence += 0.05;

  // H2H data increases confidence
  if (match.h2h_history && match.h2h_history.length >= 3) {
    confidence += 0.08;
  }

  // Form consistency increases confidence
  const formDifference = Math.abs(homeForm - awayForm);
  if (formDifference < 0.3) confidence += 0.05;

  // Cap confidence between 0.5 and 0.95
  confidence = Math.min(0.95, Math.max(0.5, confidence));

  return {
    totalGoals: Number(totalGoals.toFixed(1)),
    homeGoals: Number(homeExpectedGoals.toFixed(1)),
    awayGoals: Number(awayExpectedGoals.toFixed(1)),
    confidence: Number(confidence.toFixed(2)),
    range: {
      min: Number((totalGoals * 0.75).toFixed(1)),
      max: Number((totalGoals * 1.25).toFixed(1)),
    },
  };
}

/**
 * Calculate accuracy of prediction vs actual result
 */
export function calculateAccuracy(
  predicted: number,
  actual: number
): number {
  const difference = Math.abs(predicted - actual);

  if (difference === 0) return 100;
  if (difference <= 0.5) return 95;
  if (difference <= 1) return 85;
  if (difference <= 1.5) return 70;
  if (difference <= 2) return 55;

  return Math.max(0, 50 - difference * 10);
}

/**
 * Format confidence as percentage string
 */
export function formatConfidence(confidence: number): string {
  return `${(confidence * 100).toFixed(0)}%`;
}

/**
 * Get confidence level label
 */
export function getConfidenceLevel(confidence: number): string {
  if (confidence >= 0.85) return 'Very High';
  if (confidence >= 0.75) return 'High';
  if (confidence >= 0.65) return 'Medium';
  return 'Low';
}

/**
 * Get color for confidence level
 */
export function getConfidenceColor(confidence: number): string {
  if (confidence >= 0.8) return 'green';
  if (confidence >= 0.7) return 'yellow';
  return 'orange';
}