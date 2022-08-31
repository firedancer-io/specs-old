---
title: "Syscalls"
eleventyNavigation:
  order: 30
---

Syscalls
========

Syscalls are VM hardcoded subroutines extending the functionality of the virtual machine.
They generally belong to one of two categories:

- *Runtime syscalls* provide access to external facilities (e.g. logging)
- *Convenience syscalls* provide efficient replacements for functionality that could be implemented without syscalls (e.g. SHA-256 hashing)

A syscall is invoked using a [`call` instruction](./isa.md#call) with `dst=0`, `src=0`, `off=0`, and `imm` set to the hash in reverse byte order.

Equivalent bytecode: `concat([0x85, 0x00, 0x00, 0x00], bswap32(hash))`

The `r0` register is always clobbered upon return, in addition to the memory- and CU side effects.

Index
-----

|       Hash | Symbol                                  |
|-----------:|:----------------------------------------|
| `b6fc1a11` | `abort`                                 |
| `686093bb` | `sol_panic_`                            |
| `207559bd` | `sol_log_`                              |
| `5c2a3178` | `sol_log_64_`                           |
| `52ba5096` | `sol_log_compute_units_`                |
| `7ef088ca` | `sol_log_pubkey`                        |
| `9377323c` | `sol_create_program_address`            |
| `48504a38` | `sol_try_find_program_address`          |
| `11f49d86` | `sol_sha256`                            |
| `d7793abb` | `sol_keccak256`                         |
| `17e40350` | `sol_secp256k1_recover`                 |
| `174c5122` | `sol_blake3`                            |
| `aa2607ca` | `sol_curve_validate_point`              |
| `dd1c41a6` | `sol_curve_group_op`                    |
| `d56b5fe9` | `sol_get_clock_sysvar`                  |
| `23a29a61` | `sol_get_epoch_schedule_sysvar`         |
| `3b97b73c` | `sol_get_fees_sysvar`                   |
| `bf7188f6` | `sol_get_rent_sysvar`                   |
| `717cc4a3` | `sol_memcpy_`                           |
| `434371f8` | `sol_memmove_`                          |
| `5fdcde31` | `sol_memcmp_`                           |
| `3770fb22` | `sol_memset_`                           |
| `a22b9c85` | `sol_invoke_signed_c`                   |
| `d7449092` | `sol_invoke_signed_rust`                |
| `83f00e8f` | `sol_alloc_free_`                       |
| `a226d3eb` | `sol_set_return_data`                   |
| `5d2245e4` | `sol_get_return_data`                   |
| `7317b434` | `sol_log_data`                          |
| `adb8efc8` | `sol_get_processed_sibling_instruction` |
| `85532d94` | `sol_get_stack_height`                  |

Reference
---------

:::todo
document each syscall
:::
