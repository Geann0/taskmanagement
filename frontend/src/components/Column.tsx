import React, { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Column as ColumnType } from '../types';
import DraggableCard from './DraggableCard';
import { apiClient } from '../services/api';

interface ColumnProps {
  column: ColumnType;
  projectId: string;
  boardId: string;
  onCardCreated?: () => void;
}

const Column: React.FC<ColumnProps> = ({ column, projectId, boardId, onCardCreated }) => {
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');

  const cards = column.cards || [];

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    try {
      await apiClient.createCard(projectId, boardId, column._id, {
        title: newCardTitle,
        order: cards.length,
      });
      setNewCardTitle('');
      setIsAddingCard(false);

      // Trigger parent reload
      if (onCardCreated) {
        onCardCreated();
      }
    } catch (error) {
      console.error('Failed to create card:', error);
      alert('Failed to create card');
    }
  };

  const handleDeleteColumn = async () => {
    if (!window.confirm(`Delete column "${column.name}"? This will delete all cards in it.`)) {
      return;
    }

    try {
      await apiClient.deleteColumn(projectId, boardId, column._id);
    } catch (error) {
      console.error('Failed to delete column:', error);
      alert('Failed to delete column');
    }
  };

  const { setNodeRef } = useDroppable({
    id: column._id,
  });

  return (
    <div className="flex flex-col bg-gray-100 rounded-lg p-4 min-w-80 max-w-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">
          {column.name}
          <span className="ml-2 text-sm text-gray-600">({cards.length})</span>
        </h3>
        <button
          onClick={handleDeleteColumn}
          className="text-gray-500 hover:text-red-600 transition"
          title="Delete column"
        >
          ×
        </button>
      </div>

      <div ref={setNodeRef} className="flex-1 overflow-y-auto space-y-2 mb-4 min-h-[200px]">
        <SortableContext items={cards.map((c) => c._id)} strategy={verticalListSortingStrategy}>
          {cards
            .sort((a, b) => a.order - b.order)
            .map((card) => (
              <DraggableCard
                key={card._id}
                card={card}
                projectId={projectId}
                boardId={boardId}
                columnId={column._id}
                onDelete={() => {}} // Deletion handled via WebSocket
              />
            ))}
        </SortableContext>
      </div>

      {isAddingCard ? (
        <form onSubmit={handleAddCard} className="space-y-2">
          <textarea
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Enter card title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg resize-none"
            rows={2}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              Add Card
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAddingCard(false);
                setNewCardTitle('');
              }}
              className="px-3 py-1.5 bg-gray-300 text-gray-700 text-sm rounded hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setIsAddingCard(true)}
          className="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50 transition"
        >
          + Add Card
        </button>
      )}
    </div>
  );
};

export default Column;
