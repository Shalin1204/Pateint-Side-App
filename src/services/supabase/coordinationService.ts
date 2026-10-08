import { getSupabaseClient } from '../../lib/supabase';
import { DbCoordinationCard, DbCoordinationCardStatus, DbCoordinationCardType } from '../../types/database';
import { CoordinationCard, CoordinationCardStatus } from '../../types';
import { mapCoordinationCard } from '../../adapters/supabaseMappers';

export async function fetchCoordinationCards(patientId: string): Promise<CoordinationCard[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  try {
    const { data, error } = await supabase
      .from('coordination_card')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching coordination cards:', error);
      return [];
    }

    return (data as DbCoordinationCard[]).map(mapCoordinationCard);
  } catch (err) {
    console.error('Exception fetching coordination cards:', err);
    return [];
  }
}

export async function createCoordinationCard(
  card: Omit<CoordinationCard, 'id' | 'createdAt' | 'status'> & { status?: CoordinationCardStatus }
): Promise<CoordinationCard | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  try {
    const payload: Partial<DbCoordinationCard> = {
      patient_id: card.patientId,
      card_type: card.type as DbCoordinationCardType,
      raised_by: card.raisedBy,
      raised_by_name: card.raisedByName,
      description: card.description,
      status: (card.status || 'needs-review') as DbCoordinationCardStatus,
      care_team_notes: card.careTeamNotes || null,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('coordination_card')
      .insert(payload)
      .select('*')
      .single();

    if (error || !data) {
      console.error('Error creating coordination card:', error);
      return null;
    }

    return mapCoordinationCard(data as DbCoordinationCard);
  } catch (err) {
    console.error('Exception creating coordination card:', err);
    return null;
  }
}

export async function updateCoordinationCardStatus(
  id: string,
  status: CoordinationCardStatus,
  careTeamNotes?: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  try {
    const payload: Partial<DbCoordinationCard> = {
      status: status as DbCoordinationCardStatus,
      care_team_notes: careTeamNotes || undefined,
      resolved_at: status === 'resolved' ? new Date().toISOString() : undefined,
    };

    const { error } = await supabase
      .from('coordination_card')
      .update(payload)
      .eq('id', id);

    return !error;
  } catch (err) {
    console.error('Exception updating coordination card:', err);
    return false;
  }
}
