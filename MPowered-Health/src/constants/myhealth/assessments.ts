/** 
 * Only load 18 months worth of weekly check-ins (about 80 rows)
 * Database cleanup scripts responsible for enforcing older assessments deleted
*/
export const MAX_ASSESSMENTS = 500;