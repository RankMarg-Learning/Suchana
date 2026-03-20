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
import { registerUser, checkUserByPhone } from '@/services/userService';
import { useUser } from '@/context/UserContext';
import { CategoryChip } from '@/components/CategoryChip';
import { ExamCategory, QualificationLevel } from '@/constants/enums';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useThemeColor } from '@/hooks/use-theme-color';

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

  const background = useThemeColor({}, 'background');
  const textPrimary = useThemeColor({}, 'text');
  const textMuted = useThemeColor({}, 'textMuted');
  const cardBg = useThemeColor({}, 'card');
  const tint = useThemeColor({}, 'tint');
  const border = useThemeColor({}, 'border');

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

  const handleNext = async () => {
    if (!canProceed()) return;
    
    if (step === 0) {
      setLoading(true);
      try {
        const res = await checkUserByPhone(phone.trim());
        if (res.isRegistered && res.data) {
          setUser(res.data);
          return router.replace('/(tabs)');
        }
      } catch (e) {
        // proceed if check fails
      } finally {
        setLoading(false);
      }
    }
    setStep(s => s + 1);
  };

  return (
    <SafeAreaView style={[styles.root, { backgroundColor: background }]}>
      {/* Top bar: progress + skip */}
      <View style={styles.topBar}>
        <View style={styles.progressRow}>
          {STEPS.map((_, i) => (
            <View
              key={i}
              style={[styles.progressDot, { backgroundColor: border }, i <= step && [styles.progressActive, { backgroundColor: tint }]]}
            />
          ))}
        </View>
        <TouchableOpacity onPress={() => router.replace('/(tabs)')} style={[styles.skipBtn, { backgroundColor: cardBg }]}>
          <Text style={[styles.skipTxt, { color: textMuted }]}>Skip</Text>
        </TouchableOpacity>
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingTop: 16 }}>
        {(() => {
          const StepIcon = STEPS[step].icon;
          return <StepIcon size={24} color={tint} style={{ marginRight: 12 }} />;
        })()}
        <Text style={[styles.stepTitle, { color: textPrimary, paddingHorizontal: 0, paddingTop: 0, paddingBottom: 0 }]}>
          {STEPS[step].label}
        </Text>
      </View>
      <Text style={[styles.optionalHint, { color: textMuted }]}>Optional · for personalised exam recommendations</Text>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.body}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>

          {/* Step 0: Name + Phone */}
          {step === 0 && (
            <View>
              <Text style={[styles.label, { color: textMuted }]}>Your Name</Text>
              <TextInput
                style={[styles.input, { backgroundColor: cardBg, borderColor: border, color: textPrimary }]}
                placeholder="Ravi Kumar"
                placeholderTextColor={textMuted}
                value={name}
                onChangeText={setName}
              />
              <Text style={[styles.label, { color: textMuted }]}>Mobile Number</Text>
              <View style={styles.phoneRow}>
                <View style={[styles.phonePrefix, { backgroundColor: cardBg, borderColor: border }]}><Text style={[styles.phonePrefixTxt, { color: textMuted }]}>+91</Text></View>
                <TextInput
                  style={[styles.input, { backgroundColor: cardBg, borderColor: border, color: textPrimary, flex: 1, marginBottom: 0 }]}
                  placeholder="9876543210"
                  placeholderTextColor={textMuted}
                  keyboardType="phone-pad"
                  maxLength={10}
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>
              <Text style={[styles.hint, { color: textMuted }]}>
                Your number is your identity — no OTP needed.{'\n'}We'll use it to sync your profile.
              </Text>
            </View>
          )}

          {/* Step 1: State */}
          {step === 1 && (
            <View>
              <Text style={[styles.label, { color: textMuted }]}>Select your State / UT</Text>
              <View style={styles.stateGrid}>
                {INDIA_STATES.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.stateBtn, { backgroundColor: cardBg, borderColor: border }, state === s && [styles.stateBtnActive, { borderColor: tint, backgroundColor: tint + '18' }]]}
                    onPress={() => setState(prev => prev === s ? '' : s)}>
                    <Text style={[styles.stateTxt, { color: textMuted }, state === s && [styles.stateTxtActive, { color: tint }]]} numberOfLines={1}>
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
              <Text style={[styles.label, { color: textMuted }]}>Which exams are you preparing for?</Text>
              <Text style={[styles.sublabel, { color: textMuted }]}>Select all that apply</Text>
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
              <Text style={[styles.label, { color: textMuted }]}>Gender</Text>
              <View style={styles.optionRow}>
                {[
                  { v: 'MALE', l: 'Male', i: User },
                  { v: 'FEMALE', l: 'Female', i: User },
                  { v: 'OTHER', l: 'Other', i: User },
                ].map(g => (
                  <TouchableOpacity
                    key={g.v}
                    style={[styles.optBtn, { backgroundColor: cardBg, borderColor: border }, gender === g.v && [styles.optBtnActive, { borderColor: tint, backgroundColor: tint + '18' }]]}
                    onPress={() => setGender(prev => prev === g.v ? '' : g.v)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <g.i size={14} color={gender === g.v ? tint : textMuted} style={{ marginRight: 6 }} />
                      <Text style={[styles.optTxt, { color: textMuted }, gender === g.v && [styles.optTxtActive, { color: tint }]]}>
                        {g.l}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: textMuted }]}>Qualification</Text>
              <View style={styles.optionRow}>
                {[
                  { v: QualificationLevel.TEN_PASS, l: '10th' },
                  { v: QualificationLevel.TWELVE_PASS, l: '12th' },
                  { v: QualificationLevel.GRADUATE, l: 'Graduate' },
                  { v: QualificationLevel.POST_GRADUATE, l: 'PG' },
                ].map(q => (
                  <TouchableOpacity
                    key={q.v}
                    style={[styles.optBtn, { backgroundColor: cardBg, borderColor: border }, qualification === q.v && [styles.optBtnActive, { borderColor: tint, backgroundColor: tint + '18' }]]}
                    onPress={() => setQualification(prev => prev === q.v ? '' : q.v)}>
                    <Text style={[styles.optTxt, { color: textMuted }, qualification === q.v && [styles.optTxtActive, { color: tint }]]}>
                      {q.l}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: textMuted }]}>Employment Status</Text>
              <View style={styles.optionRow}>
                {[
                  { v: 'STUDENT', l: 'Student', i: GraduationCap },
                  { v: 'EMPLOYED', l: 'Employed', i: Briefcase },
                  { v: 'UNEMPLOYED', l: 'Job Seeking', i: Search },
                ].map(e => (
                  <TouchableOpacity
                    key={e.v}
                    style={[styles.optBtn, { backgroundColor: cardBg, borderColor: border }, employment === e.v && [styles.optBtnActive, { borderColor: tint, backgroundColor: tint + '18' }]]}
                    onPress={() => setEmployment(prev => prev === e.v ? '' : e.v)}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <e.i size={14} color={employment === e.v ? tint : textMuted} style={{ marginRight: 6 }} />
                      <Text style={[styles.optTxt, { color: textMuted }, employment === e.v && [styles.optTxtActive, { color: tint }]]}>{e.l}</Text>
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Step 4: Specialisation */}
          {step === 4 && (
            <View>
              <Text style={[styles.label, { color: textMuted }]}>Your Degree / Diploma</Text>
              <View style={styles.stateGrid}>
                {DEGREES.map(d => (
                  <TouchableOpacity
                    key={d}
                    style={[styles.stateBtn, { backgroundColor: cardBg, borderColor: border }, degree === d && [styles.stateBtnActive, { borderColor: tint, backgroundColor: tint + '18' }]]}
                    onPress={() => setDegree(prev => prev === d ? '' : d)}>
                    <Text style={[styles.stateTxt, { color: textMuted }, degree === d && [styles.stateTxtActive, { color: tint }]]}>
                      {d}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.label, { color: textMuted, marginTop: 24 }]}>Branch / Specialisation</Text>
              <View style={styles.stateGrid}>
                {SPECIALIZATIONS.map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[styles.stateBtn, { backgroundColor: cardBg, borderColor: border }, specialization === s && [styles.stateBtnActive, { borderColor: tint, backgroundColor: tint + '18' }]]}
                    onPress={() => setSpecialization(prev => prev === s ? '' : s)}>
                    <Text style={[styles.stateTxt, { color: textMuted }, specialization === s && [styles.stateTxtActive, { color: tint }]]}>
                      {s}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.hint, { color: textMuted, marginTop: 16 }]}>
                Help us show you exact "Job Roles" that match your {degree || 'Degree'} {specialization ? `in ${specialization}` : ''}.
              </Text>
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* CTA */}
      <View style={[styles.footer, { borderTopColor: border }]}>
        {step > 0 && (
          <TouchableOpacity style={[styles.backBtn, { backgroundColor: cardBg }]} onPress={() => setStep(s => s - 1)}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <ChevronLeft size={20} color={textMuted} style={{ marginRight: 4 }} />
              <Text style={[styles.backTxt, { color: textMuted }]}>Back</Text>
            </View>
          </TouchableOpacity>
        )}
        {step < STEPS.length - 1 ? (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: tint }, (!canProceed() || loading) && styles.nextBtnDisabled]}
            onPress={handleNext}
            disabled={!canProceed() || loading}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.nextTxt}>Next</Text>
                <ChevronRight size={20} color="#fff" style={{ marginLeft: 4 }} />
              </View>
            )}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.nextBtn, { backgroundColor: tint }, loading && styles.nextBtnDisabled]}
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
  root: { flex: 1 },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 24, paddingTop: 16, paddingBottom: 4 },
  progressRow: { flexDirection: 'row', gap: 6 },
  progressDot: { width: 8, height: 8, borderRadius: 4 },
  progressActive: { width: 24 },
  skipBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8 },
  skipTxt: { fontSize: 13, fontWeight: '600' },
  stepTitle: { fontSize: 24, fontWeight: '800' },
  optionalHint: { fontSize: 12, paddingHorizontal: 24, marginBottom: 8 },
  body: { paddingHorizontal: 24, paddingBottom: 24 },
  label: { fontSize: 13, fontWeight: '600', marginBottom: 8, marginTop: 8 },
  sublabel: { fontSize: 12, marginBottom: 12 },
  input: {
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  phoneRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  phonePrefix: {
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    borderWidth: 1,
  },
  phonePrefixTxt: { fontSize: 16 },
  hint: { fontSize: 12, lineHeight: 18 },
  stateGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  stateBtn: {
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  stateBtnActive: {  },
  stateTxt: { fontSize: 13 },
  stateTxtActive: { fontWeight: '700' },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  optionRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  optBtn: {
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optBtnActive: {  },
  optTxt: { fontSize: 13 },
  optTxtActive: { fontWeight: '700' },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingBottom: 24,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  backBtn: {
    flex: 1,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  backTxt: { fontSize: 16, fontWeight: '600' },
  nextBtn: {
    flex: 2,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextBtnDisabled: { opacity: 0.5 },
  nextTxt: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
