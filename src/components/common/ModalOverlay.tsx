'use client';

interface ModalOverlayProps {
  children: React.ReactNode;
  /** 点击遮罩时的回调，不传则点击遮罩无效果 */
  // eslint-disable-next-line react/require-default-props
  onClose?: () => void;
}

/** 弹窗遮罩层：居中内容 + 半透明模糊背景 */
const ModalOverlay = ({ children, onClose }: ModalOverlayProps) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm"
    onClick={onClose}
  >
    {children}
  </div>
);

export default ModalOverlay;
