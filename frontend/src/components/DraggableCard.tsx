import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card as CardType } from '../types';
import { useToast } from '../contexts/ToastContext';

interface DraggableCardProps {
  card: CardType;
  projectId: string;
  boardId: string;
  columnId: string;
  onDelete: (cardId: string) => void;
}

const DraggableCard: React.FC<DraggableCardProps> = ({
  card,
  projectId,
  boardId,
  columnId,
  onDelete,
}) => {
  const toast = useToast();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card._id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(card.title);
  const [description, setDescription] = React.useState(card.description || '');
  const [dueDate, setDueDate] = React.useState(
    card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : ''
  );

  const handleSave = async () => {
    try {
      const { apiClient } = await import('../services/api');
      await apiClient.updateCard(projectId, boardId, columnId, card._id, {
        title,
        description,
        dueDate: dueDate ? new Date(dueDate) : undefined,
      });
      setIsEditing(false);
      toast.success('Card updated successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to update card:', error);
      toast.error('Failed to update card');
    }
  };

  const handleDelete = async () => {
    try {
      const { apiClient } = await import('../services/api');
      await apiClient.deleteCard(projectId, boardId, columnId, card._id);
      onDelete(card._id);
      toast.success('Card deleted successfully');
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Failed to delete card:', error);
      toast.error('Failed to delete card');
    }
  };

  if (isEditing) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        className="bg-white p-3 rounded-lg shadow-sm border border-gray-200"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full mb-2 px-2 py-1 border border-gray-300 rounded"
          autoFocus
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-2 py-1 border border-gray-300 rounded resize-none"
          rows={2}
          placeholder="Description..."
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="w-full mt-2 px-2 py-1 border border-gray-300 rounded"
        />
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleSave}
            className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={() => {
              setTitle(card.title);
              setDescription(card.description || '');
              setDueDate(card.dueDate ? new Date(card.dueDate).toISOString().split('T')[0] : '');
              setIsEditing(false);
            }}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition cursor-move"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex justify-between items-start">
        <h4 className="font-medium text-gray-900">{card.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="text-gray-400 hover:text-red-600"
        >
          ×
        </button>
      </div>
      {card.description && <p className="text-sm text-gray-600 mt-1">{card.description}</p>}
      {card.dueDate && (
        <div className="text-xs text-blue-600 mt-2 flex items-center gap-1">
          <span>📅</span>
          <span>{
            (() => {
              const date = new Date(card.dueDate);
              const localDate = new Date(date.getTime() + date.getTimezoneOffset() * 60000);
              return localDate.toLocaleDateString('pt-BR');
            })()
          }</span>
        </div>
      )}
    </div>
  );
};

export default DraggableCard;
