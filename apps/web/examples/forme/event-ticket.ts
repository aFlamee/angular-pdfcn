import { Component } from "@angular/core";

import { EventTicketDocument } from "@/registry/bases/forme/blocks/event-ticket/event-ticket";

@Component({
  imports: [EventTicketDocument],
  template: `<pdf-event-ticket />`,
})
export default class EventTicketDemo {}
