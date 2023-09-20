import { JSX } from 'preact';
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
    <div class="fixed w-screen h-screen flex items-center justify-center left-0 top-0 bg-black bg-opacity-40">
      <section class="relative w-[800px] h-[600px] bg-[#f7f9f9] p-4 rounded-2xl">
        <header class="flex items-center h-9">
          <CloseButton class="mr-2" onClick={onClose} />
          <h2 class="leading-none text-xl m-0">{title}</h2>
        </header>
        <main>{children}</main>
      </section>
    </div>
  );
}
