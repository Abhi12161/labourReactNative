import {
  availableLabours,
  customerMessages,
  customerOverviewStats,
  initialPostedJobs,
  jobPostOptions,
  labourMessages,
  labourOverviewStats,
  labourProfile,
  labourReviews,
  labourWorkHistory,
  labourFilterOptions,
  popularSkills,
} from '../data/dashboardData';
import { buildAreaLocation, normalizeAppLocation } from './appLocation';

const nearbyAreas = ['Motijheel', 'Bela', 'Kalyani', 'Aghoria Bazar'];

/**
 * Generate all dashboard dummy data from the currently captured location.
 * Later this can be replaced by API data without changing the screen contracts much.
 */
export function getDashboardLocationData(appLocation) {
  const location = normalizeAppLocation(appLocation);

  return {
    customerOverviewStats,
    labourOverviewStats,
    customerMessages,
    labourMessages,
    labourReviews,
    labourWorkHistory,
    popularSkills,
    labourFilterOptions: {
      ...labourFilterOptions,
      district: ['All', location.city, ...nearbyAreas],
    },
    jobPostOptions: {
      ...jobPostOptions,
      cities: [location.city, ...nearbyAreas],
    },
    availableLabours: availableLabours.map((labour, index) => {
      const area = nearbyAreas[index % nearbyAreas.length] || location.city;

      return {
        ...labour,
        location: buildAreaLocation(area, location),
      };
    }),
    initialPostedJobs: initialPostedJobs.map((job, index) => {
      const area = nearbyAreas[index % nearbyAreas.length] || location.city;

      return {
        ...job,
        location: buildAreaLocation(area, location),
      };
    }),
    labourProfile: {
      ...labourProfile,
      location: `${location.city}, ${location.region}`,
      preferences: [
        labourProfile.preferences[0],
        labourProfile.preferences[1],
        `${nearbyAreas[0]} and ${nearbyAreas[1]} Preferred`,
      ],
    },
  };
}
