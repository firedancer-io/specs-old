---
title: Epoch Schedule Sysvar
navTitle: Epoch Schedule
eleventyNavigation:
  order: 20
---

Epoch Schedule Sysvar
=====================

Synposis
--------

Contains epoch configuration parameters (network constants).

- **Address**: `SysvarEpochSchedu1e111111111111111111111111`
- **Size**: 33 (0x21) bytes
- **Access**: read-only

The number of slots on Solana mainnet is unlikely to change.
Programs that rely on epoch progression _should_ read params from epoch schedule sysvar 
regardless to preserve portability across chains,
and to maintain correctness in the eventuality of a epoch duration change.

Content
------

```c
struct sol_sysvar_epoch_schedule {
  /* 0x00 */ uint64_t slots_per_epoch;

  ///< slot in epoch at which leader schedule is calculated
  /* 0x08 */ uint64_t leader_schedule_slot_offset;

  /* 0x10 */ bool warmup;
  /* 0x11 */ uint64_t first_normal_epoch;
  /* 0x19 */ uint64_t first_normal_slot;
}
```

Parameters on mainnet:
- `slots_per_epoch`: 432000
- `leader_schedule_slot_offset`: 432000
- `warmup`: false
- `first_normal_epoch`: 0
- `first_normal_slot`: 0
