---
title: Builtin Programs
eleventyNavigation:
  order: 60
  synopsys: |
    Programs providing essential functionality
---

# Builtin Programs

:::todo
Extend Eleventy to generate list of programs
:::

{% import "listing.njk" as listing %}
{{ listing.childrenTableWithSynopsys(collections.all, page.url) }}
