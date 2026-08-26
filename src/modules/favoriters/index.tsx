import { CommonModuleUI } from '@/components/module-ui';
import { Extension, ExtensionType } from '@/core/extensions';
import { FavoritersInterceptor } from './api';

export default class FavoritersModule extends Extension {
  name = 'FavoritersModule';

  type = ExtensionType.USER;

  intercept() {
    return FavoritersInterceptor;
  }

  render() {
    return CommonModuleUI;
  }
}
