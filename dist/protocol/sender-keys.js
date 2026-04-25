import { randomBytes } from '@noble/hashes/utils';
import { encrypt, decrypt } from '../crypto/aead.js';
import { advanceChain } from '../crypto/kdf.js';
import { MessageType } from './types.js';
const MAX_SKIP = 256;
export const SenderKeys = {
    generate() {
        return {
            chainKey: randomBytes(32),
            chainIndex: 0,
        };
    },
    encrypt(state, plaintext) {
        const { messageKey, nextChainKey } = advanceChain(state.chainKey);
        const { ciphertext, nonce } = encrypt(messageKey, plaintext);
        return {
            ciphertext,
            nonce,
            chainIndex: state.chainIndex,
            nextState: {
                chainKey: nextChainKey,
                chainIndex: state.chainIndex + 1,
            },
        };
    },
    decrypt(record, chainIndex, nonce, ciphertext) {
        // Check skipped keys first
        if (record.skippedKeys.has(chainIndex)) {
            const messageKey = record.skippedKeys.get(chainIndex);
            const plaintext = decrypt(messageKey, nonce, ciphertext);
            const newSkipped = new Map(record.skippedKeys);
            newSkipped.delete(chainIndex);
            return {
                plaintext,
                nextRecord: {
                    chainKey: record.chainKey,
                    chainIndex: record.chainIndex,
                    skippedKeys: newSkipped,
                },
            };
        }
        if (chainIndex < record.chainIndex) {
            throw new Error(`Cannot decrypt: chain index ${chainIndex} already consumed and not in skipped keys`);
        }
        const skip = chainIndex - record.chainIndex;
        if (skip > MAX_SKIP) {
            throw new Error(`Too many skipped messages: ${skip} > ${MAX_SKIP}`);
        }
        // Advance chain, caching skipped keys
        let currentChainKey = record.chainKey;
        const newSkipped = new Map(record.skippedKeys);
        for (let i = record.chainIndex; i < chainIndex; i++) {
            const { messageKey, nextChainKey } = advanceChain(currentChainKey);
            newSkipped.set(i, messageKey);
            currentChainKey = nextChainKey;
        }
        // Derive message key for this index
        const { messageKey, nextChainKey } = advanceChain(currentChainKey);
        const plaintext = decrypt(messageKey, nonce, ciphertext);
        return {
            plaintext,
            nextRecord: {
                chainKey: nextChainKey,
                chainIndex: chainIndex + 1,
                skippedKeys: newSkipped,
            },
        };
    },
    createDistribution(groupId, state, signingPublicKey) {
        return {
            type: MessageType.SenderKeyDistribution,
            groupId,
            chainKey: state.chainKey,
            chainIndex: state.chainIndex,
            signingPublicKey,
            timestamp: Date.now(),
        };
    },
};
//# sourceMappingURL=sender-keys.js.map