import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { useCallback, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View,
} from 'react-native';
import { SettingsRow, SettingsSection } from './SettingsRow';
import { useAuth } from '../../contexts/AuthContext';
import { LegalDocumentScreen } from '../../screens/cook/LegalDocumentScreen';
import { EditProfileScreen } from '../../screens/cook/EditProfileScreen';
import { PaymentMethodsScreen } from '../../screens/cook/PaymentMethodsScreen';
import {
  COMMUNITY_GUIDELINES,
  PRIVACY_POLICY,
  TERMS_AND_CONDITIONS,
} from '../../screens/cook/profileLegal';
import { cookTheme } from '../../theme/cookTheme';

type ProfilePanel =
  | null
  | 'edit-profile'
  | 'payments'
  | 'terms'
  | 'privacy'
  | 'community'
  | 'help'
  | 'licenses';

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function ProfileSettingsMenu({ visible, onClose }: Props) {
  const { signOut } = useAuth();
  const [busy, setBusy] = useState(false);
  const [panel, setPanel] = useState<ProfilePanel>(null);
  const [notifications, setNotifications] = useState(true);
  const appVersion = Constants.expoConfig?.version ?? '1.0.0';

  const closeAll = useCallback(() => {
    setPanel(null);
    onClose();
  }, [onClose]);

  const onSignOut = useCallback(async () => {
    setBusy(true);
    await signOut();
    setBusy(false);
    closeAll();
  }, [closeAll, signOut]);

  if (!visible && panel === null) return null;

  const overlay = (children: ReactNode) => (
    <View className="absolute inset-0 z-50 flex-1" style={{ backgroundColor: cookTheme.bg }}>
      {children}
    </View>
  );

  if (panel === 'edit-profile') {
    return overlay(<EditProfileScreen onBack={() => setPanel(null)} />);
  }

  if (panel === 'payments') {
    return overlay(<PaymentMethodsScreen onBack={() => setPanel(null)} />);
  }

  if (panel === 'terms') {
    return overlay(
      <LegalDocumentScreen
        title="Terms & Conditions"
        body={TERMS_AND_CONDITIONS}
        onBack={() => setPanel(null)}
      />,
    );
  }

  if (panel === 'privacy') {
    return overlay(
      <LegalDocumentScreen
        title="Privacy Policy"
        body={PRIVACY_POLICY}
        onBack={() => setPanel(null)}
      />,
    );
  }

  if (panel === 'community') {
    return overlay(
      <LegalDocumentScreen
        title="Community Guidelines"
        body={COMMUNITY_GUIDELINES}
        onBack={() => setPanel(null)}
      />,
    );
  }

  if (panel === 'help') {
    return overlay(
      <LegalDocumentScreen
        title="Help & Support"
        body={`Need help with CookMapz?

• Pickup issues: message the cook from your Cart tab
• Account problems: support@cookmapz.app
• Report unsafe food or behavior: safety@cookmapz.app

We typically respond within 1–2 business days.`}
        onBack={() => setPanel(null)}
      />,
    );
  }

  if (panel === 'licenses') {
    return overlay(
      <LegalDocumentScreen
        title="Open-source licenses"
        body={`CookMapz is built with open-source software including React Native, Expo, Supabase, and other libraries listed in the project dependencies.

Full license texts are available in the app's repository under node_modules and at github.com.`}
        onBack={() => setPanel(null)}
      />,
    );
  }

  return overlay(
    <View className="flex-1">
        <View className="flex-row items-center justify-between px-5 pt-4 pb-2">
          <Text className="text-[22px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
            Settings
          </Text>
          <Pressable
            onPress={onClose}
            hitSlop={12}
            className="h-10 w-10 items-center justify-center rounded-full"
            style={{ backgroundColor: cookTheme.surfaceElevated }}
          >
            <Ionicons name="close" size={22} color="#fff" />
          </Pressable>
        </View>

        <ScrollView className="flex-1 px-5" contentContainerStyle={{ paddingBottom: 40 }}>
          <SettingsSection title="Account">
            <SettingsRow
              label="Manage payment methods"
              subtitle="Cards for claiming plates"
              icon="card-outline"
              onPress={() => setPanel('payments')}
            />
            <SettingsRow
              label="Edit profile"
              subtitle="Name, handle, avatar"
              icon="person-outline"
              onPress={() => setPanel('edit-profile')}
            />
          </SettingsSection>

          <SettingsSection title="Preferences">
            <SettingsRow
              label="Push notifications"
              subtitle="Orders, live cooks nearby"
              icon="notifications-outline"
              trailing={
                <Switch
                  value={notifications}
                  onValueChange={setNotifications}
                  trackColor={{ false: cookTheme.surfaceElevated, true: cookTheme.accentSoft }}
                  thumbColor="#fff"
                />
              }
            />
            <SettingsRow
              label="Location"
              subtitle="Used for nearby chefs and map"
              icon="location-outline"
              onPress={() => void Linking.openSettings()}
            />
          </SettingsSection>

          <SettingsSection title="Legal">
            <SettingsRow
              label="Terms & Conditions"
              icon="document-text-outline"
              onPress={() => setPanel('terms')}
            />
            <SettingsRow
              label="Privacy Policy"
              icon="shield-checkmark-outline"
              onPress={() => setPanel('privacy')}
            />
            <SettingsRow
              label="Community Guidelines"
              icon="people-outline"
              onPress={() => setPanel('community')}
            />
          </SettingsSection>

          <SettingsSection title="Support">
            <SettingsRow
              label="Help & Support"
              icon="help-circle-outline"
              onPress={() => setPanel('help')}
            />
            <SettingsRow
              label="Contact us"
              icon="mail-outline"
              onPress={() => void Linking.openURL('mailto:support@cookmapz.app')}
            />
            <SettingsRow
              label="Open-source licenses"
              icon="code-slash-outline"
              onPress={() => setPanel('licenses')}
            />
          </SettingsSection>

          <SettingsSection title="About">
            <SettingsRow
              label="App version"
              icon="information-circle-outline"
              trailing={
                <Text
                  className="text-[14px]"
                  style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
                >
                  {appVersion}
                </Text>
              }
            />
          </SettingsSection>

          <Pressable
            onPress={() => void onSignOut()}
            disabled={busy}
            className="mt-4 flex-row items-center justify-center rounded-2xl border border-white/10 py-3.5"
            style={{ backgroundColor: cookTheme.surface, opacity: busy ? 0.6 : 1 }}
          >
            {busy ? (
              <ActivityIndicator color={cookTheme.live} size="small" />
            ) : (
              <>
                <Ionicons name="log-out-outline" size={18} color={cookTheme.live} />
                <Text
                  className="ml-2 text-[15px]"
                  style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.live }}
                >
                  Sign out
                </Text>
              </>
            )}
          </Pressable>
        </ScrollView>
    </View>,
  );
}
