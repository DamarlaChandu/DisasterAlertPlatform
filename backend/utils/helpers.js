// Priority detection using keywords
const severityKeywords = {
  critical: ['death', 'died', 'casualties', 'mass', 'emergency', 'urgent', 'help', 'desperate'],
  high: ['injured', 'fire', 'trapped', 'collapsed', 'damaged', 'destroyed', 'critical'],
  medium: ['water', 'flood', 'rain', 'blocked', 'isolated', 'affected'],
  low: ['minor', 'small', 'light', 'slight'],
};

export const detectSeverity = (text) => {
  const lowerText = text.toLowerCase();

  for (const [severity, keywords] of Object.entries(severityKeywords)) {
    if (keywords.some((keyword) => lowerText.includes(keyword))) {
      return severity;
    }
  }

  return 'medium';
};

export const extractKeywords = (text) => {
  const keywords = [];
  const lowerText = text.toLowerCase();

  for (const keywordArray of Object.values(severityKeywords)) {
    for (const keyword of keywordArray) {
      if (lowerText.includes(keyword)) {
        keywords.push(keyword);
      }
    }
  }

  return [...new Set(keywords)];
};

// Calculate distance between two geo points (Haversine formula)
export const calculateDistance = (coord1, coord2) => {
  const [lon1, lat1] = coord1;
  const [lon2, lat2] = coord2;

  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
};
