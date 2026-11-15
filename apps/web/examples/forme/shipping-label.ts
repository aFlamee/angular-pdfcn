import { Component } from "@angular/core";

import { ShippingLabelDocument } from "@/registry/bases/forme/blocks/shipping-label/shipping-label";

@Component({
  imports: [ShippingLabelDocument],
  template: `<pdf-shipping-label />`,
})
export default class ShippingLabelDemo {}
