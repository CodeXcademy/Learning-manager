import React, { useState, useRef, useEffect, useCallback } from 'react';
import { X, Plus, Tag as TagIcon } from 'lucide-react';
import { useData } from '../store/DataContext';

interface TagManagerProps {
  noteId: string;
  currentTags: string[];
  onTagsChange: (tags: string[]) => void;
  'aria-label'?: string;
}

export function TagManager({ noteId, currentTags, onTagsChange, 'aria-label': ariaLabel }: TagManagerProps) {
  const { tags: allTags } = useData();
  const [inputValue, setInputValue] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Filter available tags for autocomplete
  const availableTags = allTags.filter(tag =>
    !currentTags.includes(tag.id) &&
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Get tag objects for current tags
  const currentTagObjects = allTags.filter(tag => currentTags.includes(tag.id));

  const handleAddTag = useCallback((tagId: string) => {
    if (!currentTags.includes(tagId)) {
      onTagsChange([...currentTags, tagId]);
      setInputValue('');
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [currentTags, onTagsChange]);

  const handleRemoveTag = useCallback((tagId: string) => {
    onTagsChange(currentTags.filter(id => id !== tagId));
  }, [currentTags, onTagsChange]);

  const handleCreateAndAddTag = useCallback(() => {
    const trimmedValue = inputValue.trim();
    if (trimmedValue && !allTags.some(tag => tag.name.toLowerCase() === trimmedValue.toLowerCase())) {
      // Create new tag (this would need to be added to DataContext)
      // For now, we'll just add the name as ID (temporary solution)
      const newTagId = `temp_${Date.now()}_${trimmedValue}`;
      onTagsChange([...currentTags, newTagId]);
      setInputValue('');
      setIsOpen(false);
      setSelectedIndex(-1);
    }
  }, [inputValue, allTags, currentTags, onTagsChange]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        e.preventDefault();
        setIsOpen(true);
        setSelectedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, availableTags.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && availableTags[selectedIndex]) {
          handleAddTag(availableTags[selectedIndex].id);
        } else if (inputValue.trim()) {
          handleCreateAndAddTag();
        }
        break;
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;
      case 'Tab':
        if (isOpen) {
          e.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
    }
  }, [isOpen, selectedIndex, availableTags, inputValue, handleAddTag, handleCreateAndAddTag]);

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    setIsOpen(true);
    setSelectedIndex(-1);
  }, []);

  const handleInputFocus = useCallback(() => {
    setIsOpen(true);
    setSelectedIndex(-1);
  }, []);

  const handleInputBlur = useCallback(() => {
    // Delay closing to allow for clicks on suggestions
    setTimeout(() => {
      setIsOpen(false);
      setSelectedIndex(-1);
    }, 150);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div
      ref={containerRef}
      className="space-y-2"
      role="group"
      aria-label={ariaLabel || "Note tags"}
    >
      {/* Current Tags Display */}
      {currentTagObjects.length > 0 && (
        <div className="flex flex-wrap gap-1" role="list" aria-label="Current tags">
          {currentTagObjects.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-full"
              role="listitem"
            >
              <TagIcon className="w-3 h-3" />
              {tag.name}
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                aria-label={`Remove tag ${tag.name}`}
                type="button"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Tag Input */}
      <div className="relative">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              placeholder="Add tags..."
              className="w-full px-3 py-2 text-sm border border-outline-variant/20 rounded-lg bg-surface-container focus:ring-2 focus:ring-primary/20 focus:border-primary focus:outline-none transition-colors"
              aria-label="Add tag"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              role="combobox"
            />
            {inputValue && (
              <button
                onClick={handleCreateAndAddTag}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-surface-container-high rounded transition-colors"
                aria-label="Create new tag"
                type="button"
              >
                <Plus className="w-4 h-4 text-primary" />
              </button>
            )}
          </div>
        </div>

        {/* Autocomplete Dropdown */}
        {isOpen && availableTags.length > 0 && (
          <div
            className="absolute top-full left-0 right-0 mt-1 bg-surface-container-high border border-outline-variant/20 rounded-lg shadow-lg z-50 max-h-48 overflow-y-auto"
            role="listbox"
            aria-label="Available tags"
          >
            {availableTags.map((tag, index) => (
              <button
                key={tag.id}
                onClick={() => handleAddTag(tag.id)}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-surface-container transition-colors ${
                  index === selectedIndex ? 'bg-primary/10 text-primary' : 'text-on-surface'
                }`}
                role="option"
                aria-selected={index === selectedIndex}
                type="button"
              >
                <div className="flex items-center gap-2">
                  <TagIcon className="w-4 h-4" />
                  {tag.name}
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Create New Tag Option */}
        {isOpen && inputValue.trim() && !availableTags.some(tag => tag.name.toLowerCase() === inputValue.toLowerCase()) && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-surface-container-high border border-outline-variant/20 rounded-lg shadow-lg z-50">
            <button
              onClick={handleCreateAndAddTag}
              className={`w-full px-3 py-2 text-left text-sm hover:bg-surface-container transition-colors ${
                selectedIndex === availableTags.length ? 'bg-primary/10 text-primary' : 'text-on-surface'
              }`}
              role="option"
              aria-selected={selectedIndex === availableTags.length}
              type="button"
            >
              <div className="flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Create "{inputValue.trim()}"
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}