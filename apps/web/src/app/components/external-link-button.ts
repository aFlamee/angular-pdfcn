import { Directive } from "@angular/core";

import { UiButton } from "@/src/app/components/ui/button";

/** A button-styled link that opens in a new tab: `<a externalLinkButton [href]="url" sound="heart">`. */
@Directive({
  host: { rel: "noopener noreferrer", target: "_blank" },
  hostDirectives: [
    { directive: UiButton, inputs: ["variant", "size", "class", "sound"] },
  ],
  selector: "a[externalLinkButton]",
})
export class ExternalLinkButton {}
