'use client';

import { useState, useCallback, useRef } from 'react';

import CatCompanion from '@/components/CatCompanion';
import FloatingDecorations from '@/components/FloatingDecorations';
import LLMReplyBubble from '@/components/LLMReplyBubble';
import MoodBackground from '@/components/MoodBackground';
import HistoryModal from '@/components/notes/HistoryModal';
import NoteEditorModal from '@/components/notes/NoteEditorModal';
import NoteGrid from '@/components/notes/NoteGrid';
import { CHINESE_MOOD_MAP } from '@/config/moodConfig';
import { useMood } from '@/hooks/useMood';
import { useNotes } from '@/hooks/useNotes';
import type { Mood } from '@/types/mood';
import type { Note } from '@/types/note';

const MoodTestPage = () => {
  const { currentMood, setMood } = useMood();
  const { notes, addNote, deleteNote, updateNote } = useNotes();
  const [showBubble, setShowBubble] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [llmMood, setLlmMood] = useState<Mood | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [noteInput, setNoteInput] = useState('');
  const [isInputVisible, setIsInputVisible] = useState(false);
  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editInput, setEditInput] = useState('');
  const abortControllerRef = useRef<AbortController | null>(null);

  const handleSendNote = useCallback(async () => {
    if (!noteInput.trim() || isStreaming) return;

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    setShowBubble(true);
    setReplyText('');
    setLlmMood(null);
    setIsStreaming(true);
    setIsInputVisible(false);

    const content = noteInput;
    let detectedMood: Mood | null = null;

    try {
      const response = await fetch('http://localhost:3001/api/note', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) return;

      const reader = response.body?.getReader();
      if (!reader) return;

      const decoder = new TextDecoder();
      let buffer = '';

      // eslint-disable-next-line no-constant-condition
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6).trim();
            if (data && data !== '[DONE]') {
              try {
                const json = JSON.parse(data);
                if (json.mood) {
                  const moodKey = CHINESE_MOOD_MAP[json.mood as string];
                  if (moodKey) {
                    detectedMood = moodKey;
                    setLlmMood(moodKey);
                    setMood(moodKey);
                  }
                }
                if (json.text) {
                  setReplyText(prev => prev + json.text);
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        // Request cancelled
      } else {
        console.error('Error sending note:', error);
      }
    } finally {
      setIsStreaming(false);
      if (detectedMood) {
        addNote(content, detectedMood);
      }
    }
  }, [noteInput, isStreaming, setMood, addNote]);

  const handleCloseBubble = useCallback(() => {
    setShowBubble(false);
    setReplyText('');
    setLlmMood(null);
  }, []);

  const handleCreateNote = () => {
    setIsInputVisible(true);
    setNoteInput('');
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setEditInput(note.content);
  };

  const handleSaveEdit = () => {
    if (editingNote && editInput.trim()) {
      updateNote(editingNote.id, editInput.trim());
      setEditingNote(null);
      setEditInput('');
    }
  };

  return (
    <MoodBackground mood={currentMood}>
      <FloatingDecorations />
      <CatCompanion mood={currentMood} />
      <LLMReplyBubble
        replyText={replyText}
        mood={llmMood}
        isVisible={showBubble}
        onClose={handleCloseBubble}
      />

      {isInputVisible && (
        <NoteEditorModal
          title="记录此刻的心情"
          value={noteInput}
          onChange={setNoteInput}
          onCancel={() => setIsInputVisible(false)}
          onSubmit={handleSendNote}
          submitLabel="发送"
          submittingLabel="发送中..."
          isSubmitting={isStreaming}
        />
      )}

      {editingNote && (
        <NoteEditorModal
          title="编辑便签"
          value={editInput}
          onChange={setEditInput}
          onCancel={() => setEditingNote(null)}
          onSubmit={handleSaveEdit}
          submitLabel="保存"
        />
      )}

      {isHistoryVisible && (
        <HistoryModal
          notes={notes}
          onClose={() => setIsHistoryVisible(false)}
          onDeleteNote={deleteNote}
          onEditNote={handleEditNote}
        />
      )}

      <button
        type="button"
        onClick={handleCreateNote}
        className="fixed top-6 right-6 z-50 note-button px-6 py-3 rounded-2xl bg-white/80 backdrop-blur-sm shadow-lg border-2 border-white/50 text-purple-600 font-bold text-base transition-transform hover:scale-105 active:scale-95"
      >
        记录下今日的便签吧！
      </button>

      <div className="flex flex-col items-center pt-16">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-white/30 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-lg">
            <span className="text-xl">📝</span>
          </div>
          <h1 className="text-4xl font-extrabold text-gray-700 tracking-tight">
            PsycheNote Canvas
          </h1>
        </div>
        <p className="text-gray-600 font-medium">你的情绪气象站 · 记录每一刻的心情</p>

        <NoteGrid
          notes={notes}
          onViewHistory={() => setIsHistoryVisible(true)}
          onDeleteNote={deleteNote}
          onEditNote={handleEditNote}
        />
      </div>
    </MoodBackground>
  );
};

export default MoodTestPage;
