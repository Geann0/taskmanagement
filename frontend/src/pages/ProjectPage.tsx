import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { DndContext, DragEndEvent, closestCorners, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { apiClient } from '../services/api';
import { socketService } from '../lib/socket';
import { notificationService } from '../services/notifications';
import { useToast } from '../contexts/ToastContext';
import Header from '../components/Header';
import ColumnComponent from '../components/Column';
import { Project, Board, Column } from '../types';

const ProjectPage: React.FC = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [boards, setBoards] = useState<Board[]>([]);
  const [selectedBoard, setSelectedBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<Column[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBoard, setIsCreatingBoard] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [newColumnName, setNewColumnName] = useState('');

  useEffect(() => {
    if (projectId) {
      loadProject();
      setupSocketListeners();
    }

    return () => {
      if (projectId) {
        socketService.leaveProject(projectId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const loadProject = async () => {
    if (!projectId) return;

    try {
      const data = await apiClient.getProject(projectId);
      setProject(data);
      setBoards(data.boards || []);

      // Preserve selected board or select first if none selected
      if (data.boards && data.boards.length > 0) {
        const currentBoardId = selectedBoard?._id;
        const boardToSelect = currentBoardId
          ? data.boards.find((b) => b._id === currentBoardId) || data.boards[0]
          : data.boards[0];

        setSelectedBoard(boardToSelect);
        setColumns(boardToSelect.columns || []);
      }

      socketService.joinProject(projectId);
    } catch (error) {
      console.error('Failed to load project:', error);
      navigate('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  const setupSocketListeners = () => {
    if (!projectId) return;

    const socket = socketService.getSocket();
    if (!socket) return;

    // Listen for board events
    socket.on('board:created', (newBoard: Board) => {
      setBoards((prev) => [...prev, newBoard]);
    });

    // Listen for column events
    socket.on('column:created', ({ boardId, column }: { boardId: string; column: Column }) => {
      setBoards((prev) =>
        prev.map((board) =>
          board._id === boardId ? { ...board, columns: [...(board.columns || []), column] } : board
        )
      );

      // Only update columns if we're viewing this board
      if (selectedBoard?._id === boardId) {
        setColumns((prev) => {
          // Check if column already exists to prevent duplicates
          const exists = prev.some((col) => col._id === column._id);
          return exists ? prev : [...prev, column];
        });
      }
    });

    socket.on('column:deleted', ({ boardId, columnId }: { boardId: string; columnId: string }) => {
      setBoards((prev) =>
        prev.map((board) =>
          board._id === boardId
            ? { ...board, columns: (board.columns || []).filter((col) => col._id !== columnId) }
            : board
        )
      );

      if (selectedBoard?._id === boardId) {
        setColumns((prev) => prev.filter((col) => col._id !== columnId));
      }
    });

    // Listen for card events
    socket.on('card:created', ({ boardId, columnId, card }: any) => {
      if (selectedBoard?._id === boardId) {
        setColumns((prev) =>
          prev.map((col) =>
            col._id === columnId ? { ...col, cards: [...(col.cards || []), card] } : col
          )
        );
      }
    });

    socket.on('card:updated', ({ boardId, columnId, card }: any) => {
      if (selectedBoard?._id === boardId) {
        setColumns((prev) =>
          prev.map((col) =>
            col._id === columnId
              ? {
                  ...col,
                  cards: (col.cards || []).map((c) => (c._id === card._id ? card : c)),
                }
              : col
          )
        );
        // Show notification if not the current user's update
        if (notificationService.hasPermission() && document.hidden) {
          notificationService.cardUpdated(card.title, projectId!);
        }
      }
    });

    socket.on('card:deleted', ({ boardId, columnId, cardId }: any) => {
      if (selectedBoard?._id === boardId) {
        setColumns((prev) =>
          prev.map((col) =>
            col._id === columnId
              ? { ...col, cards: (col.cards || []).filter((c) => c._id !== cardId) }
              : col
          )
        );
      }
    });

    socket.on('card:moved', ({ boardId, cardId, sourceColumnId, targetColumnId, card }: any) => {
      if (selectedBoard?._id === boardId) {
        setColumns((prev) =>
          prev.map((col) => {
            if (col._id === sourceColumnId) {
              return { ...col, cards: (col.cards || []).filter((c) => c._id !== cardId) };
            }
            if (col._id === targetColumnId) {
              return { ...col, cards: [...(col.cards || []), card] };
            }
            return col;
          })
        );
        // Show notification for card movements
        if (notificationService.hasPermission() && document.hidden) {
          const targetCol = columns.find((c) => c._id === targetColumnId);
          if (targetCol) {
            notificationService.cardMoved(card.title, targetCol.name, projectId!);
          }
        }
      }
    });

    // eslint-disable-next-line no-console
    console.log('✅ Socket listeners configured for project:', projectId);
  };

  const handleExportPDF = async () => {
    if (!projectId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/projects/${projectId}/export/pdf`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${project?.name.replace(/[^a-z0-9]/gi, '_')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error('Failed to export PDF');
      }
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Failed to export PDF');
    }
  };

  const handleSyncCalendar = async () => {
    if (!projectId) return;

    try {
      const result = await apiClient.syncProjectCalendar(projectId);
      toast.success(`${result.message}\n\nEvents created: ${result.eventsCreated}/${result.totalCards || 0}`);
    } catch (error: any) {
      console.error('Error syncing calendar:', error);
      const message =
        error.response?.data?.message ||
        'Failed to sync calendar. Make sure you are logged in with Google.';
      toast.error(message);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !newBoardName.trim()) return;

    setIsCreatingBoard(true);
    try {
      const newBoard = await apiClient.createBoard(projectId, { name: newBoardName });
      setBoards([...boards, newBoard]);
      setNewBoardName('');

      if (!selectedBoard) {
        setSelectedBoard(newBoard);
        setColumns([]);
      }
    } catch (error) {
      console.error('Failed to create board:', error);
      alert('Failed to create board');
    } finally {
      setIsCreatingBoard(false);
    }
  };

  const handleSelectBoard = (board: Board) => {
    setSelectedBoard(board);
    setColumns(board.columns || []);
  };

  const handleCreateColumn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectId || !selectedBoard || !newColumnName.trim()) return;

    try {
      await apiClient.createColumn(projectId, selectedBoard._id, {
        name: newColumnName,
        order: columns.length,
      });
      setNewColumnName('');
      setIsCreatingColumn(false);
      // Reload to get updated columns from backend
      await loadProject();
    } catch (error) {
      console.error('Failed to create column:', error);
      alert('Failed to create column');
    }
  };

  const handleDragStart = (_event: DragStartEvent) => {
    // Can be used for drag overlay in the future
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !projectId || !selectedBoard) return;

    const cardId = active.id as string;
    const overId = over.id as string;

    // If dropping on itself, do nothing
    if (cardId === overId) return;

    // Find source column and card
    const sourceColumn = columns.find((col) => col.cards?.some((card) => card._id === cardId));
    if (!sourceColumn) return;

    const card = sourceColumn.cards?.find((c) => c._id === cardId);
    if (!card) return;

    // Find target: is it a column or a card?
    let targetColumn = columns.find((col) => col._id === overId);
    let targetCard = null;

    if (!targetColumn) {
      // overId is a card, find which column it belongs to
      for (const col of columns) {
        const foundCard = col.cards?.find((c) => c._id === overId);
        if (foundCard) {
          targetColumn = col;
          targetCard = foundCard;
          break;
        }
      }
    }

    if (!targetColumn) return;

    const isSameColumn = sourceColumn._id === targetColumn._id;

    // Same column reordering
    if (isSameColumn) {
      const cards = [...(sourceColumn.cards || [])];
      const oldIndex = cards.findIndex((c) => c._id === cardId);

      if (oldIndex === -1) return;

      let newIndex: number;

      if (targetCard) {
        // Dropped on a card - get the current index of target card
        newIndex = cards.findIndex((c) => c._id === overId);
        if (newIndex === -1) return;
      } else {
        // Dropped on column empty space - move to end
        newIndex = cards.length - 1;
      }

      // Don't do anything if already in the same position
      if (oldIndex === newIndex) return;

      // Use arrayMove for reordering - it handles the logic correctly
      const reorderedCards = arrayMove(cards, oldIndex, newIndex);

      // Update order property for all cards
      const cardsWithUpdatedOrder = reorderedCards.map((c, index) => ({
        ...c,
        order: index,
      }));

      // Update UI optimistically
      setColumns((prevColumns) =>
        prevColumns.map((col) =>
          col._id === sourceColumn._id ? { ...col, cards: cardsWithUpdatedOrder } : col
        )
      );

      // Calculate the final index for backend after the move
      const finalIndex = reorderedCards.findIndex((c) => c._id === cardId);

      // Persist to backend
      try {
        await apiClient.moveCard(projectId, selectedBoard._id, cardId, {
          sourceColumnId: sourceColumn._id,
          targetColumnId: sourceColumn._id,
          newOrder: finalIndex,
        });
      } catch (error) {
        console.error('Failed to reorder card:', error);
        loadProject(); // Revert on error
      }

      return;
    }

    // Move card between columns
    try {
      const newOrder = targetCard
        ? (targetColumn.cards?.findIndex((c) => c._id === overId) ?? 0)
        : (targetColumn.cards?.length ?? 0);

      // Optimistic update
      setColumns((prevColumns) =>
        prevColumns.map((col) => {
          if (col._id === sourceColumn._id) {
            return {
              ...col,
              cards: col.cards?.filter((c) => c._id !== cardId) || [],
            };
          }
          if (col._id === targetColumn._id) {
            const newCards = [...(col.cards || [])];
            newCards.splice(newOrder, 0, card);
            return { ...col, cards: newCards };
          }
          return col;
        })
      );

      // Persist to backend
      await apiClient.moveCard(projectId, selectedBoard._id, cardId, {
        sourceColumnId: sourceColumn._id,
        targetColumnId: targetColumn._id,
        newOrder,
      });
    } catch (error) {
      console.error('Failed to move card:', error);
      // Revert on error
      setColumns(columns);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Project Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <button
                onClick={() => navigate('/dashboard')}
                className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-2"
              >
                ← Back to Dashboard
              </button>
              <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
              <p className="text-gray-600 mt-1">{project.description}</p>
            </div>
            <button
              onClick={handleExportPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Export PDF
            </button>
          </div>
        </div>

        {/* Boards Tabs */}
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="flex items-center gap-2 p-4 overflow-x-auto">
            {boards.map((board) => (
              <button
                key={board._id}
                onClick={() => handleSelectBoard(board)}
                className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition ${
                  selectedBoard?._id === board._id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {board.name}
              </button>
            ))}

            {/* Create Board Button/Form */}
            {isCreatingBoard ? (
              <form onSubmit={handleCreateBoard} className="flex gap-2">
                <input
                  type="text"
                  value={newBoardName}
                  onChange={(e) => setNewBoardName(e.target.value)}
                  placeholder="Board name"
                  className="px-3 py-2 border border-gray-300 rounded-lg"
                  autoFocus
                />
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreatingBoard(false);
                    setNewBoardName('');
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingBoard(true)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 font-medium"
              >
                + New Board
              </button>
            )}
          </div>
        </div>

        {/* Board Content */}
        {selectedBoard ? (
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">{selectedBoard.name}</h2>

              <div className="flex gap-2">
                <button
                  onClick={handleSyncCalendar}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
                  title="Sync cards with Google Calendar"
                >
                  <span>📅</span>
                  <span>Sync Calendar</span>
                </button>
                {!isCreatingColumn ? (
                  <button
                    onClick={() => setIsCreatingColumn(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    + Add Column
                  </button>
                ) : (
                  <form onSubmit={handleCreateColumn} className="flex gap-2">
                    <input
                      type="text"
                      value={newColumnName}
                      onChange={(e) => setNewColumnName(e.target.value)}
                      placeholder="Column name..."
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      autoFocus
                    />
                    <button
                      type="submit"
                      disabled={!newColumnName.trim()}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreatingColumn(false);
                        setNewColumnName('');
                      }}
                      className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </form>
                )}
              </div>
            </div>

            {/* Columns */}
            <DndContext
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              collisionDetection={closestCorners}
            >
              <div className="flex gap-4 overflow-x-auto pb-4">
                {columns.length === 0 ? (
                  <div className="text-center py-12 w-full">
                    <p className="text-gray-600">
                      No columns yet. Add your first column to get started!
                    </p>
                  </div>
                ) : (
                  columns
                    .sort((a, b) => a.order - b.order)
                    .map((column) => (
                      <ColumnComponent
                        key={column._id}
                        column={column}
                        projectId={projectId!}
                        boardId={selectedBoard._id}
                        onCardCreated={loadProject}
                      />
                    ))
                )}
              </div>
            </DndContext>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <p className="text-gray-600">
              No boards yet. Create your first board to start organizing tasks!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectPage;
