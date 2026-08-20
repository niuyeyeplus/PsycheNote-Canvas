'use client';

interface CloseButtonProps {
  onClick: () => void;
  /** 追加的尺寸/定位类名 */
  className: string;
}

/** 圆形关闭按钮（弹窗、气泡共用） */
const CloseButton = ({ onClick, className }: CloseButtonProps) => (
  <button
    type="button"
    onClick={onClick}
    className={`bg-purple-100 hover:bg-purple-200 rounded-full flex items-center justify-center text-purple-400 hover:text-purple-600 transition-colors ${className}`}
  >
    ✕
  </button>
);

export default CloseButton;
