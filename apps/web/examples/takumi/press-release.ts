import { Component } from "@angular/core";

import { PressReleaseDocument } from "@/registry/bases/takumi/blocks/press-release/press-release";

@Component({
  imports: [PressReleaseDocument],
  template: `<pdf-press-release />`,
})
export default class PressReleaseDemo {}
