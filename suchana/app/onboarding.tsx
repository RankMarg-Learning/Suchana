import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet, TouchableOpacity,
  ScrollView, KeyboardAvoidingView, Platform, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import {
  User,
  MapPin,
  Target,
  GraduationCap,
  Briefcase,
  Search,
  Rocket,
  ChevronLeft,
  ChevronRight
} from 'lucide-react-native';
import { registerUser } from '@/services/userService';
import { useUser } from '@/context/UserContext';
import { CategoryChip } from '@/components/CategoryChip';
import { ExamCategory, QualificationLevel } from '@/constants/enums';
import { SafeAreaView } from 'react-native-safe-area-context';

const INDIA_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala', 'Madhya Pradesh',
  'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura', 'Uttar Pradesh',
  'Uttarakhand', 'West Bengal', 'Delhi', 'Jammu & Kashmir', 'Ladakh',
];

const DEGREES = [
  'B.Tech', 'B.E', 'Diploma', 'B.Sc', 'M.Sc', 'B.Com', 'M.Com', 'B.A', 'M.A', 'B.Ed', 'LLB', 'MBBS', 'BCA', 'MCA', 'ITI', 'Other'
];

const SPECIALIZATIONS = [
  'Computer Science', 'Civil', 'Mechanical', 'Electrical', 'Electronics', 'IT', 'General Science', 'Maths', 'Physics', 'Chemistry', 'Biology', 'Agriculture', 'Commerce', 'Economics', 'History', 'Geography', 'Polity', 'English', 'Other'
];

const CATEGORIES: { label: string; value: ExamCategory }[] = [
  { label: 'UPSC', value: ExamCategory.UPSC },
  { label: 'SSC', value: ExamCategory.SSC },
  { label: 'Bank Jobs', value: ExamCategory.BANKING_JOBS },
  { label: 'Railway', value: ExamCategory.RAILWAY_JOBS },
  { label: 'Defence', value: ExamCategory.DEFENCE_JOBS },
  { label: 'Police', value: ExamCategory.POLICE_JOBS },
  { label: 'State PSC', value: ExamCategory.STATE_PSC },
  { label: 'Teaching', value: ExamCategory.TEACHING_ELIGIBILITY },
  { label: 'Govt Jobs', value: ExamCategory.GOVERNMENT_JOBS },
  { label: 'Engineering', value: ExamCategory.ENGINEERING_ENTRANCE },
  { label: 'Medical', value: ExamCategory.MEDICAL_ENTRANCE },
  { label: 'Law', value: ExamCategory.LAW_ENTRANCE },
  { label: 'MBA', value: ExamCategory.MBA_ENTRANCE },
  { label: 'Certifications', value: ExamCategory.PROFESSIONAL_CERTIFICATION },
  { label: 'Scholarships', value: ExamCategory.SCHOLARSHIP_EXAMS },
];

const STEPS = [
  { label: 'Identity', icon: User },
  { label: 'Location', icon: MapPin },
  { label: 'Interests', icon: Target },
  { label: 'Profile', icon: GraduationCap },
  { label: 'Specialisation', icon: Search },
];

export default function OnboardingScreen() {
  const router = useRouter();
  const { setUser } = useUser();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('');
  const [categories, setCategories] = useState<ExamCategory[]>([]);
  const [qualification, setQualification] = useState('');
  const [degree, setDegree] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [employment, setEmployment] = useState('');
  const [gender, setGender] = useState('');

  const toggleCat = (cat: ExamCategory) =>
    setCategories(c => c.includes(cat) ? c.filter(x => x !== cat) : [...c, cat]);

  async function handleFinish() {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Required', 'Name and phone are required.');
      return;
    }
    if (!/^\d{10}$/.test(phone)) {
      Alert.alert('Invalid', 'Enter a 10-digit phone number.');
      return;
    }
    setLoading(true);
    try {
      const user = await registerUser({
        name: name.trim(),
        phone: phone.trim(),
        state: state || undefined,
        preferredCategories: categories,
        qualification: (qualification as any) || undefined,
        degree: degree.trim() || undefined,
        specialization: specialization.trim() || undefined,
        employmentStatus: (employment as any) || undefined,
        gender: (gender as any) || undefined,
        platform: Platform.OS as any,
      });
      setUser(user);
      router.replace('/(tabs)');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }

  const canProceed = () => {
    if (step === 0) return name.trim().length > 0 && /^\d{10}$/.test(phone);
    return true;
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Top bar: progress + skip */}
      <View style={styles.topBar}>
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, i <= step && styles.progressActive]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={styles.skipBtn}>
          <Text style={styles.skipTxt}>Skip</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16 }}>
        {(() => {
          const StepIcon = STEPS[step].icon;
          return <StepIcon size={24} color="#7C3AED" style={{ marginRight: 12 }} />;
        })()}
        <Text style={[styles.stepTitle, { paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }]}>
          {STEPS[step].label}
        </Text>
      </View>
      <Text style={styles.optionalHint}>Optional · for personalised exam recommendations</Text>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Step 0: Name + Phone */}
          {step === 0 && (
            <View>
              <Text style={styles.label}>Your Name</Text>
              <TextInput
                style={styles.input}
                placeholder="Ravi Kumar"
                placeholderTextColor="#4B5563"
                value={name}
                onChangeText={setName}
              />
              <Text style={styles.label}>Mobile Number</Text>
              <View style={styles.phoneRow}>
                <View style={styles.phonePrefix}><Text style={styles.phonePrefixTxt}>+91</Text></View>
                <TextInput
                  style={[styles.input, { flex: 1, marginBottom: 0 }]}
                  placeholder="9876543210"
                  placeholderTextColor="#4B5563"
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
              <Text style={styles.hint}>
                Your number is your identity — no OTP needed.{'\n'}We'll use it to sync your profile.
              </Text>
            </View>
          )}

          {/* Step 1: State */}
          {step === 1 && (
            <View>
              <Text style={styles.label}>Select your State / UT</Text>
              <View style={styles.stateGrid}>
                {INDIA_STATES.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.stateBtn, state === s && styles.stateBtnActive]}
                    onPress={() => setState(prev => prev === s ? '' : s)}>
                    <Text style={[styles.stateTxt, state === s && styles.stateTxtActive]} numberOfLines={1}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 2: Categories */}
          {step === 2 && (
            <View>
              <Text style={styles.label}>Which exams are you preparing for?</Text>
              <Text style={styles.sublabel}>Select all that apply</Text>
              <View style={styles.chipWrap}>
                {CATEGORIES.map(c => (
                  <CategoryChip
                    key={c.value}
                    label={c.label}
                    value={c.value}
                    selected={categories.includes(c.value)}
                    onPress={() => toggleCat(c.value)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Step 3: Profile details */}
          {step === 3 && (
            <View>
              <Text style={styles.label}>Gender</Text>
              <View style={styles.optionRow}>
                {[
                  { v: 'MALE', l: 'Male', i: User },
                  { v: 'FEMALE', l: 'Female', i: User },
                  { v: 'OTHER', l: 'Other', i: User },
                ].map(g => (
                  <TouchableOpacity
                    key={g.v}
                    style={[styles.optBtn, gender === g.v && styles.optBtnActive]}
                    onPress={() => setGender(prev => prev === g.v ? '' : g.v)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <g.i size={14} color={gender === g.v ? '#C4B5FD' : '#9CA3AF'} style={{ marginRight: 6 }} />
                      <Text style={[styles.optTxt, gender === g.v && styles.optTxtActive]}>
                        {g.l}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Qualification</Text>
              <View style={styles.optionRow}>
                {[
                  { v: QualificationLevel.TEN_PASS, l: '10th' },
                  { v: QualificationLevel.TWELVE_PASS, l: '12th' },
                  { v: QualificationLevel.GRADUATE, l: 'Graduate' },
                  { v: QualificationLevel.POST_GRADUATE, l: 'PG' },
                ].map(q => (
                  <TouchableOpacity
                    key={q.v}
                    style={[styles.optBtn, qualification === q.v && styles.optBtnActive]}
                    onPress={() => setQualification(prev => prev === q.v ? '' : q.v)}>
                    <Text style={[styles.optTxt, qualification === q.v && styles.optTxtActive]}>
                      {q.l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Employment Status</Text>
              <View style={styles.optionRow}>
                {[
                  { v: 'STUDENT', l: 'Student', i: GraduationCap },
                  { v: 'EMPLOYED', l: 'Employed', i: Briefcase },
                  { v: 'UNEMPLOYED', l: 'Job Seeking', i: Search },
                ].map(e => (
                  <TouchableOpacity
                    key={e.v}
                    style={[styles.optBtn, employment === e.v && styles.optBtnActive]}
                    onPress={() => setEmployment(prev => prev === e.v ? '' : e.v)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <e.i size={14} color={employment === e.v ? '#C4B5FD' : '#9CA3AF'} style={{ marginRight: 6 }} />
                      <Text style={[styles.optTxt, employment === e.v && styles.optTxtActive]}>{e.l}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 4: Specialisation */}
          {step === 4 && (
            <View>
              <Text style={styles.label}>Your Degree / Diploma</Text>
              <View style={styles.stateGrid}>
                {DEGREES.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.stateBtn, degree === d && styles.stateBtnActive]}
                    onPress={() => setDegree(prev => prev === d ? '' : d)}>
                    <Text style={[styles.stateTxt, degree === d && styles.stateTxtActive]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { marginTop: 24 }]}>Branch / Specialisation</Text>
              <View style={styles.stateGrid}>
                {SPECIALIZATIONS.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.stateBtn, specialization === s && styles.stateBtnActive]}
                    onPress={() => setSpecialization(prev => prev === s ? '' : s)}>
                    <Text style={[styles.stateTxt, specialization === s && styles.stateTxtActive]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.hint, { marginTop: 16 }]}>
                Help us show you exact "Job Roles" that match your {degree || 'Degree'} {specialization ? `in ${specialization}` : ''}.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* CTA */}
      <View style={styles.footer}>
        {step > 0 && (
          <TouchableOpacity style={styles.backBtn} onPress={() => setStep(s => s - 1)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ChevronLeft size={20} color="#9CA3AF" style={{ marginRight: 4 }} />
              <Text style={styles.backTxt}>Back</Text>
            </View>
          </TouchableOpacity>
        )}
        {step < STEPS.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextBtn, !canProceed() && styles.nextBtnDisabled]}
            onPress={() => canProceed() && setStep(s => s + 1)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={styles.nextTxt}>Next</Text>
              <ChevronRight size={20} color="#fff" style={{ marginLeft: 4 }} />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, loading && styles.nextBtnDisabled]}
            onPress={handleFinish}
            disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.nextTxt}>Let's Go</Text>
                <Rocket size={20} color="#fff" style={{ marginLeft: 8 }} />
              </View>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#0D0D0F' },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 },
  progressRow: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: '#27272A' },
  progressActive: { backgroundColor: '#7C3AED', width: 24 },
  skipBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, backgroundColor: '#1C1C1E' },
  skipTxt: { color: '#6B7280', fontSize: 13, fontWeight: '600' },
  stepTitle: { color: '#F4F4F5', fontSize: 24, fontWeight: '800', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 },
  optionalHint: { color: '#4B5563', fontSize: 12, paddingHorizontal: 24, marginBottom: 8 },
  body: { paddingHorizontal: 24, paddingBottom: 24 },
  label: { color: '#9CA3AF', fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  sublabel: { color: '#6B7280', fontSize: 12, marginBottom: 12 },
  input: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    color: '#F4F4F5',
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  phoneRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  phonePrefix: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#2C2C2E',
  },
  phonePrefixTxt: { color: '#9CA3AF', fontSize: 16 },
  hint: { color: '#4B5563', fontSize: 12, lineHeight: 18 },
  stateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stateBtn: {
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stateBtnActive: { borderColor: '#7C3AED', backgroundColor: '#3B0764' },
  stateTxt: { color: '#9CA3AF', fontSize: 13 },
  stateTxtActive: { color: '#C4B5FD', fontWeight: '700' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optBtn: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#2C2C2E',
    backgroundColor: '#1C1C1E',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optBtnActive: { borderColor: '#7C3AED', backgroundColor: '#3B0764' },
  optTxt: { color: '#9CA3AF', fontSize: 13 },
  optTxtActive: { color: '#C4B5FD', fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
    borderColor: '#1C1C1E',
  },
  backBtn: {
    flex: 1,
    backgroundColor: '#1C1C1E',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backTxt: { color: '#9CA3AF', fontSize: 16, fontWeight: '600' },
  nextBtn: {
    flex: 2,
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
