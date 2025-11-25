import { useCallback, useMemo, useRef, useState } from 'react';
import AppModal, {
  AppModalButton,
  AppModalProps,
  AppModalStatus,
} from '../components/common/AppModal';

export interface ShowModalOptions
  extends Omit<AppModalProps, 'visible' | 'buttons'> {
  buttons?: AppModalButton[];
  autoCloseAfter?: number;
  onAutoClose?: () => void;
}

export const useAppModal = () => {
  const [config, setConfig] = useState<Omit<AppModalProps, 'visible'>>({
    title: undefined,
    message: undefined,
    status: 'info',
    buttons: undefined,
    onClose: undefined,
  });
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const hideModal = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setVisible(false);
  }, []);

  const showModal = useCallback(
    ({
      autoCloseAfter,
      onAutoClose,
      buttons,
      status,
      title,
      message,
    }: ShowModalOptions) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }

      const normalizedButtons =
        buttons && buttons.length > 0
          ? buttons
          : [
              {
                text: 'Đóng',
                variant: 'primary',
              },
            ];

      const wrappedButtons = normalizedButtons.map((btn) => ({
        ...btn,
        onPress: () => {
          const result = btn.onPress?.();
          const finalize = () => hideModal();
          if (result && typeof (result as Promise<void>).then === 'function') {
            (result as Promise<void>).finally(finalize);
          } else {
            finalize();
          }
        },
      }));

      setConfig({
        title,
        message,
        status: status as AppModalStatus | undefined,
        buttons: wrappedButtons,
        onClose: hideModal,
      });
      setVisible(true);

      if (autoCloseAfter) {
        timerRef.current = setTimeout(() => {
          hideModal();
          onAutoClose?.();
        }, autoCloseAfter);
      }
    },
    [hideModal]
  );

  const modal = useMemo(
    () => <AppModal visible={visible} {...config} onClose={hideModal} />,
    [config, hideModal, visible]
  );

  return { showModal, hideModal, modal };
};










