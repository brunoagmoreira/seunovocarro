import { fetchApi } from '@/lib/api';

export interface ProposalData {
  vehicleId: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
  source?: string;
}

export async function submitProposal(data: ProposalData) {
  return await fetchApi<{ success: boolean; leadId: string }>('/leads', {
    method: 'POST',
    body: JSON.stringify({
      vehicle_id: data.vehicleId,
      name: data.name,
      email: data.email,
      phone: data.phone,
      source: data.source || 'website',
      message: data.message,
    }),
  });
}

// In future, you might query user's leads via fetchApi if useProposals provided a query for received proposals
