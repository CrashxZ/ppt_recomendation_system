export function normalizeWeights(weights) {
  const total = Object.values(weights).reduce((sum, value) => sum + value, 0);

  if (!total) {
    return Object.fromEntries(Object.keys(weights).map((key) => [key, 0]));
  }

  return Object.fromEntries(
    Object.entries(weights).map(([key, value]) => [key, value / total]),
  );
}

export function scoreTechniques(techniques, weights, application, datasetType) {
  const normalized = normalizeWeights(weights);

  return techniques
    .filter(
      (technique) =>
        technique.bestFor.includes(application) && technique.dataTypes.includes(datasetType),
    )
    .map((technique) => {
      const weightedScore = Object.entries(normalized).reduce(
        (sum, [metric, weight]) => sum + technique.scores[metric] * weight,
        0,
      );

      return {
        ...technique,
        weightedScore,
      };
    })
    .sort((left, right) => right.weightedScore - left.weightedScore);
}

export function calculateParetoFront(techniques) {
  return techniques.filter((candidate) => {
    const dominated = techniques.some((other) => {
      if (other.id === candidate.id) {
        return false;
      }

      const metricIds = Object.keys(candidate.scores);
      const noWorse = metricIds.every((metric) => other.scores[metric] >= candidate.scores[metric]);
      const strictlyBetter = metricIds.some((metric) => other.scores[metric] > candidate.scores[metric]);

      return noWorse && strictlyBetter;
    });

    return !dominated;
  });
}
