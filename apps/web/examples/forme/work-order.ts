import { Component } from "@angular/core";

import { WorkOrderDocument } from "@/registry/bases/forme/blocks/work-order/work-order";

@Component({
  imports: [WorkOrderDocument],
  template: `<pdf-work-order />`,
})
export default class WorkOrderDemo {}
