import { Component } from "@angular/core";

import { MedicalIntakeFormDocument } from "@/registry/bases/takumi/blocks/medical-intake-form/medical-intake-form";

@Component({
  imports: [MedicalIntakeFormDocument],
  template: `
    <pdf-medical-intake-form
      accentColor="#0d9488"
      clinicAddress="200 Health Plaza, Denver, CO 80202"
      clinicName="Sunrise Family Medicine"
      clinicPhone="(303) 555-0180"
    />
  `,
})
export default class MedicalIntakeFormDemo {}
