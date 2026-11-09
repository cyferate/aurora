/** Returns the current meteorological season based on month (Northern Hemisphere). */
export type Season = 'winter' | 'spring' | 'summer' | 'autumn'

export function useSeason(): Season {
  const month = new Date().getMonth() // 0 = Jan
  if (month === 11 || month <= 1) return 'winter'  // Dec Jan Feb
  if (month >= 2 && month <= 4)   return 'spring'  // Mar Apr May
  if (month >= 5 && month <= 7)   return 'summer'  // Jun Jul Aug
  return 'autumn'                                   // Sep Oct Nov
}
