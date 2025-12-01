import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../services/api';

// Projects
export const useProjects = () => {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => apiClient.getProjects(),
  });
};

export const useProject = (projectId: string | undefined) => {
  return useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => apiClient.getProject(projectId!),
    enabled: !!projectId,
  });
};

export const useCreateProject = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; description: string; visibility: string }) =>
      apiClient.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
};

// Boards
export const useCreateBoard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ projectId, data }: { projectId: string; data: { name: string } }) =>
      apiClient.createBoard(projectId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
    },
  });
};

// Columns
export const useCreateColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      boardId,
      data,
    }: {
      projectId: string;
      boardId: string;
      data: { name: string; order: number };
    }) => apiClient.createColumn(projectId, boardId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
    },
  });
};

export const useDeleteColumn = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      boardId,
      columnId,
    }: {
      projectId: string;
      boardId: string;
      columnId: string;
    }) => apiClient.deleteColumn(projectId, boardId, columnId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
    },
  });
};

// Cards
export const useCreateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      boardId,
      columnId,
      data,
    }: {
      projectId: string;
      boardId: string;
      columnId: string;
      data: { title: string; description?: string; order: number };
    }) => apiClient.createCard(projectId, boardId, columnId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
    },
  });
};

export const useUpdateCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      boardId,
      columnId,
      cardId,
      data,
    }: {
      projectId: string;
      boardId: string;
      columnId: string;
      cardId: string;
      data: { title?: string; description?: string };
    }) => apiClient.updateCard(projectId, boardId, columnId, cardId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
    },
  });
};

export const useDeleteCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      boardId,
      columnId,
      cardId,
    }: {
      projectId: string;
      boardId: string;
      columnId: string;
      cardId: string;
    }) => apiClient.deleteCard(projectId, boardId, columnId, cardId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
    },
  });
};

export const useMoveCard = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      boardId,
      cardId,
      data,
    }: {
      projectId: string;
      boardId: string;
      cardId: string;
      data: { sourceColumnId: string; targetColumnId: string; newOrder?: number };
    }) => apiClient.moveCard(projectId, boardId, cardId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', variables.projectId] });
    },
  });
};

// Notifications
export const useNotifications = (limit = 20, offset = 0) => {
  return useQuery({
    queryKey: ['notifications', limit, offset],
    queryFn: () => apiClient.getNotifications(limit, offset),
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (notificationId: string) => apiClient.markNotificationAsRead(notificationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
