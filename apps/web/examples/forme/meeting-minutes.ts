import { Component } from "@angular/core";

import { MeetingMinutesDocument } from "@/registry/bases/forme/blocks/meeting-minutes/meeting-minutes";

@Component({
  imports: [MeetingMinutesDocument],
  template: `<pdf-meeting-minutes />`,
})
export default class MeetingMinutesDemo {}
