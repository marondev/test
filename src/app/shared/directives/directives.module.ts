import { NgModule } from '@angular/core';
import { ImagePreviewDirective } from './image-preview/image-preview.directive';

@NgModule({
  declarations: [ImagePreviewDirective],
  exports: [ImagePreviewDirective]
})
export class DirectivesModule { }
