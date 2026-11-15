import {
  ChangeDetectionStrategy,
  Component,
  afterNextRender,
  signal,
} from "@angular/core";

import { getStargazerCount } from "@/lib/github";
import { GitHubStars } from "@/src/app/components/github-stars";

/** The GitHub link with the star count, which the browser fetches after the first render. */
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "contents" },
  imports: [GitHubStars],
  selector: "app-nav-item-github",
  template: `<app-github-stars [stargazersCount]="stargazersCount()" />`,
})
export class NavItemGithub {
  protected readonly stargazersCount = signal(0);

  constructor() {
    afterNextRender(async () =>
      this.stargazersCount.set(await getStargazerCount())
    );
  }
}
