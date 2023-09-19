import { JSX } from 'preact';
import './modal.less';
import { CloseButton } from './buttons';

type ModalProps = {
  show?: boolean;
  onClose?: () => void;
  children?: JSX.Element;
  title?: string;
};

export function Modal({ show, onClose, title, children }: ModalProps) {
  if (!show) return null;

  return (
    <div class="modal-wrapper">
      <section class="modal-content">
        <header class="modal-header">
          <CloseButton onClick={onClose} />
          <h2>{title}</h2>
        </header>
        <main class="modal-body">{children}</main>
      </section>
    </div>
  );
}
