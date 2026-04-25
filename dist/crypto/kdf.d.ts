export declare function deriveKey(ikm: Uint8Array, salt: string | Uint8Array, info: string, length: number): Uint8Array;
export declare function advanceChain(chainKey: Uint8Array): {
    messageKey: Uint8Array;
    nextChainKey: Uint8Array;
};
//# sourceMappingURL=kdf.d.ts.map