import { Component } from "@angular/core";

import { PREVIEW_IMAGE_DATA_URI } from "@/examples/preview-assets";
import { PdfImage } from "@/registry/bases/takumi/components/pdf-image/pdf-image";
import { PdfcnThemeProvider } from "@/registry/bases/takumi/components/theme-provider";
import {
  TakumiDocument,
  TakumiPage,
} from "@/registry/bases/takumi/lib/pdf-primitives";

@Component({
  imports: [TakumiDocument, TakumiPage, PdfcnThemeProvider, PdfImage],
  template: `
    <takumi-document>
      <takumi-page size="A4">
        <pdf-theme-provider>
          <pdf-image
            [src]="src"
            variant="default"
            [height]="120"
            [width]="200"
            caption="Variant: default"
          />
        </pdf-theme-provider>
      </takumi-page>
    </takumi-document>
  `,
})
export default class PdfImageDemo {
  protected readonly src = PREVIEW_IMAGE_DATA_URI;
}
