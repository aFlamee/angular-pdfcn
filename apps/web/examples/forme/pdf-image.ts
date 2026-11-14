import { Component } from "@angular/core";

import { PREVIEW_IMAGE_DATA_URI } from "@/examples/preview-assets";
import { PdfImage } from "@/registry/bases/forme/components/pdf-image/pdf-image";
import {
  FormeDocument,
  FormePage,
} from "@/registry/bases/forme/lib/pdf-primitives";

@Component({
  imports: [FormeDocument, FormePage, PdfImage],
  template: `
    <forme-document>
      <forme-page size="A4" [margin]="40">
        <pdf-image
          [src]="src"
          variant="default"
          [height]="120"
          [width]="200"
          caption="Variant: default"
        />
      </forme-page>
    </forme-document>
  `,
})
export default class PdfImageDemo {
  protected readonly src = PREVIEW_IMAGE_DATA_URI;
}
