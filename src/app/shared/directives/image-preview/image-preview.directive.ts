import { Directive, ElementRef, Input, OnChanges } from '@angular/core';

@Directive({ selector: 'img[appImgPreview]' })
export class ImagePreviewDirective implements OnChanges {
  @Input() image: any;

  constructor(private el: ElementRef) {}

  ngOnChanges() {
    if (!this.image) {return;}
    const reader = new FileReader();
    const el = this.el;
    reader.onloadend = (e: any) => {
      el.nativeElement.src = reader.result;
    };

    return reader.readAsDataURL(this.image);
  }
}
