// Temporary in-memory storage for development without MongoDB
interface InMemoryData {
  projects: Map<string, any>;
  boards: Map<string, any>;
  columns: Map<string, any>;
  cards: Map<string, any>;
  users: Map<string, any>;
}

const store: InMemoryData = {
  projects: new Map(),
  boards: new Map(),
  columns: new Map(),
  cards: new Map(),
  users: new Map(),
};

export const memoryStore = {
  // Projects
  saveProject: (id: string, data: any) => store.projects.set(id, data),
  getProject: (id: string) => store.projects.get(id),
  getAllProjects: (userId: string) => {
    return Array.from(store.projects.values()).filter(
      (p) => p.members?.includes(userId) || p.createdBy === userId
    );
  },
  deleteProject: (id: string) => store.projects.delete(id),

  // Boards
  saveBoard: (id: string, data: any) => store.boards.set(id, data),
  getBoard: (id: string) => store.boards.get(id),
  getBoardsByProject: (projectId: string) => {
    return Array.from(store.boards.values()).filter((b) => b.projectId === projectId);
  },
  deleteBoard: (id: string) => store.boards.delete(id),

  // Columns
  saveColumn: (id: string, data: any) => store.columns.set(id, data),
  getColumn: (id: string) => store.columns.get(id),
  getColumnsByBoard: (boardId: string) => {
    return Array.from(store.columns.values()).filter((c) => c.boardId === boardId);
  },
  deleteColumn: (id: string) => store.columns.delete(id),

  // Cards
  saveCard: (id: string, data: any) => store.cards.set(id, data),
  getCard: (id: string) => store.cards.get(id),
  getCardsByColumn: (columnId: string) => {
    return Array.from(store.cards.values()).filter((c) => c.columnId === columnId);
  },
  deleteCard: (id: string) => store.cards.delete(id),

  // Users
  saveUser: (id: string, data: any) => store.users.set(id, data),
  getUser: (id: string) => store.users.get(id),
  getUserByEmail: (email: string) => {
    return Array.from(store.users.values()).find((u) => u.email === email);
  },

  // Clear all (for testing)
  clearAll: () => {
    store.projects.clear();
    store.boards.clear();
    store.columns.clear();
    store.cards.clear();
    store.users.clear();
  },
};
