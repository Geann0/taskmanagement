import React, { useState } from 'react';
import { Card as CardType } from '../types';
import { apiClient } from '../services/api';

interface CardProps {
  card: CardType;
  projectId: string;
  boardId: string;
  columnId: string;
  onDelete: (cardId: string) => void;
}

const Card: React.FC<CardProps> = ({ card, projectId, boardId, columnId, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');

  const handleSave = async () => {
    try {
      await apiClient.updateCard(projectId, boardId, columnId, card._id, {
        title,
        description,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update card:', error);
      alert('Failed to update card');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this card?')) return;

    try {
      await apiClient.deleteCard(projectId, boardId, columnId, card._id);
      onDelete(card._id);
    } catch (error) {
      console.error('Failed to delete card:', error);
      alert('Failed to delete card');
    }
  };

  if (isEditing) {
    return (
      <div className="bg-white p-3 rounded-lg shadow border border-blue-400">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-2 py-1 mb-2 border border-gray-300 rounded text-sm"
          placeholder="Card title"
        />
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full px-2 py-1 mb-2 border border-gray-300 rounded text-sm resize-none"
          placeholder="Description (optional)"
          rows={2}
        />
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="flex-1 px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700"
          >
            Save
          </button>
          <button
            onClick={() => {
              setTitle(card.title);
              setDescription(card.description || '');
              setIsEditing(false);
            }}
            className="px-2 py-1 bg-gray-300 text-gray-700 text-xs rounded hover:bg-gray-400"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="bg-white p-3 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition cursor-pointer group"
      onClick={() => setIsEditing(true)}
    >
      <div className="flex justify-between items-start mb-1">
        <h4 className="font-medium text-gray-900 text-sm flex-1">{card.title}</h4>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition ml-2"
        >
          ×
        </button>
      </div>
      {card.description && (
        <p className="text-xs text-gray-600 mt-1 line-clamp-2">{card.description}</p>
      )}
    </div>
  );
};

export default Card;
