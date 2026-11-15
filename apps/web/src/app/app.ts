import { Component } from "@angular/core";
import { RouterOutlet } from "@angular/router";

import { JsonLd } from "@/src/app/components/json-ld";

@Component({
  imports: [JsonLd, RouterOutlet],
  selector: "app-root",
  template: `<app-json-ld /><router-outlet />`,
})
export class App {}
