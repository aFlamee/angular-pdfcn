import { Component } from "@angular/core";

import { EventAgendaDocument } from "@/registry/bases/takumi/blocks/event-agenda/event-agenda";

@Component({
  imports: [EventAgendaDocument],
  template: `<pdf-event-agenda />`,
})
export default class EventAgendaDemo {}
