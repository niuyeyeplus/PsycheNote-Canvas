'use client';

import { useState, useCallback, useRef } from 'react';

import CatCompanion from '@/components/CatCompanion';
import FloatingDecorations from '@/components/FloatingDecorations';
import LLMReplyBubble from '@/components/LLMReplyBubble';
import MoodBackground from '@/components/MoodBackground';
import HistoryModal from '@/components/notes/HistoryModal';
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="bg-white/95 rounded-3xl px-6 py-5 shadow-2xl border-2 border-white/50"
            style={{
              minWidth: '360px',
              maxWidth: '480px',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,240,252,0.95) 100%)',
            }}
          >
            <h3
              className="text-lg font-bold text-purple-600 mb-4 text-center"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              记录此刻的心情
            </h3>
            <textarea
              value={noteInput}
              onChange={e => setNoteInput(e.target.value)}
              placeholder="写下你的心情..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-gray-700 resize-none"
              style={{
                fontFamily: "'Nunito', sans-serif",
                minHeight: '120px',
              }}
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button
                type="button"
                onClick={() => setIsInputVisible(false)}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSendNote}
                disabled={!noteInput.trim() || isStreaming}
                className="px-6 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isStreaming ? '发送中...' : '发送'}
              </button>
            </div>
          </div>
        </div>
      )}

      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div
            className="bg-white/95 rounded-3xl px-6 py-5 shadow-2xl border-2 border-white/50"
            style={{
              minWidth: '360px',
              maxWidth: '480px',
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(248,240,252,0.95) 100%)',
            }}
          >
            <h3
              className="text-lg font-bold text-purple-600 mb-4 text-center"
              style={{ fontFamily: "'Nunito', sans-serif" }}
            >
              编辑便签
            </h3>
            <textarea
              value={editInput}
              onChange={e => setEditInput(e.target.value)}
              placeholder="写下你的心情..."
              className="w-full px-4 py-3 rounded-2xl border-2 border-purple-200 focus:border-purple-400 focus:outline-none text-gray-700 resize-none"
              style={{
                fontFamily: "'Nunito', sans-serif",
                minHeight: '120px',
              }}
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button
                type="button"
                onClick={() => setEditingNote(null)}
                className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors font-medium"
              >
                取消
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={!editInput.trim()}
                className="px-6 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                保存
              </button>
            </div>
          </div>
        </div>
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
