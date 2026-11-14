import { Component } from "@angular/core";

import { PackingSlipDocument } from "@/registry/bases/forme/blocks/packing-slip/packing-slip";

@Component({
  imports: [PackingSlipDocument],
  template: `<pdf-packing-slip />`,
})
export default class PackingSlipDemo {}
