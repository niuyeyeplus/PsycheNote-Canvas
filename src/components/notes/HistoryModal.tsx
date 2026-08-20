'use client';

import { useState, useMemo } from 'react';

import CloseButton from '@/components/common/CloseButton';
import ModalOverlay from '@/components/common/ModalOverlay';
import type { Note } from '@/types/note';
import {
  getWeekStart,
  formatWeekLabel,
  getWeekReport,
  compareWeeks,
  type WeekGroup,
} from '@/utils/moodReportUtils';

import MoodReportView from './MoodReportView';
import NoteCard from './NoteCard';

interface HistoryModalProps {
  notes: Note[];
  onClose: () => void;
  // eslint-disable-next-line react/require-default-props
  onDeleteNote?: (id: string) => void;
  // eslint-disable-next-line react/require-default-props
  onEditNote?: (note: Note) => void;
}

const HistoryModal = ({ notes, onClose, onDeleteNote, onEditNote }: HistoryModalProps) => {
  const [activeTab, setActiveTab] = useState<'history' | 'report'>('history');

  const weekGroups = useMemo<WeekGroup[]>(() => {
    const groups: Map<string, WeekGroup> = new Map();

    notes.forEach(note => {
      const date = new Date(note.createdAt);
      const weekStart = getWeekStart(date);
      const key = weekStart.toISOString().slice(0, 10);

      if (!groups.has(key)) {
        groups.set(key, {
          label: formatWeekLabel(weekStart),
          notes: [],
          weekStart,
        });
      }
      groups.get(key)!.notes.push(note);
    });

    return Array.from(groups.values()).sort(
      (a, b) => b.weekStart.getTime() - a.weekStart.getTime()
    );
  }, [notes]);

  const weekReportComparison = useMemo(() => {
    if (weekGroups.length === 0) return null;

    const currentReport = getWeekReport(weekGroups[0]);

    const previousGroup = weekGroups.length > 1 ? weekGroups[1] : null;
    const previousReport = previousGroup ? getWeekReport(previousGroup) : null;

    return compareWeeks(currentReport, previousReport);
  }, [weekGroups]);

  const currentGroup = weekGroups[0];

  return (
    <ModalOverlay onClose={onClose}>
      <div
        className="bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{
          width: '90%',
          maxWidth: '800px',
          maxHeight: '80vh',
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-purple-600">历史便签</h2>
          <CloseButton onClick={onClose} className="w-8 h-8" />
        </div>

        {/* Tab 切换 */}
        <div className="flex border-b border-gray-100">
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'history'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            历史便签
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('report')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'report'
                ? 'text-purple-600 border-b-2 border-purple-600'
                : 'text-gray-400 hover:text-gray-600'
            }`}
          >
            本周报告
          </button>
        </div>

        {/* 内容区域 */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(80vh - 140px)' }}>
          {activeTab === 'history' ? (
            <div className="p-6">
              {currentGroup ? (
                <div>
                  <p className="text-sm text-gray-400 mb-3">{currentGroup.label}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {currentGroup.notes.map(note => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onDelete={onDeleteNote}
                        onEdit={onEditNote}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400">暂无历史便签</div>
              )}
            </div>
          ) : (
            <div className="p-6">
              <MoodReportView comparison={weekReportComparison} />
            </div>
          )}
        </div>
      </div>
    </ModalOverlay>
  );
};

export default HistoryModal;
