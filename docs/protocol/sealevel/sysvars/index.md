---
title: Sysvars
eleventyNavigation:
  order: 70
  synopsys: |
    Builtin accounts containing runtime information
---

# Sysvars

:::todo
Extend Eleventy to generate list of sysvars
:::

{% import "listing.njk" as listing %}
{{ listing.childrenTableWithSynopsys(collections.all, page.url) }}
