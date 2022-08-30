---
title: "Instruction Set"
eleventyNavigation:
  order: 20
---

Sealevel Bytecode Format
========================

Sealevel Bytecode Format (SBF) derives from the eBPF little-endian architecture.

## Instruction Frame

Bytecode is encoded using frames of 64 bits.

Instructions occupy either one or two frames, indicated by the opcode of the first frame.

```
+--------+---------+---------+--------+-----------+
| opcode | dst reg | src reg | offset | immediate |
|  0..8  |  8..12  |  12..16 | 16..32 |   32..64  | Bits
+--------+---------+---------+--------+-----------+
low byte                                  high byte
```

Field values are encoded in little-endian byte order and MSB-first bit order.

## Registers

The SBF VM has 12 registers, including 10 general-purpose registers (GPRs).

|  Name | Kind            | Access     | Size    | Solana ABI                         |
|------:|:----------------|:-----------|:--------|:-----------------------------------|
|  `r0` | GPR             | Read/Write | 8 bytes | Return value                       |
|  `r1` | GPR             | Read/Write | 8 bytes | Argument 0                         |
|  `r2` | GPR             | Read/Write | 8 bytes | Argument 1                         |
|  `r3` | GPR             | Read/Write | 8 bytes | Argument 2                         |
|  `r4` | GPR             | Read/Write | 8 bytes | Argument 3                         |
|  `r5` | GPR             | Read/Write | 8 bytes | Argument 4 <br/>or stack spill ptr |
|  `r6` | GPR             | Read/Write | 8 bytes | Call-preserved                     |
|  `r7` | GPR             | Read/Write | 8 bytes | Call-preserved                     |
|  `r8` | GPR             | Read/Write | 8 bytes | Call-preserved                     |
|  `r9` | GPR             | Read/Write | 8 bytes | Call-preserved                     |
| `r10` | Frame pointer   | Read-only  | 8 bytes | System register                    |
| `r11` | Stack pointer   | Special    | 8 bytes | System register                    |
|  `pc` | Program counter | None       | 8 bytes | Hidden register                    |

## Opcode Lists

The following tables list all opcodes and their static constraints.

### Opcode Table

:::opcode_table

|     | ·0  |  ·1  | ·2  |  ·3  |   ·4   |  ·5  | ·6  |   ·7   |  ·8  |  ·9   |  ·A  |  ·B   |   ·C   |  ·D   | ·E  |   ·F   |
|----:|:---:|:----:|:---:|:----:|:------:|:----:|:---:|:------:|:----:|:-----:|:----:|:-----:|:------:|:-----:|:---:|:------:|
|  0· |  -  |  -   |  -  |  -   | add32  |  ja  |  -  | add64  |  -   |   -   |  -   |   -   | add32  |   -   |  -  | add64  |
|  1· |  -  |  -   |  -  |  -   | sub32  | jeq  |  -  | sub64  | lddw |   -   |  -   |   -   | sub32  |  jeq  |  -  | sub64  |
|  2· |  -  |  -   |  -  |  -   | mul32  | jgt  |  -  | mul64  |  -   |   -   |  -   |   -   | mul32  |  jgt  |  -  | mul64  |
|  3· |  -  |  -   |  -  |  -   | div32  | jge  |  -  | div64  |  -   |   -   |  -   |   -   | div32  |  jge  |  -  | div64  |
|  4· |  -  |  -   |  -  |  -   |  or32  | jset |  -  |  or64  |  -   |   -   |  -   |   -   |  or32  | jset  |  -  |  or64  |
|  5· |  -  |  -   |  -  |  -   | and32  | jne  |  -  | and64  |  -   |   -   |  -   |   -   | and32  |  jne  |  -  | and64  |
|  6· |  -  | ldxw | stw | stxw | lsh32  | jsgt |  -  | lsh64  |  -   | ldxh  | sth  | stxh  | lsh32  | jsgt  |  -  | lsh64  |
|  7· |  -  | ldxb | stb | stxb | rsh32  | jsge |  -  | rsh64  |  -   | ldxdw | stdw | stxdw | rsh32  | jsge  |  -  | rsh64  |
|  8· |  -  |  -   |  -  |  -   | neg32  | call |  -  | neg64  |  -   |   -   |  -   |   -   |   -    | callx |  -  |   -    |
|  9· |  -  |  -   |  -  |  -   | mod32  | exit |  -  | mod64  |  -   |   -   |  -   |   -   | mod32  |   -   |  -  | mod64  |
|  A· |  -  |  -   |  -  |  -   | xor32  | jlt  |  -  | xor64  |  -   |   -   |  -   |   -   | xor32  |  jlt  |  -  | xor64  |
|  B· |  -  |  -   |  -  |  -   | mov32  | jle  |  -  | mov64  |  -   |   -   |  -   |   -   | mov32  |  jle  |  -  | mov64  |
|  C· |  -  |  -   |  -  |  -   | arsh32 | jslt |  -  | arsh64 |  -   |   -   |  -   |   -   | arsh32 | jslt  |  -  | arsh64 |
|  D· |  -  |  -   |  -  |  -   |   le   | jsle |  -  |   -    |  -   |   -   |  -   |   -   |   be   | jsle  |  -  |   -    |
|  E· |  -  |  -   |  -  |  -   | sdiv32 |  -   |  -  | sdiv64 |  -   |   -   |  -   |   -   | sdiv32 |   -   |  -  | sdiv64 |
|  F· |  -  |  -   |  -  |  -   |   -    |  -   |  -  |   -    |  -   |   -   |  -   |   -   |   -    |   -   |  -  |   -    |
:::

### Memory access opcodes

:::opcode_listing

| opcode |       | operands                | dst_reg     | src_reg     |
|-------:|------:|:------------------------|:------------|:------------|
| `0x71` |  lxdb | `dst64, [src64+off].b`  | `∈{0..=9}`  | `∈{0..=10}` |
| `0x69` |  ldxh | `dst64, [src64+off].h`  | `∈{0..=9}`  | `∈{0..=10}` |
| `0x61` |  ldxw | `dst64, [src64+off].w`  | `∈{0..=9}`  | `∈{0..=10}` |
| `0x79` | ldxdw | `dst64, [src64+off].dw` | `∈{0..=9}`  | `∈{0..=10}` |
| `0x72` |   stb | `[dst64+off].b, imm8`   | `∈{0..=10}` | `∈{0..=10}` |
| `0x6a` |   sth | `[dst64+off].h, imm16`  | `∈{0..=10}` | `∈{0..=10}` |
| `0x62` |   stw | `[dst64+off].w, imm32`  | `∈{0..=10}` | `∈{0..=10}` |
| `0x7a` |  stdw | `[dst64+off].dw, imm64` | `∈{0..=10}` | `∈{0..=10}` |
| `0x73` |  stxb | `[dst64+off].b, src8`   | `∈{0..=10}` | `∈{0..=10}` |
| `0x6b` |  stxh | `[dst64+off].h, src16`  | `∈{0..=10}` | `∈{0..=10}` |
| `0x63` |  stxw | `[dst64+off].w, src32`  | `∈{0..=10}` | `∈{0..=10}` |
| `0x7b` | stxdw | `[dst64+off].dw, src64` | `∈{0..=10}` | `∈{0..=10}` |
:::

### ALU opcodes

:::opcode_listing

| opcode |        | operands       | dst_reg       | src_reg     | imm           |
|-------:|-------:|:---------------|:--------------|:------------|:--------------|
| `0x04` |  add32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x07` |  add64 | `dst64, imm64` | `∈{0..=9,11}` | `∈{0..=10}` |               |
| `0x0c` |  add32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x0f` |  add64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x14` |  sub32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x17` |  sub64 | `dst64, imm64` | `∈{0..=9,11}` | `∈{0..=10}` |               |
| `0x1c` |  sub32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x1f` |  sub64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x24` |  mul32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x27` |  mul64 | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x2c` |  mul32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x2f` |  mul64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x34` |  div32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` | `!= 0`        |
| `0x37` |  div64 | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` | `!= 0`        |
| `0x3c` |  div32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x3f` |  div64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x44` |   or32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x47` |   or64 | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x4c` |   or32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x4f` |   or64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x54` |  and32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x57` |  and64 | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x5c` |  and32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x5f` |  and64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x64` |  lsh32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` | `∈{0..=31}`   |
| `0x67` |  lsh64 | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` | `∈{0..=63}`   |
| `0x6c` |  lsh32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x6f` |  lsh64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x74` |  rsh32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` | `∈{0..=31}`   |
| `0x77` |  rsh64 | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` | `∈{0..=63}`   |
| `0x7c` |  rsh32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x7f` |  rsh64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x84` |  neg32 | `dst32`        | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x87` |  neg64 | `dst64`        | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x94` |  mod32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` | `!= 0`        |
| `0x97` |  mod64 | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` | `!= 0`        |
| `0x9c` |  mod32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x9f` |  mod64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xa4` |  xor32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xa7` |  xor64 | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xac` |  xor32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xaf` |  xor64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xb4` |  mov32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xb7` |  mov64 | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xbc` |  mov32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xbf` |  mov64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x18` |   lddw | `dst64, immdw` | `∈{0..=9}`    | `∈{0..=10}` |
| `0xc4` | arsh32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` | `∈{0..=31}`   |
| `0xc7` | arsh64 | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` | `∈{0..=63}`   |
| `0xcc` | arsh32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xcf` | arsh64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xd4` |     le | `imm`          | `∈{0..=9}`    | `∈{0..=10}` | `∈{16,32,64}` |
| `0xdc` |     be | `imm`          | `∈{0..=9}`    | `∈{0..=10}` | `∈{16,32,64}` |
| `0xe4` | sdiv32 | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` | `!= 0`        |
| `0xe7` | sdiv64 | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` | `!= 0`        |
| `0xec` | sdiv32 | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xef` | sdiv64 | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
:::

### Control flow opcodes

:::opcode_listing

| opcode |      | operands            | dst_reg    | src_reg     |
|-------:|-----:|:--------------------|:-----------|:------------|
| `0x05` |   ja | `off`               | `∈{0..=9}` | `∈{0..=10}` |
| `0x15` |  jeq | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x1d` |  jeq | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x25` |  jgt | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x2d` |  jgt | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x35` |  jge | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x3d` |  jge | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x45` | jset | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x4d` | jset | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x55` |  jne | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x5d` |  jne | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x65` | jsgt | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x6d` | jsgt | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x75` | jsge | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x7d` | jsge | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xa5` |  jlt | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xad` |  jlt | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xb5` |  jle | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xbd` |  jle | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xc5` | jslt | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xcd` | jslt | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xd5` | jsle | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xdd` | jsle | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
:::

### Call opcodes

:::opcode_listing

| opcode |       | operands | dst_reg    | src_reg     | imm        |
|-------:|------:|:---------|:-----------|:------------|:-----------|
| `0x85` |  call | `imm64`  | `∈{0..=9}` | `∈{0..=10}` |
| `0x8d` | callx | `reg64`  | `∈{0..=9}` | `∈{0..=10}` | `∈{0..=9}` |
| `0x95` |  exit |          | `∈{0..=9}` | `∈{0..=10}` |
:::

### Notation

**Instruction Fields**

```
opcode    := *(uint8_t  *)(frame +  0)
regs      := *(uint8_t  *)(frame +  1)
dst_reg   := regs >> 4
src_reg   := regs & 0x0F
off       := *( int16_t *)(frame +  2)
imm       := *(uint32_t *)(frame +  4)
imm_next  := *(uint32_t *)(frame + 12) # next frame
```

**Immediates**

```
imm8      := (int8_t) (imm & 0x00FF)
imm16     := (int16_t)(imm & 0xFFFF)
imm32     := (int32_t)(imm)
imm64     := (int64_t)(sign_extend_64_32(imm))
immdw     := (int64_t)(imm | (imm_next << 32))
```

**Register values**

```
dst64     := regs[dst_reg]
src64     := regs[src_reg]
dst32     := lower(regs[dst_reg], 32)
src32     := lower(regs[src_reg], 32)
dst16     := lower(regs[dst_reg], 16)
src16     := lower(regs[src_reg], 16)
dst8      := lower(regs[dst_reg],  8)
src8      := lower(regs[src_reg],  8)
```

**Memory accessors**

```
[addr].b  := *(uint8_t) (addr)
[addr].h  := *(uint16_t)(addr)
[addr].w  := *(uint32_t)(addr)
[addr].dw := *(uint64_t)(addr)
```

**Pseudo-functions**

`lower(x, n)`
    returns a view of the lower `n` bits of a location `x`. <br/>
    writing to the view implicitly zeros the `64-n` upper bits.

      x := int64(0xFFFF_0000)
      assert(lower(x, 24) == 0x00FF_0000)
      lower(x, 16) <- 0x42
      assert(x == 0x0000_0042)

`sign_extend_64_32(x)`
    extends a two's complement signed 32-bit integer to 64-bit

      assert(sign_extend_64_32(0x0000_0003) == 0x0000_0000_0000_0003)
      assert(sign_extend_64_32(0xfeee_eee3) == 0xffff_ffff_feee_eee3)

## Static Verifier

The static verifier checks whether a blob of bytecode is well formed.
It iterates over all instruction frames in a single pass.

:::todo
Detail changes between bpfel, SBF, and SBFv2
:::

## Function calls

:::todo
call and callx effects on r10 and shadow stack
:::
