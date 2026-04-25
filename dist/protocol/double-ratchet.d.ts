export interface DoubleRatchetState {
    rootKey: Uint8Array;
    sendChainKey: Uint8Array | null;
    receiveChainKey: Uint8Array | null;
    sendRatchetPrivate: Uint8Array;
    sendRatchetPublic: Uint8Array;
    receiveRatchetPublic: Uint8Array | null;
    sendMessageNumber: number;
    receiveMessageNumber: number;
    previousChainLength: number;
    skippedKeys: Map<string, Uint8Array>;
}
export declare const DoubleRatchet: {
    initSender(sharedSecret: Uint8Array, recipientRatchetPublic: Uint8Array): DoubleRatchetState;
    initReceiver(sharedSecret: Uint8Array, ownRatchetKeyPair: {
        privateKey: Uint8Array;
        publicKey: Uint8Array;
    }): DoubleRatchetState;
    encrypt(state: DoubleRatchetState, plaintext: Uint8Array): {
        ciphertext: Uint8Array;
        nonce: Uint8Array;
        ratchetPublicKey: Uint8Array;
        previousChainLength: number;
        messageNumber: number;
        nextState: DoubleRatchetState;
    };
    decrypt(state: DoubleRatchetState, ratchetPublicKey: Uint8Array, previousChainLength: number, messageNumber: number, nonce: Uint8Array, ciphertext: Uint8Array): {
        plaintext: Uint8Array;
        nextState: DoubleRatchetState;
    };
};
//# sourceMappingURL=double-ratchet.d.ts.map