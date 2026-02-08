import { create } from 'zustand';

type ModalType = 'prompt' | 'confirm' | 'alert';

interface ModalOptions {
  title: string;
  message: string;
  placeholder?: string;
  defaultValue?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  type: ModalType;
  onConfirm: (value?: string) => void;
  onCancel?: () => void;
}

interface ModalState {
  isOpen: boolean;
  options: ModalOptions | null;
  openModal: (options: ModalOptions) => void;
  closeModal: () => void;
}

export const useModalStore = create<ModalState>((set) => ({
  isOpen: false,
  options: null,
  openModal: (options) => set({ isOpen: true, options }),
  closeModal: () => set({ isOpen: false, options: null }),
}));

// Helper hooks for easier usage
export const useModal = () => {
  const { openModal, closeModal } = useModalStore();

  const prompt = (title: string, message: string, defaultValue = '', placeholder = '') => {
    return new Promise<string | null>((resolve) => {
      openModal({
        type: 'prompt',
        title,
        message,
        defaultValue,
        placeholder,
        onConfirm: (value) => {
          resolve(value || '');
          closeModal();
        },
        onCancel: () => {
          resolve(null);
          closeModal();
        },
      });
    });
  };

  const confirm = (title: string, message: string) => {
    return new Promise<boolean>((resolve) => {
      openModal({
        type: 'confirm',
        title,
        message,
        onConfirm: () => {
          resolve(true);
          closeModal();
        },
        onCancel: () => {
          resolve(false);
          closeModal();
        },
      });
    });
  };

  const alert = (title: string, message: string) => {
    return new Promise<void>((resolve) => {
      openModal({
        type: 'alert',
        title,
        message,
        onConfirm: () => {
          resolve();
          closeModal();
        },
      });
    });
  };

  return { prompt, confirm, alert };
};
