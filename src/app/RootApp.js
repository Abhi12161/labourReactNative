import { useCallback, useEffect, useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';

import { AuthScreen } from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import { colors } from '../theme/tokens';
import { DEFAULT_APP_LOCATION, normalizeAppLocation } from '../utils/appLocation';
import { getDashboardLocationData } from '../utils/dashboardLocationData';

export default function RootApp() {
  const [language, setLanguage] = useState('en');
  const [session, setSession] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [appLocation, setAppLocation] = useState(DEFAULT_APP_LOCATION);
  const [postedJobs, setPostedJobs] = useState(
    getDashboardLocationData(DEFAULT_APP_LOCATION).initialPostedJobs,
  );
  const [jobApplications, setJobApplications] = useState([]);

  useEffect(() => {
    // Refresh the seeded demo jobs when the detected location changes before the user starts posting.
    if (!session) {
      setPostedJobs(getDashboardLocationData(appLocation).initialPostedJobs);
    }
  }, [appLocation, session]);

  // Keep the posted job shape close to what an API would return later.
  const addPostedJob = (job) => {
    setPostedJobs((current) => [job, ...current]);
  };

  // Store one lightweight application record so the flow is easy to replace with an API call later.
  const addJobApplication = ({ job, labour, customerEmail }) => {
    let isDuplicate = false;

    setJobApplications((current) => {
      const alreadyExists = current.some(
        (application) => application.jobId === job.id && application.labourId === labour.id,
      );

      if (alreadyExists) {
        isDuplicate = true;
        return current;
      }

      const nextApplication = {
        id: `application-${Date.now()}`,
        jobId: job.id,
        jobTitle: job.title,
        customerEmail,
        labourId: labour.id,
        labourName: labour.name,
        labourPhone: labour.phone,
        labourTitle: labour.title,
        labourLocation: labour.location,
        labourRating: labour.rating,
        labourSkills: labour.skills,
        appliedAt: 'Just now',
        isSeen: false,
      };

      return [nextApplication, ...current];
    });

    if (isDuplicate) {
      return false;
    }

    // Update the matching job card immediately so the customer sees live applicant counts.
    setPostedJobs((current) =>
      current.map((postedJob) =>
        postedJob.id === job.id
          ? { ...postedJob, applicants: (postedJob.applicants || 0) + 1 }
          : postedJob,
      ),
    );

    return true;
  };

  // Mark the customer's notifications as read when they open the applicant panel.
  const markApplicationsAsSeen = (customerEmail) => {
    setJobApplications((current) =>
      current.map((application) =>
        application.customerEmail === customerEmail
          ? { ...application, isSeen: true }
          : application,
      ),
    );
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleLocationDetected = useCallback((location) => {
    setAppLocation(normalizeAppLocation(location));
  }, []);

  const handleAuthenticated = (sessionData) => {
    setSession(sessionData);
  };

  const handleLogout = () => {
    setSession(null);
    setSelectedRole(null);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" />
      {session ? (
        <DashboardScreen
          appLocation={appLocation}
          jobApplications={jobApplications}
          postedJobs={postedJobs}
          language={language}
          session={session}
          onApplyToJob={addJobApplication}
          onChangeLanguage={setLanguage}
          onMarkApplicationsAsSeen={markApplicationsAsSeen}
          onPostJob={addPostedJob}
          onLogout={handleLogout}
        />
      ) : selectedRole ? (
        <AuthScreen
          appLocation={appLocation}
          language={language}
          onChangeLanguage={setLanguage}
          onAuthenticated={handleAuthenticated}
          preSelectedRole={selectedRole}
          onBack={() => setSelectedRole(null)}
        />
      ) : (
        <RoleSelectionScreen
          appLocation={appLocation}
          language={language}
          onChangeLanguage={setLanguage}
          onLocationDetected={handleLocationDetected}
          onSelectRole={handleRoleSelect}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.page,
  },
});
