import { useState } from 'react';
import { SafeAreaView, StatusBar, StyleSheet } from 'react-native';

import { initialPostedJobs } from '../data/dashboardData';
import { AuthScreen } from '../screens/AuthScreen';
import DashboardScreen from '../screens/DashboardScreen';
import { RoleSelectionScreen } from '../screens/RoleSelectionScreen';
import { colors } from '../theme/tokens';

export default function RootApp() {
  const [language, setLanguage] = useState('en');
  const [session, setSession] = useState(null);
  const [selectedRole, setSelectedRole] = useState(null);
  const [postedJobs, setPostedJobs] = useState(initialPostedJobs);
  const [jobApplications, setJobApplications] = useState([]);

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
          language={language}
          onChangeLanguage={setLanguage}
          onAuthenticated={handleAuthenticated}
          preSelectedRole={selectedRole}
          onBack={() => setSelectedRole(null)}
        />
      ) : (
        <RoleSelectionScreen
          language={language}
          onChangeLanguage={setLanguage}
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
