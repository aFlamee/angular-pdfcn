import { Component } from "@angular/core";

import { GiftCertificateDocument } from "@/registry/bases/takumi/blocks/gift-certificate/gift-certificate";

@Component({
  imports: [GiftCertificateDocument],
  template: `<pdf-gift-certificate />`,
})
export default class GiftCertificateDemo {}
