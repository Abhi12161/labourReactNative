import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius } from '../theme/tokens';

const languages = [
  { code: 'en', label: 'English', icon: '🇮🇳' },
  { code: 'hi', label: 'हिंदी', icon: '🇮🇳' },
  { code: 'bho', label: 'भोजपुरी', icon: '🇮🇳' },
];

export function LanguageSwitcher({ selected , onChange }) {
  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        {languages.map((language) => {
          const active = selected === language.code;

          return (
            <Pressable
              key={language.code}
              onPress={() => onChange(language.code)}
              style={[
                styles.tab,
                active && styles.activeTab,
                !active && styles.inactiveTab
              ]}
            >
              <Text style={[styles.tabLabel, active && styles.activeTabLabel]}>
                {language.icon} {language.label}
              </Text>
              {/* Active Tab indicator with smooth animation */}
              {active && <View style={styles.activeIndicator} />}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  // Container for the whole LanguageSwitcher component with a modern background
  container: {
    backgroundColor: 'transparent', // Gradient color or transparent for outer space
    borderRadius: radius.lg,
    // marginBottom: 16,
    // paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,  // for Android shadow effect
    overflow: 'hidden',
  },

  // Container for all the tabs
  tabContainer: {
    flexDirection: 'row',
    // justifyContent: 'space-between',
    // borderRadius: radius.lg,
    // paddingVertical: 4,
    // // backgroundColor: '#fff',
    // borderWidth: 1,
    // borderColor: '#ddd',
    // paddingHorizontal: 10,
    // marginHorizontal: 10,
  },

  // Style for each tab
  tab: {
    // paddingHorizontal: 24,
    // paddingVertical: 14,
    borderRadius: radius.md,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333',
    transition: 'background-color 0.3s ease', // Smooth transition for active state
    minWidth: 100,  // Ensure uniform tab size
  },

  // Active tab color
  activeTab: {
    backgroundColor: '#b83b1c', // Modern peach color for active tab
    borderRadius: radius.md,
    marginTop: 2,
    marginBottom: 4,
  },

  // Inactive tab color for unselected states
  inactiveTab: {
    backgroundColor: '#444', // Darker background for inactive tabs
    borderRadius: radius.sm,
  },

  // Text inside the tab
  tabLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff', // White text for better visibility on dark background
    textTransform: 'capitalize', // Keep language names in normal case
  },

  // Active tab text color
  activeTabLabel: {
    color: 'white',  // White text on active tab
    fontWeight: 'bold',  // Bold the text when active
  },

  // Active tab underline effect
  activeIndicator: {
    width: '100%',
    height: 3,
    backgroundColor: '#feb47b',  // Light yellow under the active tab
    borderRadius: 2,
    marginTop: 8,
  },
});