package com.annapurna.lot;

/** Persistence vocabulary only; lifecycle transitions are intentionally not implemented yet. */
public enum LotStatus {
    DECLARED,
    COLLECTED,
    SAMPLED,
    VERIFIED,
    AVAILABLE,
    RESERVED,
    DISPATCHED,
    DELIVERED,
    SETTLED
}
