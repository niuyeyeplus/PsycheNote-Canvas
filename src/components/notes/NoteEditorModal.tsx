'use client';

import ModalOverlay from '@/components/common/ModalOverlay';

interface NoteEditorModalProps {
  title: string;
  value: string;
  submitLabel: string;
  onChange: (value: string) => void;
  onCancel: () => void;
  onSubmit: () => void;
  /** 提交进行中：禁用提交并显示 submittingLabel */
  // eslint-disable-next-line react/require-default-props
  isSubmitting?: boolean;
  // eslint-disable-next-line react/require-default-props
  submittingLabel?: string;
}

/** 便签输入弹窗：新建与编辑便签共用 */
const NoteEditorModal = ({
  title,
  value,
  submitLabel,
  onChange,
  onCancel,
  onSubmit,
  isSubmitting = false,
  submittingLabel,
}: NoteEditorModalProps) => (
  <ModalOverlay>
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
        {title}
      </h3>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
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
          onClick={onCancel}
          className="px-4 py-2 rounded-xl text-gray-500 hover:bg-gray-100 transition-colors font-medium"
        >
          取消
        </button>
        <button
          type="button"
          onClick={onSubmit}
          disabled={!value.trim() || isSubmitting}
          className="px-6 py-2 rounded-xl bg-purple-500 hover:bg-purple-600 text-white font-bold shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (submittingLabel ?? submitLabel) : submitLabel}
        </button>
      </div>
    </div>
  </ModalOverlay>
);

export default NoteEditorModal;
