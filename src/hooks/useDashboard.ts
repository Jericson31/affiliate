import { useQuery } from '@tanstack/react-query';

export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('Failed to fetch stats');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useSalesData = () => {
  return useQuery({
    queryKey: ['sales-data'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/sales-data');
      if (!response.ok) throw new Error('Failed to fetch sales data');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTopLists = () => {
  return useQuery({
    queryKey: ['top-lists'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/top-lists');
      if (!response.ok) throw new Error('Failed to fetch top lists');
      return response.json();
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useSalesStats = () => {
  return useQuery({
    queryKey: ['sales-stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/sales-stats');
      if (!response.ok) throw new Error('Failed to fetch sales stats');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useTransactionsData = () => {
  return useQuery({
    queryKey: ['transactions-data'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions data');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLeadsData = () => {
  return useQuery({
    queryKey: ['leads-data'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/leads');
      if (!response.ok) throw new Error('Failed to fetch leads data');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useLinksData = () => {
  return useQuery({
    queryKey: ['links-data'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/links');
      if (!response.ok) throw new Error('Failed to fetch links data');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};