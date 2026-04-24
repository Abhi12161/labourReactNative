import { startTransition, useDeferredValue, useMemo, useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { FilterBar } from '../components/FilterBar';
import { InfoPanel } from '../components/InfoPanel';
import { JobCard } from '../components/JobCard';
import { JobPostModal } from '../components/JobPostModal';
import { LabourCard } from '../components/LabourCard';
import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { PrimaryButton } from '../components/PrimaryButton';
import { StatCard } from '../components/StatCard';
import { copy } from '../constants/copy';
import {
    availableLabours,
    customerMessages,
    customerOverviewStats,
    jobPostOptions,
    labourFilterOptions,
    popularSkills,
} from '../data/dashboardData';
import { colors, radius } from '../theme/tokens';
import { filterJobs } from '../utils/filterJobs';

// Initial filter state for customer dashboard
const initialFilters = {
  search: '',
  district: 'All',
  category: 'All',
  availability: 'All',
  rating: 'All',
};

/**
 * CustomerDashboard Component
 *
 * This component renders the dashboard for customers who want to hire labour.
 * It includes:
 * - Overview statistics
 * - Job posting functionality
 * - Labour search and filtering
 * - Posted jobs list
 * - Popular skills display
 * - Notifications and messaging
 */
export function CustomerDashboard({
  language,
  onChangeLanguage,
  onLogout,
  onMarkApplicationsAsSeen,
  onPostJob,
  jobApplications,
  postedJobs,
  session,
}) {
  // Get localized text based on selected language
  const text = copy[language];

  // State for labour filtering
  const [filters, setFilters] = useState(initialFilters);
  const [jobModalVisible, setJobModalVisible] = useState(false);
  const [applicationsModalVisible, setApplicationsModalVisible] = useState(false);
  const [selectedJobForApplications, setSelectedJobForApplications] = useState(null);

  // Deferred search for performance optimization
  const deferredSearch = useDeferredValue(filters.search);

  // Memoized filtered labour list to avoid unnecessary recalculations
  const filteredLabours = useMemo(() => {
    return filterJobs(availableLabours, {
      ...filters,
      search: deferredSearch,
    });
  }, [deferredSearch, filters]);

  // Only show applications for jobs posted by the current customer.
  const customerApplications = useMemo(() => {
    return jobApplications.filter((application) => application.customerEmail === session.user.email);
  }, [jobApplications, session.user.email]);

  // The badge count is kept separate so later it can map directly to an API unread count.
  const unreadApplicationsCount = useMemo(() => {
    return customerApplications.filter((application) => !application.isSeen).length;
  }, [customerApplications]);

  // The modal can show all applications or only the applications for one selected job.
  const visibleApplications = useMemo(() => {
    if (!selectedJobForApplications) {
      return customerApplications;
    }

    return customerApplications.filter(
      (application) => application.jobId === selectedJobForApplications.id,
    );
  }, [customerApplications, selectedJobForApplications]);

  /**
   * Handle filter changes with transition for smooth UI updates
   */
  const handleChangeFilter = (field, value) => {
    startTransition(() => {
      setFilters((current) => ({ ...current, [field]: value }));
    });
  };

  /**
   * Clear all filters and reset to initial state
   */
  const clearFilters = () => {
    startTransition(() => {
      setFilters(initialFilters);
    });
  };

  /**
   * Open the applications modal from the top badge and show all applications together.
   */
  const handleOpenAllApplications = () => {
    setSelectedJobForApplications(null);
    setApplicationsModalVisible(true);

    if (unreadApplicationsCount > 0) {
      onMarkApplicationsAsSeen(session.user.email);
    }
  };

  /**
   * Open the applications modal for one specific posted job.
   * This keeps the modal logic easy to replace with an API-based job-details request later.
   */
  const handleOpenJobApplications = (job) => {
    setSelectedJobForApplications(job);
    setApplicationsModalVisible(true);

    if (unreadApplicationsCount > 0) {
      onMarkApplicationsAsSeen(session.user.email);
    }
  };

  /**
   * Close the applications modal and reset the selected job filter.
   */
  const handleCloseApplicationsModal = () => {
    setApplicationsModalVisible(false);
    setSelectedJobForApplications(null);
  };

  /**
   * Handle job posting from the modal
   * Creates a new job object and adds it to the posted jobs list
   */
  const handlePostJob = (form) => {
    const createdJob = {
      id: `post-${Date.now()}`,
      title: form.title || text.jobTitlePlaceholder,
      location: `${form.city}, Muzaffarpur`,
      posted: text.today,
      applicants: 0,
      distance: 'Nearby',
      description: form.description || text.descriptionPlaceholder,
      customerEmail: session.user.email,
      skill: form.skill,
      skillLevel: form.level,
      time: form.timing,
    };

    onPostJob(createdJob);
    setJobModalVisible(false);
    Alert.alert(text.jobPostedTitle, text.jobPostedBody);
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero section with user greeting and logout */}
      <View style={styles.hero}>
        <View style={styles.heroTop}>
          <View style={styles.heroCopy}>
            <Text style={styles.heroBadge}>{text.customerDashboardBadge}</Text>
            <Text style={styles.heroTitle}>
              {text.hello}, {session.user.name}
            </Text>
            <Text style={styles.heroSubtitle}>{text.customerSubtitle}</Text>
          </View>
          <PrimaryButton label={text.logout} onPress={onLogout} variant="ghost" />
        </View>

        {/* <LanguageSwitcher selected={language} onChange={onChangeLanguage} /> */}

        <View style={styles.profileBar}>
          <Text style={styles.profileText}>{session.user.email}</Text>
          <Text style={styles.profileText}>{session.user.phone}</Text>
        </View>

        {/* Notification badge for new labour applications */}
        <Pressable style={styles.notificationBadge} onPress={handleOpenAllApplications}>
          <Text style={styles.notificationBadgeLabel}>
            Applications {unreadApplicationsCount ? `(${unreadApplicationsCount})` : `(${customerApplications.length})`}
          </Text>
          <Text style={styles.notificationBadgeHint}>
            View details
          </Text>
        </Pressable>
      </View>

      {/* Overview statistics grid */}
      <View style={styles.statsGrid}>
        {customerOverviewStats.map((item) => (
          <StatCard key={item.id} label={text[item.labelKey]} value={item.value} />
        ))}
      </View>

      {/* Information panel about Muzaffarpur focus */}
      <InfoPanel title={text.focusMuzaffarpur} body={text.focusMuzaffarpurBody} tone="accent" />

      {/* Job posting section */}
      <Pressable style={styles.postJobBar} onPress={() => setJobModalVisible(true)}>
        <View>
          <Text style={styles.postJobLabel}>{text.postJobTitle}</Text>
          <Text style={styles.postJobBody}>{text.descriptionPlaceholder}</Text>
        </View>
        <Text style={styles.postJobAction}>{text.postJobOpen}</Text>
      </Pressable>

      {/* Labour filtering controls */}
      <FilterBar
        copy={text}
        filters={filters}
        options={labourFilterOptions}
        onChangeFilter={handleChangeFilter}
        onClear={clearFilters}
      />

      {/* Available labour section header */}
      <View style={styles.jobsHeader}>
        <Text style={styles.jobsTitle}>{text.availableLaboursTitle}</Text>
        <Text style={styles.jobsCount}>{filteredLabours.length}</Text>
      </View>

      {/* Labour cards list */}
      <View style={styles.jobsList}>
        {filteredLabours.length ? (
          filteredLabours.map((labour) => <LabourCard key={labour.id} copy={text} labour={labour} />)
        ) : (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{text.noLabours}</Text>
          </View>
        )}
      </View>

      {/* Popular skills section */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.popularSkillsTitle}</Text>
        <View style={styles.skillRow}>
          {popularSkills.map((skill) => (
            <View key={skill} style={styles.skillChip}>
              <Text style={styles.skillText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Posted jobs section */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.availableJobsTitle}</Text>
        <View style={styles.jobsList}>
          {postedJobs.map((job) => (
            <JobCard
              key={job.id}
              copy={text}
              job={job}
              actionLabel={`Applications (${job.applicants || 0})`}
              onActionPress={() => handleOpenJobApplications(job)}
            />
          ))}
        </View>
      </View>

      {/* Notifications info panel */}
      <InfoPanel title={text.notifyTitle} body={text.notifyCustomer} />

      {/* Messages section */}
      <View style={styles.panel}>
        <Text style={styles.panelTitle}>{text.messengerTitle}</Text>
        <View style={styles.messageList}>
          {customerMessages.map((item) => (
            <View key={item.id} style={styles.messageItem}>
              <Text style={styles.messageName}>{item.name}</Text>
              <Text style={styles.messageText}>{item.text}</Text>
              <Text style={styles.messageStatus}>{item.status}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Job posting modal */}
      <JobPostModal
        copy={text}
        options={jobPostOptions}
        visible={jobModalVisible}
        onClose={() => setJobModalVisible(false)}
        onSubmit={handlePostJob}
      />

      {/* Applications modal used by both the top badge and each job card's application button */}
      <Modal
        animationType="slide"
        transparent
        visible={applicationsModalVisible}
        onRequestClose={handleCloseApplicationsModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderCopy}>
                <Text style={styles.panelTitle}>
                  {selectedJobForApplications
                    ? `${selectedJobForApplications.title} applications`
                    : 'Labour applications'}
                </Text>
                <Text style={styles.modalSubtitle}>
                  {selectedJobForApplications
                    ? 'This list shows the labour who applied for the selected job.'
                    : 'This list shows all labour applications for your posted jobs.'}
                </Text>
              </View>
              <PrimaryButton label={text.close} onPress={handleCloseApplicationsModal} variant="ghost" />
            </View>

            <ScrollView contentContainerStyle={styles.modalBody} showsVerticalScrollIndicator={false}>
              {visibleApplications.length ? (
                visibleApplications.map((application) => (
                  <View key={application.id} style={styles.applicationCard}>
                    <View style={styles.applicationHeader}>
                      <Text style={styles.messageName}>{application.labourName}</Text>
                      <Text style={styles.applicationTime}>{application.appliedAt}</Text>
                    </View>
                    <Text style={styles.messageText}>Applied for: {application.jobTitle}</Text>
                    <Text style={styles.messageText}>Role: {application.labourTitle}</Text>
                    <Text style={styles.messageText}>Phone: {application.labourPhone}</Text>
                    <Text style={styles.messageText}>Location: {application.labourLocation}</Text>
                    <Text style={styles.messageText}>
                      Skills: {application.labourSkills.join(', ')}
                    </Text>
                    <Text style={styles.messageStatus}>Rating {application.labourRating}</Text>
                  </View>
                ))
              ) : (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyText}>
                    No labour applications yet. Once a labour applies, details will appear here.
                  </Text>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

// Styles for the CustomerDashboard component
const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 36,
    gap: 18,
  },
  hero: {
    backgroundColor: colors.hero,
    borderRadius: radius.xl,
    padding: 24,
    gap: 18,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  heroCopy: {
    flex: 1,
    gap: 8,
  },
  heroBadge: {
    // alignSelf: 'flex-start',
    backgroundColor: colors.accent,
    color: colors.panel,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '800',
    maxWidth:135
  },
  heroTitle: {
    color: colors.panel,
    fontSize: 28,
    lineHeight: 36,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#d9e6e0',
    fontSize: 15,
    lineHeight: 24,
  },
  profileBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  notificationBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 2,
  },
  notificationBadgeLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  notificationBadgeHint: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  profileText: {
    color: '#d9e6e0',
    fontSize: 13,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  postJobBar: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 10px 18px rgba(18, 35, 32, 0.08)',
  },
  postJobLabel: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  postJobBody: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 20,
  },
  postJobAction: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: '700',
  },
  jobsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 12,
  },
  jobsTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  jobsCount: {
    color: colors.textMuted,
    fontSize: 14,
    fontWeight: '700',
  },
  jobsList: {
    gap: 12,
  },
  emptyCard: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 10px 18px rgba(18, 35, 32, 0.08)',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  panel: {
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
    boxShadow: '0 10px 18px rgba(18, 35, 32, 0.08)',
  },
  panelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(18, 35, 32, 0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    maxHeight: '80%',
    backgroundColor: colors.panel,
    borderRadius: radius.xl,
    padding: 20,
    gap: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 12,
  },
  modalHeaderCopy: {
    flex: 1,
    gap: 6,
  },
  modalSubtitle: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  modalBody: {
    gap: 12,
  },
  skillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  skillText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  messageList: {
    gap: 12,
  },
  messageItem: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.md,
    padding: 16,
    gap: 8,
  },
  applicationCard: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.md,
    padding: 16,
    gap: 8,
  },
  applicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  applicationTime: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  messageName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  messageText: {
    color: colors.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  messageStatus: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
