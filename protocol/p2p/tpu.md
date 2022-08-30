---
title: TPU protocol
navTitle: TPU
---

TPU protocol
============

Overview
--------

TPU is a publicly available peer-to-peer service to queue transactions for inclusion on the Solana blockchain.

- **Clients** stream new transactions to leaders or relayers
- **Relayers** forward transactions to leaders or other relayers
- **Leaders** pack transactions into blocks

The lifecycle of a transaction starts with the signer.
Signers can either submit transactions directly to TPU nodes (requires UDP connectivity) or submit them through RPC servers.

In a Solana cluster, full nodes usually participate as TPU relayers, although not required.
All validators included in the leader schedule should operate an open TPU service.

Nodes attempt to forward transactions to the current leader's TPU endpoints.
The node identities of the leader schedule are well known (runtime intrinsic),
and their TPU endpoints are part of CRDS ContactInfo.

While leaders, validators ingest TPU traffic into their transaction processing unit.
Otherwise, validators act as relayers.

Leaders may also forward received traffic under certain circumstances,
e.g. when failing to pack transactions due to congestion.

:::todo
link term "leader" to consensus protocol specs
link term "CRDS" to gossip specs
:::

Endpoints
---------

Nodes expose multiple TPU endpoints to separate classes of transactions into distinct network flows.

- **TPU** is the default endpoint permitting unauthenticated clients
- **TPUvote** is reserved for Tower BFT vote transactions from staked validators
- **TPUfwd** ingests unprocessed transactions from the previous slot leader and inhibits further forwarding

TPU/QUIC protocol
-----------------

:::todo
document TLS preferences, streames, frames
:::

TPU/UDP protocol
----------------

:::tip
**Deprecated since Solana v1.11**

New nodes should only support TPU/QUIC.
:::

TPU/UDP is a simple datagram-oriented network protocol.

Each datagram carries a single [serialized transaction](../sealevel/transactions.md#serialization)
without headers or padding.

It is being deprecated in favor of TPU/QUIC, which adds authentication, confidentiality, and congestion control.

Security
--------

TPU traffic should be treated as confidential data.

Transactions are inherently nonpublic before their confirmation on the public blockchain network.
Exposing transactions to third-parties such as RPC providers or TPU relayers may be detrimental to the signer.
For example, a malicious TPU participant may intercept, delay, and frontrun token trades to extract arbitrage.

The ideal TPU route consists of a single hop from transaction signer to leader.
Using TPU/QUIC for end-to-end encryption further reduces MitM risks.

Leaders could always frontrun incoming traffic because they control transaction order in blocks (colloquially known as MEV).
It is therefore advisable to use MEV-protected applications and directly send sensitive transactions to validators that do not employ MEV.
