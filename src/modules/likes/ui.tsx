import { likesSignal } from './api';
import { AbstractModuleUI } from '@/components/module-ui';
import { Tweet } from '@/types';

const ModuleUI = AbstractModuleUI<Tweet>;

export function LikesPanel() {
  return <ModuleUI title="Likes" recordsSignal={likesSignal} />;
}
