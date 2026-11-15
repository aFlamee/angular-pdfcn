import { Component } from "@angular/core";

import { MeetingMinutesDocument } from "@/registry/bases/takumi/blocks/meeting-minutes/meeting-minutes";

@Component({
  imports: [MeetingMinutesDocument],
  template: `<pdf-meeting-minutes />`,
})
export default class MeetingMinutesDemo {}
