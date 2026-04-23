import { useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '@/lib/api';

export interface ProposalData {
  vehicle_id: string;
  buyer_name: string;
  buyer_email?: string;
  buyer_phone: string;
  amount: number;
  message?: string;
}

export function useCreateProposal() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: ProposalData) => {
      return await fetchApi<{ success: boolean; proposalId: string }>('/proposals', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proposals'] });
    },
  });
}
