import type { SenderKeyDistributionMessage } from './types.js';
export interface SenderKeyState {
    chainKey: Uint8Array;
    chainIndex: number;
}
export interface SenderKeyRecord {
    chainKey: Uint8Array;
    chainIndex: number;
    skippedKeys: Map<number, Uint8Array>;
}
export declare const SenderKeys: {
    generate(): SenderKeyState;
    encrypt(state: SenderKeyState, plaintext: Uint8Array): {
        ciphertext: Uint8Array;
        nonce: Uint8Array;
        chainIndex: number;
        nextState: SenderKeyState;
    };
    decrypt(record: SenderKeyRecord, chainIndex: number, nonce: Uint8Array, ciphertext: Uint8Array): {
        plaintext: Uint8Array;
        nextRecord: SenderKeyRecord;
    };
    createDistribution(groupId: Uint8Array, state: SenderKeyState, signingPublicKey: Uint8Array): SenderKeyDistributionMessage;
};
//# sourceMappingURL=sender-keys.d.ts.map