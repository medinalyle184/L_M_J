import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from './supabase';

export default function LoginSignupScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSignUp = async () => {
    if (!name.trim()) return Alert.alert("Error", "Please enter your name");
    if (!email.trim()) return Alert.alert("Error", "Please enter your email");
    if (!validateEmail(email)) return Alert.alert("Error", "Enter a valid email");
    if (password.length < 6) return Alert.alert("Error", "Password must be 6+ chars");
    if (password !== confirmPassword)
      return Alert.alert("Error", "Passwords do not match");

    setLoading(true);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    setLoading(false);

    if (error) {
      return Alert.alert("Signup Failed", error.message);
    }

    Alert.alert("Success", "Account created! Please check your email to confirm.");
    setIsLogin(true);
    setPassword('');
    setConfirmPassword('');
  };

  const handleLogin = async () => {
    if (!email.trim()) return Alert.alert("Error", "Please enter your email");
    if (!password.trim()) return Alert.alert("Error", "Please enter your password");

    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    setLoading(false);

    if (error) {
      return Alert.alert("Login Failed", error.message);
    }

    Alert.alert("Success", "Welcome back!");
    onLogin(data.user);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={styles.logoContainer}>
            <Ionicons name="thermometer" size={48} color="#007AFF" />
          </View>
          <Text style={styles.mainTitle}>
            {isLogin ? "Daily Temp" : "Create Account"}
          </Text>
          <Text style={styles.subtitle}>
            {isLogin ? "Login to access your rooms" : "Join us to monitor your home"}
          </Text>
        </View>

        {/* FORM */}
        <View style={styles.formContainer}>
          {!isLogin && (
            <>
              <Text style={styles.label}>Username</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={18} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Username"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                />
              </View>
            </>
          )}

          <Text style={styles.label}>Email Address</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={18} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="example@email.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
            />
          </View>

          <Text style={styles.label}>Password</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed" size={18} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              editable={!loading}
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              <Ionicons name={showPassword ? "eye" : "eye-off"} size={18} color="#999" />
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={18} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                  <Ionicons
                    name={showConfirmPassword ? "eye" : "eye-off"}
                    size={18}
                    color="#999"
                  />
                </TouchableOpacity>
              </View>
            </>
          )}

          <TouchableOpacity
            style={[styles.submitButton, loading && { opacity: 0.5 }]}
            onPress={isLogin ? handleLogin : handleSignUp}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading ? "Please wait..." : isLogin ? "Login" : "Create Account"}
            </Text>
          </TouchableOpacity>

          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
            </Text>
            <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
              <Text style={styles.toggleLink}>
                {isLogin ? "Sign Up" : "Login"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* INFO BOX REMOVED */}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f4f8" },
  scrollContent: { flexGrow: 1, padding: 20, paddingTop: 40 },
  headerContainer: { alignItems: "center", marginBottom: 40 },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#e3f2fd",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  mainTitle: { fontSize: 28, fontWeight: "700", color: "#1a1a1a" },
  subtitle: { fontSize: 15, color: "#666", marginTop: 6 },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 5,
  },
  label: { fontSize: 14, fontWeight: "600", color: "#333", marginTop: 16 },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderWidth: 1.5,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    paddingHorizontal: 12,
    marginTop: 6,
  },
  input: { flex: 1, padding: 12, fontSize: 16 },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
  },
  submitButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
  toggleContainer: { flexDirection: "row", marginTop: 16, justifyContent: "center" },
  toggleText: { color: "#666" },
  toggleLink: { color: "#007AFF", fontWeight: "700" },
  infoBox: {
    flexDirection: "row",
    backgroundColor: "#e3f2fd",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    alignItems: "center",
  },
  infoText: { marginLeft: 10, color: "#0d47a1", fontSize: 13 },
});
