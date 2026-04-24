import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { LanguageSwitcher } from '../components/LanguageSwitcher';
import { copy } from '../constants/copy';
import { colors, radius } from '../theme/tokens';
import { getLocationAwareCopy, normalizeAppLocation } from '../utils/appLocation';

export function RoleSelectionScreen({
  appLocation,
  language,
  onChangeLanguage,
  onLocationDetected,
  onSelectRole,
}) {
  const [locationError, setLocationError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const text = getLocationAwareCopy(copy[language], appLocation);

  const roles = [
    {
      key: 'customer',
      title: text.needWorkers || 'I need workers',
      description:
        text.customerRoleDescription ||
        'Post your project details and quickly connect with helpers, electricians, plumbers, and more in your area.',
      cta: text.startHiring || 'Start Hiring',
      icon: 'C',
      eyebrow: 'For Customers',
      gradient: ['#1a6b57', '#0f473e'],
      glow: 'rgba(23, 109, 89, 0.22)',
    },
    {
      key: 'labour',
      title: text.offerServices || 'I offer services',
      description:
        text.labourRoleDescription ||
        'Build a strong profile for your work, highlight your skills, and get discovered by nearby customers.',
      cta: text.signUpWorker || 'Sign up as a worker',
      icon: 'L',
      eyebrow: 'For Workers',
      gradient: ['#d7861e', '#9b5d11'],
      glow: 'rgba(215, 134, 30, 0.22)',
    },
  ];

  useEffect(() => {
    let isMounted = true;

    const getLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== 'granted') {
          if (isMounted) {
            setLocationError('Location permission was denied. Using your default service area.');
            setLocationLoading(false);
          }
          return;
        }

        const { coords } = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

        const geocode = await Location.reverseGeocodeAsync({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });

        const detectedAddress = geocode[0];
        const nextLocation = normalizeAppLocation({
          city: detectedAddress?.city || detectedAddress?.subregion,
          region: detectedAddress?.region,
          country: detectedAddress?.country,
          displayName:
            detectedAddress?.city || detectedAddress?.subregion || detectedAddress?.region,
        });

        if (isMounted) {
          onLocationDetected(nextLocation);
          setLocationLoading(false);
        }
      } catch (_error) {
        if (isMounted) {
          setLocationError('We could not fetch your live location right now.');
          setLocationLoading(false);
        }
      }
    };

    getLocation();

    return () => {
      isMounted = false;
    };
  }, [onLocationDetected]);

  const locationStatus = locationLoading
    ? 'Fetching your current location...'
    : locationError || `Current location: ${appLocation.fullAddress}`;

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <View style={styles.logoOrb}>
            <Text style={styles.logo}>LC</Text>
          </View>
          <Text style={styles.appName}>{text.badge || 'Labor Connect'}</Text>
          <LanguageSwitcher selected={language} onChange={onChangeLanguage} />
        </View>

        <View style={styles.locationSection}>
          <Text style={styles.locationPillLabel}>Service area</Text>
          <Text style={styles.locationText}>{locationStatus}</Text>
        </View>

        <View style={styles.heroSection}>
          <Text style={styles.headline}>{text.headline}</Text>
          <Text style={styles.subheadline}>{text.subheadline}</Text>
        </View>

        <View style={styles.rolesGrid}>
          {roles.map((role) => (
            <Pressable
              key={role.key}
              style={({ pressed }) => [styles.roleCardShell, pressed && styles.roleCardPressed]}
              onPress={() => onSelectRole(role.key)}
            >
              <LinearGradient
                colors={role.gradient}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.roleCard}
              >
                <View style={[styles.roleGlow, { backgroundColor: role.glow }]} />
                <View style={styles.roleCardTop}>
                  <View style={styles.iconContainer}>
                    <Text style={styles.icon}>{role.icon}</Text>
                  </View>
                  <Text style={styles.roleEyebrow}>{role.eyebrow}</Text>
                </View>
                <Text style={styles.roleTitle}>{role.title}</Text>
                <Text style={styles.roleDescription}>{role.description}</Text>
                <View style={styles.ctaButton}>
                  <Text style={styles.ctaText}>{role.cta}</Text>
                  <Text style={styles.ctaArrow}>→</Text>
                </View>
              </LinearGradient>
            </Pressable>
          ))}
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{text.allCitiesAvailable || 'Available in your area'}</Text>
          <Text style={styles.footerSubtext}>
            {text.footerBenefits ||
              'Live opportunities nearby • Better worker-employer matching • Professional first impression'}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.page,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 32,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
    gap: 14,
  },
  logoOrb: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: colors.hero,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0a1817',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 8,
  },
  logo: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.panel,
    letterSpacing: 1,
  },
  appName: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
  },
  locationSection: {
    marginBottom: 18,
    backgroundColor: colors.panel,
    borderRadius: radius.lg,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: colors.border,
    gap: 4,
  },
  locationPillLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  locationText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textMuted,
  },
  heroSection: {
    marginBottom: 32,
    gap: 14,
  },
  headline: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 36,
  },
  subheadline: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 22,
  },
  rolesGrid: {
    gap: 16,
    marginBottom: 32,
  },
  roleCardShell: {
    borderRadius: radius.xl,
  },
  roleCardPressed: {
    opacity: 0.97,
    transform: [{ scale: 0.99 }],
  },
  roleCard: {
    borderRadius: radius.xl,
    padding: 24,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 14 },
    shadowOpacity: 0.16,
    shadowRadius: 22,
    elevation: 10,
    overflow: 'hidden',
    position: 'relative',
  },
  roleGlow: {
    position: 'absolute',
    top: -18,
    right: -18,
    width: 120,
    height: 120,
    borderRadius: 60,
  },
  roleCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconContainer: {
    width: 58,
    height: 58,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.16)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.18)',
  },
  icon: {
    fontSize: 22,
    color: colors.panel,
    fontWeight: '900',
  },
  roleEyebrow: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  roleTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.panel,
  },
  roleDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.82)',
    lineHeight: 22,
  },
  ctaButton: {
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'space-between',
    flexDirection: 'row',
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
  },
  ctaText: {
    color: colors.panel,
    fontSize: 15,
    fontWeight: '800',
  },
  ctaArrow: {
    color: colors.panel,
    fontSize: 18,
    fontWeight: '900',
  },
  footer: {
    backgroundColor: colors.panelMuted,
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
    marginTop: 16,
  },
  footerText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 18,
  },
});
