import { getSupabaseClient } from '../../lib/supabase';
import { DbPatientAppUser, DbPatientCaregiverLink } from '../../types/database';
import { UserProfile, PatientContext, Language } from '../../types';
import { mapAppUser } from '../../adapters/supabaseMappers';

export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: { user }, error: authErr } = await supabase.auth.getUser();
    if (authErr || !user) return null;

    const { data, error } = await supabase
      .from('patient_app_user')
      .select('*')
      .eq('auth_user_id', user.id)
      .single();

    if (error || !data) return null;
    return mapAppUser(data as DbPatientAppUser);
  } catch (err) {
    console.error('Failed to get current user from Supabase:', err);
    return null;
  }
}

export async function resolvePatientContextForUser(userId: string): Promise<PatientContext | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const { data: appUser, error: userErr } = await supabase
      .from('patient_app_user')
      .select('*')
      .eq('id', userId)
      .single();

    if (userErr || !appUser) return null;

    const typedUser = appUser as DbPatientAppUser;

    // Fetch patient master row
    const { data: patientData, error: patErr } = await supabase
      .from('patient')
      .select('*')
      .eq('id', typedUser.patient_id)
      .single();

    if (patErr || !patientData) return null;

    if (typedUser.role === 'patient') {
      return {
        userId: typedUser.id,
        role: 'patient',
        patientId: patientData.id,
        patientName: patientData.name,
        canMarkDone: true,
        hospital: patientData.hospital || undefined,
        primaryDoctor: patientData.primary_doctor || undefined,
        dischargeDate: patientData.discharge_date || undefined,
        dischargeDiagnosis: patientData.discharge_diagnosis || undefined,
      };
    } else {
      // Caregiver: check patient_caregiver_link
      const { data: linkData } = await supabase
        .from('patient_caregiver_link')
        .select('*')
        .eq('caregiver_user_id', typedUser.id)
        .eq('patient_id', patientData.id)
        .eq('status', 'active')
        .single();

      const link = linkData as DbPatientCaregiverLink | null;

      // Check specific tab permissions can_mark_done
      const { data: perms } = await supabase
        .from('patient_tab_permissions')
        .select('can_mark_done')
        .eq('user_id', typedUser.id)
        .single();

      const canMark = perms?.can_mark_done ?? (link?.can_mark_done ?? false);

      return {
        userId: typedUser.id,
        role: 'caregiver',
        patientId: patientData.id,
        patientName: patientData.name,
        relationship: link?.relationship || 'Caregiver',
        canMarkDone: canMark,
        hospital: patientData.hospital || undefined,
        primaryDoctor: patientData.primary_doctor || undefined,
        dischargeDate: patientData.discharge_date || undefined,
        dischargeDiagnosis: patientData.discharge_diagnosis || undefined,
      };
    }
  } catch (err) {
    console.error('Failed to resolve patient context:', err);
    return null;
  }
}

export async function updatePreferredLanguage(userId: string, lang: Language): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const { error } = await supabase
      .from('patient_app_user')
      .update({ preferred_language: lang, updated_at: new Date().toISOString() })
      .eq('id', userId);

    return !error;
  } catch {
    return false;
  }
}
