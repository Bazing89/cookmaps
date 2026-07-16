import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useWebLayout } from '../../hooks/useWebLayout';
import { cookTheme } from '../../theme/cookTheme';

type AuthMode = 'sign-in' | 'sign-up';

export function LoginScreen() {
  const { configured, loading, signIn, signUp } = useAuth();
  const { isDesktop } = useWebLayout();
  const { height } = useWindowDimensions();
  const [mode, setMode] = useState<AuthMode>('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const resetForm = useCallback(() => {
    setEmail('');
    setPassword('');
    setDisplayName('');
    setError(null);
    setMessage(null);
  }, []);

  const onSubmit = useCallback(async () => {
    setBusy(true);
    setError(null);
    setMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !password) {
      setError('Email and password are required.');
      setBusy(false);
      return;
    }

    if (mode === 'sign-in') {
      const result = await signIn(trimmedEmail, password);
      if (result.error) setError(result.error);
    } else {
      const result = await signUp(trimmedEmail, password, displayName.trim() || undefined);
      if (result.error) {
        setError(result.error);
      } else if (result.needsEmailConfirmation) {
        setMessage('Check your email to confirm your account, then sign in.');
        setMode('sign-in');
        resetForm();
      }
    }

    setBusy(false);
  }, [displayName, email, mode, password, resetForm, signIn, signUp]);

  if (!configured) {
    return (
      <View
        className="flex-1 items-center justify-center px-6"
        style={{ backgroundColor: cookTheme.bg, minHeight: height }}
      >
        <View
          className="w-full max-w-md rounded-3xl border border-white/10 px-6 py-8"
          style={{ backgroundColor: cookTheme.surface }}
        >
          <Text className="text-[22px] text-white" style={{ fontFamily: 'Syne_800ExtraBold' }}>
            Supabase not configured
          </Text>
          <Text
            className="mt-2 text-[14px] leading-5"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
          >
            Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to your .env file.
          </Text>
        </View>
      </View>
    );
  }

  if (loading) {
    return (
      <View
        className="flex-1 items-center justify-center"
        style={{ backgroundColor: cookTheme.bg, minHeight: height }}
      >
        <ActivityIndicator color={cookTheme.accent} size="large" />
        <Text
          className="mt-4 text-[14px]"
          style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
        >
          Restoring your session…
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      className="flex-1"
      style={{ backgroundColor: cookTheme.bg, minHeight: height }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        className="flex-1"
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="w-full" style={{ maxWidth: isDesktop ? 420 : 400 }}>
          <View className="mb-8 items-center">
            <LinearGradient
              colors={[cookTheme.accent, cookTheme.accentSoft]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                width: 72,
                height: 72,
                borderRadius: 22,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Ionicons name="flame" size={36} color="#fff" />
            </LinearGradient>
            <Text
              className="mt-5 text-[32px] text-white"
              style={{ fontFamily: 'Syne_800ExtraBold', letterSpacing: -0.5 }}
            >
              CookMapz
            </Text>
            <Text
              className="mt-2 text-center text-[15px] leading-5"
              style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
            >
              Watch live kitchens, claim plates, and pick up nearby.
            </Text>
          </View>

          <View
            className="rounded-3xl border border-white/10 px-5 py-6"
            style={{ backgroundColor: cookTheme.surface }}
          >
            <View
              className="mb-5 flex-row rounded-full p-1"
              style={{ backgroundColor: cookTheme.surfaceElevated }}
            >
              {(['sign-in', 'sign-up'] as const).map((tab) => {
                const active = mode === tab;
                return (
                  <Pressable
                    key={tab}
                    onPress={() => {
                      setMode(tab);
                      setError(null);
                      setMessage(null);
                    }}
                    className="flex-1 rounded-full py-2.5"
                    style={active ? { backgroundColor: cookTheme.accent } : undefined}
                  >
                    <Text
                      className="text-center text-[14px] text-white"
                      style={{ fontFamily: active ? 'DMSans_600SemiBold' : 'DMSans_500Medium' }}
                    >
                      {tab === 'sign-in' ? 'Sign in' : 'Create account'}
                    </Text>
                  </Pressable>
                );
              })}
            </View>

            {mode === 'sign-up' ? (
              <AuthField
                label="Display name"
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Maya from Mission"
                autoCapitalize="words"
              />
            ) : null}

            <AuthField
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
            />

            <AuthField
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="At least 6 characters"
              secureTextEntry
              autoCapitalize="none"
              autoComplete={mode === 'sign-up' ? 'new-password' : 'current-password'}
            />

            {error ? (
              <Text
                className="mb-3 text-[13px]"
                style={{ fontFamily: 'DMSans_500Medium', color: cookTheme.live }}
              >
                {error}
              </Text>
            ) : null}

            {message ? (
              <Text
                className="mb-3 text-[13px]"
                style={{ fontFamily: 'DMSans_500Medium', color: cookTheme.success }}
              >
                {message}
              </Text>
            ) : null}

            <Pressable
              onPress={() => void onSubmit()}
              disabled={busy}
              className="mt-1 flex-row items-center justify-center rounded-2xl py-3.5"
              style={{ backgroundColor: cookTheme.accent, opacity: busy ? 0.7 : 1 }}
            >
              {busy ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons
                    name={mode === 'sign-in' ? 'log-in-outline' : 'person-add-outline'}
                    size={18}
                    color="#fff"
                  />
                  <Text
                    className="ml-2 text-[15px] text-white"
                    style={{ fontFamily: 'DMSans_600SemiBold' }}
                  >
                    {mode === 'sign-in' ? 'Sign in' : 'Create account'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          <Text
            className="mt-5 text-center text-[12px] leading-5"
            style={{ fontFamily: 'DMSans_400Regular', color: cookTheme.textMuted }}
          >
            You stay signed in on this device until you sign out.
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type AuthFieldProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address';
  autoCapitalize?: 'none' | 'words';
  autoComplete?: 'email' | 'current-password' | 'new-password';
};

function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoComplete,
}: AuthFieldProps) {
  return (
    <View className="mb-4">
      <Text
        className="mb-2 text-[12px] uppercase tracking-wide"
        style={{ fontFamily: 'DMSans_600SemiBold', color: cookTheme.textMuted }}
      >
        {label}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="rgba(168, 162, 154, 0.7)"
        secureTextEntry={secureTextEntry}
        keyboardType={keyboardType}
        autoCapitalize={autoCapitalize}
        autoComplete={autoComplete}
        className="rounded-2xl border border-white/10 px-4 py-3.5 text-[15px] text-white"
        style={{
          fontFamily: 'DMSans_400Regular',
          backgroundColor: cookTheme.surfaceElevated,
        }}
      />
    </View>
  );
}
