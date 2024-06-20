// Data likelihood from your calculations
const likelihood = {
  fraudulent: {
    telecommuting: { 0: 0.958681086, 1: 0.041318914 },
    has_company_logo: { 0: 0.926096998, 1: 0.073903002 },
    has_questions: { 0: 0.711316397, 1: 0.288683603 },
    employment_type: {
      Other: { 0: 0.017321016, 1: 0.012460327 },
      'Full-time': { 0: 0.565819861, 1: 0.654167156 },
      empty: { 0: 0.278290993, 1: 0.189843658 },
      'Part-time': { 0: 0.085450346, 1: 0.042494416 },
      Contract: { 0: 0.050808314, 1: 0.086987187 },
      Temporary: { 0: 0.002309469, 1: 0.014047255 },
    },
    required_experience: {
      Internship: { 0: 0.011547344, 1: 0.021805572 },
      'Not Applicable': { 0: 0.069284065, 1: 0.062066533 },
      empty: { 0: 0.502309469, 1: 0.388797461 },
      'Mid-Senior level': { 0: 0.130484988, 1: 0.217232867 },
      Associate: { 0: 0.048498845, 1: 0.13253791 },
      'Entry level': { 0: 0.20669746, 1: 0.147995768 },
      Executive: { 0: 0.011547344, 1: 0.007699542 },
      Director: { 0: 0.019630485, 1: 0.021864347 },
    },
    required_education: {
      empty: { 0: 0.518987342, 1: 0.449944154 },
      "Bachelor's Degree": { 0: 0.115074799, 1: 0.296572806 },
      "Master's Degree": { 0: 0.035673188, 1: 0.022632414 },
      'High School or equivalent': { 0: 0.195627158, 1: 0.112280289 },
      Unspecified: { 0: 0.070195627, 1: 0.078537417 },
      'Some College Coursework Completed': { 0: 0.003452244, 1: 0.005819764 },
      Vocational: { 0: 0.001150748, 1: 0.002821704 },
      Certification: { 0: 0.021864212, 1: 0.008876609 },
      'Associate Degree': { 0: 0.006904488, 1: 0.015754512 },
      Professional: { 0: 0.004602992, 1: 0.004114984 },
      Doctorate: { 0: 0.001150748, 1: 0.001469637 },
      'Some High School Coursework': { 0: 0.02301496, 1: 0.000411498 },
      'Vocational - Degree': { 0: 0.001150748, 1: 0.000293927 },
      'Vocational - HS Diploma': { 0: 0.001150748, 1: 0.000470284 },
    },
  },
};

// Example prior probability (you need to define this based on your data)
const priorProbability = {
  fraudulent: 0.048434004,
  not_fraudulent: 1 - 0.048434004,
};

// Function to calculate posterior probability
function calculatePosteriorProbability(data) {
  const posterior = {
    fraudulent: 1,
    not_fraudulent: 1,
  };

  // Calculate posterior probability for fraudulent and not fraudulent classes
  // Example of handling missing likelihood values with Laplace smoothing
  const laplaceSmoothing = 0.01; // Small constant for Laplace smoothing

  for (const cls of ['fraudulent', 'not_fraudulent']) {
    for (const feature of Object.keys(data)) {
      if (
        likelihood[cls] &&
        likelihood[cls][feature] &&
        likelihood[cls][feature][data[feature]] !== undefined
      ) {
        posterior[cls] *= likelihood[cls][feature][data[feature]];
      } else {
        posterior[cls] *= laplaceSmoothing; // Apply Laplace smoothing
      }
    }
    posterior[cls] *= priorProbability[cls];
  }

  // Normalize by dividing by the sum of probabilities
  const total = posterior.fraudulent + posterior.not_fraudulent;
  if (total !== 0) {
    // Ensure total is not zero to avoid division by zero
    posterior.fraudulent /= total;
    posterior.not_fraudulent /= total;
  }

  return posterior;
}

// Example data to calculate posterior probability
const dataExample = {
  telecommuting: 0,
  has_company_logo: 1,
  has_questions: 0,
  employment_type: 'Contract',
  required_experience: 'Mid-Senior level',
  required_education: 'Some High School Coursework',
};

// Calculate posterior probability
const result = calculatePosteriorProbability(dataExample);
console.log(result);
