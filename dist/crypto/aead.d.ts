export declare function encrypt(key: Uint8Array, plaintext: Uint8Array): {
    ciphertext: Uint8Array;
    nonce: Uint8Array;
};
export declare function decrypt(key: Uint8Array, nonce: Uint8Array, ciphertext: Uint8Array): Uint8Array;
//# sourceMappingURL=aead.d.ts.map