// Check if a questions object has any content
export function hasQuestionsContent(data: any): boolean {
  if (!data || typeof data !== 'object') return false;

  for (const key in data) {
    const value = data[key];
    if (value === null || value === undefined) continue;
    if (value === '' || value === false) continue;
    if (Array.isArray(value) && value.length === 0) continue;
    return true;
  }
  return false;
}

// Get sections that have content for anchor navigation
export function getSectionsWithContent(data: any, sectionIds: string[]): string[] {
  if (!data || typeof data !== 'object') return [];

  return sectionIds.filter(sectionId => {
    // Map section ID to possible field names
    const fieldPatterns = [
      new RegExp(`^${sectionId}`, 'i'),
      new RegExp(sectionId, 'i'),
    ];

    for (const key in data) {
      const value = data[key];
      if (fieldPatterns.some(pattern => pattern.test(key))) {
        if (value !== null && value !== undefined && value !== '' && value !== false && !(Array.isArray(value) && value.length === 0)) {
          return true;
        }
      }
    }
    return false;
  });
}
