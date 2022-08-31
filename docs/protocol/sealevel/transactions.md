---
title: Transactions
eleventyNavigation:
  order: 50
  synopsys: |
    Facility for invoking Sealevel programs
---

Transactions
============

:::todo
what are transactions
:::

Serialization
-------------

The canonical transaction serialization follows [bincode v1] fixed-integer encoding.

  [bincode v1]: https://docs.rs/bincode/1.3.3/bincode/

The following structs match transaction serialization when compiled with packed layouts on a little endian machine.

Arrays are serialized inline, prefixed by their length.

```c
typedef uint8_t sol_pubkey_t[32];
typedef uint8_t sol_hash_t[32];
typedef uint8_t sol_signature_t[64];

struct sol_transaction {
  uint8_t         num_signatures;
  sol_signature_t signatures[];

  struct sol_message message;
};

struct sol_message {
  struct sol_message_header header;

  uint8_t      num_account_keys;
  sol_pubkey_t account_keys[];

  sol_hash_t recent_blockhash;

  uint8_t                num_instructions;
  struct sol_instruction instructions[];

  // if(header.versioned)
  uint8_t                   num_address_lookups;
  struct sol_address_lookup address_lookups[];
};

struct sol_message_header {
  bool versioned : 1; // MSB
  uint8_t num_required_signatures : 7;
  uint8_t num_readonly_signed_accounts;
  uint8_t num_readonly_unsigned_accounts;
};
static_assert(sizeof(sol_message_header) == 3);

struct sol_instruction {
  uint8_t program_id_idx;

  uint8_t num_accounts;
  uint8_t account_indices[];

  uint8_t data_len;
  uint8_t data[];
};

struct sol_address_lookup {
  sol_pubkey_t account_key;
  uint8_t num_writable_indexes;
  uint8_t writable_indexes[];
  uint8_t num_readonly_indexes;
  uint8_t readonly_indexes[];
};
```
