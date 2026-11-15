---
title: "Shipping Label"
description: "Print-ready 4x6 shipping label with sender, recipient, barcode area, and carrier info."
---

::preview{base="forme" name="shipping-label"}

## Installation

::installation{base="forme" name="shipping-label"}

## Usage

::example{base="forme" name="shipping-label"}

### With a carrier barcode image

Provide `barcodeUrl` to render a full-width barcode image instead of the QR code:

```angular-ts
import { Component } from "@angular/core";

import { ShippingLabelDocument } from "@/components/pdf/blocks/shipping-label/shipping-label";
import type { ShippingLabelData } from "@/components/pdf/blocks/shipping-label/shipping-label.types";

@Component({
  imports: [ShippingLabelDocument],
  template: `<pdf-shipping-label [data]="data" />`,
})
export class Label {
  protected readonly data: ShippingLabelData = {
    // ...
    trackingNumber: "1Z999AA10123456784",
    barcodeUrl: "https://example.com/barcodes/1Z999AA10123456784.png",
  };
}
```

## Inputs

| Input   | Type                | Description                                                      |
| ------- | ------------------- | ---------------------------------------------------------------- |
| `data`  | `ShippingLabelData` | Label content: addresses, carrier, tracking, and package details |
| `theme` | `PdfcnTheme`        | Optional theme override                                          |
