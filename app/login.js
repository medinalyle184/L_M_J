import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { supabase } from './supabase';

export default function LoginSignupScreen({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('user'); // 'user' or 'admin'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [adminCode, setAdminCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Admin registration code (in production, store this securely)
  const ADMIN_REGISTRATION_CODE = "ADMIN2024";

  const handleSignUp = async () => {
    // Common validations
    if (!name.trim()) return Alert.alert("Error", "Please enter your name");
    if (!email.trim()) return Alert.alert("Error", "Please enter your email");
    if (!validateEmail(email)) return Alert.alert("Error", "Enter a valid email");
    if (password.length < 6) return Alert.alert("Error", "Password must be 6+ characters");
    if (password !== confirmPassword)
      return Alert.alert("Error", "Passwords do not match");

    // Admin-specific validation
    if (userType === 'admin') {
      if (!adminCode.trim()) return Alert.alert("Error", "Please enter admin registration code");
      if (adminCode !== ADMIN_REGISTRATION_CODE) return Alert.alert("Error", "Invalid admin registration code");
    }

    setLoading(true);

    try {
      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          data: { 
            name,
            user_type: userType
          } 
        },
      });

      if (authError) throw authError;

      // Check if users table exists, create user profile
      const userRole = userType === 'admin' ? 'admin' : 'user';

      try {
        const { error: userError } = await supabase
          .from('users')
          .upsert({
            id: authData.user.id,
            email: email,
            name: name,
            user_type: userType,
            role: userRole,
            created_at: new Date().toISOString(),
            is_active: true,
            last_login: null
          });

        if (userError) {
          console.log('User profile creation error:', userError);
          if (userError.message.includes('relation "users" does not exist')) {
            throw new Error('Database tables not found. Please run the migration first: supabase db push');
          }
          // Continue anyway, profile might be created via trigger
        }
      } catch (dbError) {
        console.log('Database operation failed:', dbError);
        if (dbError.message.includes('relation "users" does not exist')) {
          throw new Error('Database tables not found. Please run the migration first: supabase db push');
        }
        // Continue anyway, profile might be created via trigger
      }

      // For admin, also add to admins table
      if (userType === 'admin') {
        const { error: adminError } = await supabase
          .from('admins')
          .insert({
            user_id: authData.user.id,
            email: email,
            name: name,
            admin_code: adminCode,
            permissions: ['full_access'], // Default full access
            created_at: new Date().toISOString(),
            is_super_admin: false // Default to regular admin
          });

        if (adminError) {
          console.log('Admin record creation error:', adminError);
        }
      }

      Alert.alert(
        "Success", 
        `${userType === 'admin' ? 'Admin' : 'User'} account created! Please check your email to confirm.`
      );
      
      // Reset form
      setIsLogin(true);
      setPassword('');
      setConfirmPassword('');
      setName('');
      setAdminCode('');
      setUserType(userType); // Stay on same user type
      
    } catch (error) {
      Alert.alert("Signup Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email.trim()) return Alert.alert("Error", "Please enter your email");
    if (!password.trim()) return Alert.alert("Error", "Please enter your password");

    setLoading(true);
    
    try {
      // Authenticate with Supabase
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) throw authError;

      // Fetch user data from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .maybeSingle();

      if (userError) {
        console.error('Error fetching user data:', userError);
        throw new Error('User profile not found');
      }

      // Verify user type matches login type
      if (userData.user_type !== userType) {
        const correctType = userData.user_type === 'admin' ? 'Admin' : 'User';
        await supabase.auth.signOut();
        throw new Error(`This is a ${correctType} account. Please use ${correctType} login.`);
      }

      // For admin, check admins table
      if (userType === 'admin') {
        const { data: adminData, error: adminError } = await supabase
          .from('admins')
          .select('*')
          .eq('user_id', authData.user.id)
          .maybeSingle();

        if (adminError || !adminData) {
          console.error('Admin record not found:', adminError);
          // Create admin record if missing
          await supabase
            .from('admins')
            .insert({
              user_id: authData.user.id,
              email: email,
              name: userData.name || name,
              permissions: ['full_access'],
              created_at: new Date().toISOString(),
              is_super_admin: false
            });
        }
      }

      Alert.alert("Success", `Welcome back, ${userType === 'admin' ? 'Admin' : userData.name || 'User'}!`);
      
      // Pass complete user data to parent
      onLogin({ 
        ...authData.user, 
        user_type: userType,
        role: userData.role || userType,
        name: userData.name || name,
        profile: userData
      });
      
    } catch (error) {
      Alert.alert("Login Failed", error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    // Clear form fields
    setPassword('');
    setConfirmPassword('');
    setAdminCode('');
  };

  const switchUserType = (type) => {
    setUserType(type);
    // Clear form fields when switching
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setName('');
    setAdminCode('');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <View style={[
            styles.logoContainer,
            userType === 'admin' && styles.adminLogoContainer
          ]}>
            <Ionicons 
              name={userType === 'admin' ? "shield-checkmark" : "thermometer"} 
              size={48} 
              color={userType === 'admin' ? "#FF3B30" : "#007AFF"} 
            />
          </View>
          
          <Text style={styles.mainTitle}>
            {isLogin 
              ? userType === 'admin' 
                ? "Admin Login" 
                : "User Login"
              : userType === 'admin'
                ? "Admin Sign Up"
                : "User Sign Up"}
          </Text>
          
          <Text style={styles.subtitle}>
            {isLogin 
              ? userType === 'admin'
                ? "Access admin dashboard and controls"
                : "Login to monitor your rooms"
              : userType === 'admin'
                ? "Register as system administrator"
                : "Create your user account"}
          </Text>
          
          {/* User Type Selector */}
          <View style={styles.userTypeContainer}>
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'user' && styles.userTypeButtonActive,
                userType === 'user' && styles.userButtonActive
              ]}
              onPress={() => switchUserType('user')}
              disabled={loading}
            >
              <Ionicons 
                name="person" 
                size={20} 
                color={userType === 'user' ? '#007AFF' : '#666'} 
              />
              <Text style={[
                styles.userTypeText,
                userType === 'user' && styles.userTypeTextActive
              ]}>
                User
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.userTypeButton,
                userType === 'admin' && styles.userTypeButtonActive,
                userType === 'admin' && styles.adminButtonActive
              ]}
              onPress={() => switchUserType('admin')}
              disabled={loading}
            >
              <Ionicons 
                name="shield-checkmark" 
                size={20} 
                color={userType === 'admin' ? '#FF3B30' : '#666'} 
              />
              <Text style={[
                styles.userTypeText,
                userType === 'admin' && styles.userTypeTextActive
              ]}>
                Admin
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* FORM */}
        <View style={styles.formContainer}>
          {!isLogin && (
            <>
              <Text style={styles.label}>Full Name</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person" size={18} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter your full name"
                  value={name}
                  onChangeText={setName}
                  editable={!loading}
                  autoCapitalize="words"
                />
              </View>
            </>
          )}

          <Text style={styles.label}>
            {userType === 'admin' ? 'Admin Email' : 'Email Address'}
          </Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail" size={18} color="#999" />
            <TextInput
              style={styles.input}
              placeholder={
                userType === 'admin' 
                  ? "admin@example.com" 
                  : "user@example.com"
              }
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!loading}
              autoComplete="email"
            />
          </View>

          {/* Admin Registration Code (for signup only) */}
          {!isLogin && userType === 'admin' && (
            <>
              <Text style={styles.label}>Admin Registration Code</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="key" size={18} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter admin registration code"
                  value={adminCode}
                  onChangeText={setAdminCode}
                  editable={!loading}
                  secureTextEntry={true}
                />
              </View>
              <Text style={styles.codeHint}>
                Contact system administrator for registration code
              </Text>
            </>
          )}

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
            <TouchableOpacity 
              onPress={() => setShowPassword(!showPassword)}
              disabled={loading}
            >
              <Ionicons 
                name={showPassword ? "eye" : "eye-off"} 
                size={18} 
                color="#999" 
              />
            </TouchableOpacity>
          </View>

          {!isLogin && (
            <>
              <Text style={styles.label}>Confirm Password</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="lock-closed" size={18} color="#999" />
                <TextInput
                  style={styles.input}
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  editable={!loading}
                />
                <TouchableOpacity 
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={loading}
                >
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
            style={[
              styles.submitButton, 
              userType === 'admin' && styles.adminSubmitButton,
              loading && { opacity: 0.5 }
            ]}
            onPress={isLogin ? handleLogin : handleSignUp}
            disabled={loading}
          >
            <Text style={styles.submitButtonText}>
              {loading 
                ? "Please wait..." 
                : isLogin 
                  ? userType === 'admin' 
                    ? "Admin Login" 
                    : "User Login"
                  : userType === 'admin'
                    ? "Register as Admin"
                    : "Create User Account"}
            </Text>
          </TouchableOpacity>

          {/* Toggle between login/signup */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleText}>
              {isLogin 
                ? userType === 'admin'
                  ? "Need an admin account? "
                  : "Don't have an account? "
                : "Already have an account? "}
            </Text>
            <TouchableOpacity 
              onPress={toggleAuthMode}
              disabled={loading}
            >
              <Text style={[
                styles.toggleLink,
                userType === 'admin' && styles.adminToggleLink
              ]}>
                {isLogin 
                  ? userType === 'admin'
                    ? "Register Admin"
                    : "Sign Up"
                  : "Login"}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Switch user type */}
          <TouchableOpacity 
            style={styles.switchTypeButton}
            onPress={() => switchUserType(userType === 'user' ? 'admin' : 'user')}
            disabled={loading}
          >
            <Text style={styles.switchTypeText}>
              <Ionicons 
                name={userType === 'user' ? "shield-checkmark" : "person"} 
                size={14} 
              /> 
              Switch to {userType === 'user' ? 'Admin' : 'User'} {isLogin ? 'Login' : 'Sign Up'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Info Box */}
        <View style={[
          styles.infoBox,
          userType === 'admin' && styles.adminInfoBox
        ]}>
          <Ionicons 
            name={userType === 'admin' ? "shield-checkmark" : "information-circle"} 
            size={20} 
            color={userType === 'admin' ? "#FF3B30" : "#007AFF"} 
          />
          <Text style={styles.infoText}>
            {userType === 'admin' 
              ? "Admin accounts have full system access and management capabilities."
              : "User accounts can monitor rooms and view temperature data."
            }
          </Text>
        </View>
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
  adminLogoContainer: {
    backgroundColor: "#ffe6e6",
  },
  mainTitle: { 
    fontSize: 28, 
    fontWeight: "700", 
    color: "#1a1a1a", 
    marginBottom: 8,
    textAlign: 'center'
  },
  subtitle: { 
    fontSize: 15, 
    color: "#666", 
    marginBottom: 16, 
    textAlign: 'center',
    paddingHorizontal: 20
  },
  userTypeContainer: {
    flexDirection: "row",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 4,
    marginTop: 10,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    width: '80%',
  },
  userTypeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  userTypeButtonActive: {
    backgroundColor: "#f0f4f8",
  },
  userButtonActive: {
    backgroundColor: "#e3f2fd",
  },
  adminButtonActive: {
    backgroundColor: "#ffe6e6",
  },
  userTypeText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#666",
    marginLeft: 6,
  },
  userTypeTextActive: {
    color: "#007AFF",
  },
  formContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    marginBottom: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  label: { 
    fontSize: 14, 
    fontWeight: "600", 
    color: "#333", 
    marginTop: 16,
    marginBottom: 4
  },
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
  input: { 
    flex: 1, 
    padding: 12, 
    fontSize: 16,
    color: '#333'
  },
  codeHint: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontStyle: 'italic',
  },
  submitButton: {
    backgroundColor: "#007AFF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 24,
    elevation: 2,
  },
  adminSubmitButton: {
    backgroundColor: "#FF3B30",
  },
  submitButtonText: { 
    color: "#fff", 
    fontSize: 16, 
    fontWeight: "700" 
  },
  toggleContainer: { 
    flexDirection: "row", 
    marginTop: 24, 
    justifyContent: "center",
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  toggleText: { 
    color: "#666", 
    fontSize: 14,
    textAlign: 'center'
  },
  toggleLink: { 
    color: "#007AFF", 
    fontWeight: "700", 
    fontSize: 14,
    marginLeft: 4
  },
  adminToggleLink: {
    color: "#FF3B30",
  },
  switchTypeButton: {
    marginTop: 16,
    alignItems: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  switchTypeText: {
    color: '#666',
    fontSize: 14,
    fontWeight: '500',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  adminInfoBox: {
    backgroundColor: '#ffe6e6',
  },
  infoText: {
    fontSize: 14,
    color: "#333",
    marginLeft: 12,
    flex: 1,
  },
});