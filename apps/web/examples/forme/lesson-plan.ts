import { Component } from "@angular/core";

import { LessonPlanDocument } from "@/registry/bases/forme/blocks/lesson-plan/lesson-plan";

@Component({
  imports: [LessonPlanDocument],
  template: `<pdf-lesson-plan />`,
})
export default class LessonPlanDemo {}
