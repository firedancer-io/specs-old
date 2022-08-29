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
|     | ·0  |      ·1       |     ·2      |      ·3       |        ·4         |      ·5       | ·6  |        ·7         |      ·8       |       ·9        |      ·A       |       ·B        |        ·C         |       ·D        | ·E  |        ·F         |
|----:|:---:|:-------------:|:-----------:|:-------------:|:-----------------:|:-------------:|:---:|:-----------------:|:-------------:|:---------------:|:-------------:|:---------------:|:-----------------:|:---------------:|:---:|:-----------------:|
|  0· |  -  |       -       |      -      |       -       |  [add32](#add32)  |   [ja](#ja)   |  -  |  [add64](#add64)  |       -       |        -        |       -       |        -        |  [add32](#add32)  |        -        |  -  |  [add64](#add64)  |
|  1· |  -  |       -       |      -      |       -       |  [sub32](#sub32)  |  [jeq](#jeq)  |  -  |  [sub64](#sub64)  | [lddw](#lddw) |        -        |       -       |        -        |  [sub32](#sub32)  |   [jeq](#jeq)   |  -  |  [sub64](#sub64)  |
|  2· |  -  |       -       |      -      |       -       |  [mul32](#mul32)  |  [jgt](#jgt)  |  -  |  [mul64](#mul64)  |       -       |        -        |       -       |        -        |  [mul32](#mul32)  |   [jgt](#jgt)   |  -  |  [mul64](#mul64)  |
|  3· |  -  |       -       |      -      |       -       |  [div32](#div32)  |  [jge](#jge)  |  -  |  [div64](#div64)  |       -       |        -        |       -       |        -        |  [div32](#div32)  |   [jge](#jge)   |  -  |  [div64](#div64)  |
|  4· |  -  |       -       |      -      |       -       |   [or32](#or32)   | [jset](#jset) |  -  |   [or64](#or64)   |       -       |        -        |       -       |        -        |   [or32](#or32)   |  [jset](#jset)  |  -  |   [or64](#or64)   |
|  5· |  -  |       -       |      -      |       -       |  [and32](#and32)  |  [jne](#jne)  |  -  |  [and64](#and64)  |       -       |        -        |       -       |        -        |  [and32](#and32)  |   [jne](#jne)   |  -  |  [and64](#and64)  |
|  6· |  -  | [ldxw](#ldxw) | [stw](#stw) | [stxw](#stxw) |  [lsh32](#lsh32)  | [jsgt](#jsgt) |  -  |  [lsh64](#lsh64)  |       -       |  [ldxh](#ldxh)  |  [sth](#sth)  |  [stxh](#stxh)  |  [lsh32](#lsh32)  |  [jsgt](#jsgt)  |  -  |  [lsh64](#lsh64)  |
|  7· |  -  | [ldxb](#lxdb) | [stb](#stb) | [stxb](#stxb) |  [rsh32](#rsh32)  | [jsge](#jsge) |  -  |  [rsh64](#rsh64)  |       -       | [ldxdw](#ldxdw) | [stdw](#stdw) | [stxdw](#stxdw) |  [rsh32](#rsh32)  |  [jsge](#jsge)  |  -  |  [rsh64](#rsh64)  |
|  8· |  -  |       -       |      -      |       -       |  [neg32](#neg32)  | [call](#call) |  -  |  [neg64](#neg64)  |       -       |        -        |       -       |        -        |         -         | [callx](#callx) |  -  |         -         |
|  9· |  -  |       -       |      -      |       -       |  [mod32](#mod32)  | [exit](#exit) |  -  |  [mod64](#mod64)  |       -       |        -        |       -       |        -        |  [mod32](#mod32)  |        -        |  -  |  [mod64](#mod64)  |
|  A· |  -  |       -       |      -      |       -       |  [xor32](#xor32)  |  [jlt](#jlt)  |  -  |  [xor64](#xor64)  |       -       |        -        |       -       |        -        |  [xor32](#xor32)  |   [jlt](#jlt)   |  -  |  [xor64](#xor64)  |
|  B· |  -  |       -       |      -      |       -       |  [mov32](#mov32)  |  [jle](#jle)  |  -  |  [mov64](#mov64)  |       -       |        -        |       -       |        -        |  [mov32](#mov32)  |   [jle](#jle)   |  -  |  [mov64](#mov64)  |
|  C· |  -  |       -       |      -      |       -       | [arsh32](#arsh32) | [jslt](#jslt) |  -  | [arsh64](#arsh64) |       -       |        -        |       -       |        -        | [arsh32](#arsh32) |  [jslt](#jslt)  |  -  | [arsh64](#arsh64) |
|  D· |  -  |       -       |      -      |       -       |     [le](#le)     | [jsle](#jsle) |  -  |         -         |       -       |        -        |       -       |        -        |     [be](#be)     |  [jsle](#jsle)  |  -  |         -         |
|  E· |  -  |       -       |      -      |       -       | [sdiv32](#sdiv32) |       -       |  -  | [sdiv64](#sdiv64) |       -       |        -        |       -       |        -        | [sdiv32](#sdiv32) |        -        |  -  | [sdiv64](#sdiv64) |
|  F· |  -  |       -       |      -      |       -       |         -         |       -       |  -  |         -         |       -       |        -        |       -       |        -        |         -         |        -        |  -  |         -         |
:::

### Memory access opcodes

:::opcode_listing
| opcode |                      | operands                | dst_reg       | src_reg     |
|-------:|---------------------:|:------------------------|:--------------|:------------|
| `0x71` | <a op name="lxdb"> | `dst64, [src64+off].b`  | `∈{0..=9}` | `∈{0..=10}` |
| `0x69` |   <a op name="ldxh"> | `dst64, [src64+off].h`  | `∈{0..=9}`    | `∈{0..=10}` |
| `0x61` |   <a op name="ldxw"> | `dst64, [src64+off].w`  | `∈{0..=9}`    | `∈{0..=10}` |
| `0x79` |  <a op name="ldxdw"> | `dst64, [src64+off].dw` | `∈{0..=9}`    | `∈{0..=10}` |
| `0x72` |    <a op name="stb"> | `[dst64+off].b, imm8`  | `∈{0..=10}`   | `∈{0..=10}` |
| `0x6a` |    <a op name="sth"> | `[dst64+off].h, imm16` | `∈{0..=10}`   | `∈{0..=10}` |
| `0x62` |    <a op name="stw"> | `[dst64+off].w, imm32` | `∈{0..=10}`   | `∈{0..=10}` |
| `0x7a` |   <a op name="stdw"> | `[dst64+off].dw, imm64` | `∈{0..=10}`   | `∈{0..=10}` |
| `0x73` |   <a op name="stxb"> | `[dst64+off].b, src8`  | `∈{0..=10}`   | `∈{0..=10}` |
| `0x6b` |   <a op name="stxh"> | `[dst64+off].h, src16` | `∈{0..=10}`   | `∈{0..=10}` |
| `0x63` |   <a op name="stxw"> | `[dst64+off].w, src32` | `∈{0..=10}`   | `∈{0..=10}` |
| `0x7b` |  <a op name="stxdw"> | `[dst64+off].dw, src64` | `∈{0..=10}`   | `∈{0..=10}` |
:::

### ALU opcodes

:::opcode_listing

| opcode |                      | operands       | dst_reg       | src_reg     | imm           |
|-------:|---------------------:|:---------------|:--------------|:------------|:--------------|
| `0x04` |  <a op name="add32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x07` |  <a op name="add64"> | `dst64, imm64` | `∈{0..=9,11}` | `∈{0..=10}` |               |
| `0x0c` |  <a op name="add32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x0f` |  <a op name="add64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x14` |  <a op name="sub32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x17` |  <a op name="sub64"> | `dst64, imm64` | `∈{0..=9,11}` | `∈{0..=10}` |               |
| `0x1c` |  <a op name="sub32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x1f` |  <a op name="sub64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x24` |  <a op name="mul32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x27` |  <a op name="mul64"> | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x2c` |  <a op name="mul32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x2f` |  <a op name="mul64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x34` |  <a op name="div32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` | `!= 0`        |
| `0x37` |  <a op name="div64"> | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` | `!= 0`        |
| `0x3c` |  <a op name="div32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x3f` |  <a op name="div64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x44` |   <a op name="or32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x47` |   <a op name="or64"> | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x4c` |   <a op name="or32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x4f` |   <a op name="or64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x54` |  <a op name="and32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x57` |  <a op name="and64"> | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x5c` |  <a op name="and32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x5f` |  <a op name="and64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x64` |  <a op name="lsh32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` | `∈{0..=31}`   |
| `0x67` |  <a op name="lsh64"> | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` | `∈{0..=63}`   |
| `0x6c` |  <a op name="lsh32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x6f` |  <a op name="lsh64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x74` |  <a op name="rsh32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` | `∈{0..=31}`   |
| `0x77` |  <a op name="rsh64"> | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` | `∈{0..=63}`   |
| `0x7c` |  <a op name="rsh32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x7f` |  <a op name="rsh64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x84` |  <a op name="neg32"> | `dst32`        | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x87` |  <a op name="neg64"> | `dst64`        | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x94` |  <a op name="mod32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` | `!= 0`        |
| `0x97` |  <a op name="mod64"> | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` | `!= 0`        |
| `0x9c` |  <a op name="mod32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x9f` |  <a op name="mod64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xa4` |  <a op name="xor32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xa7` |  <a op name="xor64"> | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xac` |  <a op name="xor32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xaf` |  <a op name="xor64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xb4` |  <a op name="mov32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xb7` |  <a op name="mov64"> | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xbc` |  <a op name="mov32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xbf` |  <a op name="mov64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0x18` |   <a op name="lddw"> | `dst64, immdw` | `∈{0..=9}`    | `∈{0..=10}` |
| `0xc4` | <a op name="arsh32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` | `∈{0..=31}`   |
| `0xc7` | <a op name="arsh64"> | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` | `∈{0..=63}`   |
| `0xcc` | <a op name="arsh32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xcf` | <a op name="arsh64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xd4` |     <a op name="le"> | `imm`          | `∈{0..=9}`    | `∈{0..=10}` | `∈{16,32,64}` |
| `0xdc` |     <a op name="be"> | `imm`          | `∈{0..=9}`    | `∈{0..=10}` | `∈{16,32,64}` |
| `0xe4` | <a op name="sdiv32"> | `dst32, imm32` | `∈{0..=9}`    | `∈{0..=10}` | `!= 0`        |
| `0xe7` | <a op name="sdiv64"> | `dst64, imm64` | `∈{0..=9}`    | `∈{0..=10}` | `!= 0`        |
| `0xec` | <a op name="sdiv32"> | `dst32, src32` | `∈{0..=9}`    | `∈{0..=10}` |               |
| `0xef` | <a op name="sdiv64"> | `dst64, src64` | `∈{0..=9}`    | `∈{0..=10}` |               |
:::

### Control flow opcodes

:::opcode_listing

| opcode |                    | operands            | dst_reg    | src_reg     |
|-------:|-------------------:|:--------------------|:-----------|:------------|
| `0x05` |   <a op name="ja"> | `off`               | `∈{0..=9}` | `∈{0..=10}` |
| `0x15` |  <a op name="jeq"> | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x1d` |  <a op name="jeq"> | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x25` |  <a op name="jgt"> | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x2d` |  <a op name="jgt"> | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x35` |  <a op name="jge"> | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x3d` |  <a op name="jge"> | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x45` | <a op name="jset"> | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x4d` | <a op name="jset"> | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x55` |  <a op name="jne"> | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x5d` |  <a op name="jne"> | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x65` | <a op name="jsgt"> | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x6d` | <a op name="jsgt"> | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x75` | <a op name="jsge"> | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0x7d` | <a op name="jsge"> | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xa5` |  <a op name="jlt"> | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xad` |  <a op name="jlt"> | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xb5` |  <a op name="jle"> | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xbd` |  <a op name="jle"> | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xc5` | <a op name="jslt"> | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xcd` | <a op name="jslt"> | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xd5` | <a op name="jsle"> | `dst64, imm64, off` | `∈{0..=9}` | `∈{0..=10}` |
| `0xdd` | <a op name="jsle"> | `dst64, src64, off` | `∈{0..=9}` | `∈{0..=10}` |
:::

### Call opcodes

:::opcode_listing

| opcode |                     | operands | dst_reg    | src_reg     | imm        |
|-------:|--------------------:|:---------|:-----------|:------------|:-----------|
| `0x85` |  <a op name="call"> | `imm64`  | `∈{0..=9}` | `∈{0..=10}` |
| `0x8d` | <a op name="callx"> | `reg64`  | `∈{0..=9}` | `∈{0..=10}` | `∈{0..=9}` |
| `0x95` |  <a op name="exit"> |          | `∈{0..=9}` | `∈{0..=10}` |
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
:::

:::todo
Detail changes between bpfel, SBF, and SBFv2
:::

## Function calls

:::todo
call and callx effects on r10 and shadow stack
:::
