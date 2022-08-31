---
title: Gossip
---

Gossip Protocol
===============

The gossip protocol serves to synchronize the cluster-replicated data store (CRDS) between nodes.

Networking
----------

Gossip messages use the UDP protocol.

Each message is prefixed by a four-byte message header identifying the message type.
The message content is specific to the `msgid` field and immediately follows the header.

```c
struct fd_gossip_msg_header {
  uint8_t msgid;      // FD_GOSSIP_MSGID_*
  uint8_t padding[3]; // zeros
}
```

Pull mode
---------

Nodes can request CRDS entries by sending pull requests.

```c
#define FD_GOSSIP_MSGID_PULL_REQ  0
#define FD_GOSSIP_MSGID_PULL_RESP 1
```

:::todo
bloom filters and pull req / pull resp
:::

Push mode
---------

```c
#define FD_GOSSIP_MSGID_PUSH  2
#define FD_GOSSIP_MSGID_PRUNE 3
```

:::todo
push / prune
:::

Ping protocol
-------------

The ping protocol probes whether a node identity is online interactively.

Each sent ping message solicits a corresponding pong message back to the sender.

```c
#define FD_GOSSIP_MSGID_PING 4
#define FD_GOSSIP_MSGID_PONG 5

struct fd_gossip_ping_msg {
  sol_pubkey_t    from;
  sol_hash_t      token;
  sol_signature_t signature;
}
static_assert(sizeof(fd_gossip_ping_msg) == 128);
```

`from` is the public key of the node identity of the sender.
Ping messages contain an arbitrary 32 byte token, signed by public key `from`.

Upon receiving a ping message, nodes will respond with a pong.
Pong messages set `token` to the SHA-256 hash of the original `token` from the ping message, along with a matching signature.

The initiating party should choose a new random 32 byte value for every ping message they send.
It is improbable that the receiving party has already signed the corresponding pong frame.
A ping/pong-exchange therefore proves that the receiving party and the node identity is online.

The ping protocol is susceptible to man-in-the-middle and replay attacks.
It should be used together with endpoint authentication, e.g. `ContactInfo`.

:::todo
network sequence diagram
:::
