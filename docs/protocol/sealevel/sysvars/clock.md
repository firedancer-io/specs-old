---
title: Clock Sysvar
navTitle: Clock
eleventyNavigation:
  order: 10
---

Synposis
--------

The clock sysvar contains various time-related numbers.

- **Address**: `SysvarC1ock11111111111111111111111111111111`
- **Size**: 40 bytes
- **Access**: read-only

Content
-------

```c
struct sol_sysvar_clock {
  uint64_t slot;                   ///< current network slot
  int64_t  epoch_start_timestamp;  ///< wall clock of first slot epoch
  uint64_t epoch;                  ///< current network epoch
  uint64_t leader_schedule_epoch;  ///< latest epoch for which leader schedule is known in current bank
  int64_t  unix_timestamp;         ///< wall clock oracle
}
```

:::todo
- Is it allowed to transfer SOL to clock?
- Document wall clock oracle
:::
