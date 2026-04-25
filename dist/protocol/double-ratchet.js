import { x25519 } from '@noble/curves/ed25519';
import { randomBytes } from '@noble/hashes/utils';
import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
import { encrypt, decrypt } from '../crypto/aead.js';
import { advanceChain } from '../crypto/kdf.js';
const MAX_SKIP = 256;
function dhRatchetStep(rootKey, dhOut) {
    const derived = hkdf(sha256, dhOut, rootKey, 'networkselfmd-ratchet-v1', 64);
    return {
        newRootKey: derived.slice(0, 32),
        chainKey: derived.slice(32, 64),
    };
}
function skippedKeyId(ratchetPublicKey, messageNumber) {
    // Use hex encoding of public key + ':' + message number
    const hex = Array.from(ratchetPublicKey)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');
    return `${hex}:${messageNumber}`;
}
export const DoubleRatchet = {
    initSender(sharedSecret, recipientRatchetPublic) {
        const sendRatchetPrivate = randomBytes(32);
        const sendRatchetPublic = x25519.getPublicKey(sendRatchetPrivate);
        // Perform DH with recipient's ratchet public key
        const dhOut = x25519.getSharedSecret(sendRatchetPrivate, recipientRatchetPublic);
        const { newRootKey, chainKey } = dhRatchetStep(sharedSecret, dhOut);
        return {
            rootKey: newRootKey,
            sendChainKey: chainKey,
            receiveChainKey: null,
            sendRatchetPrivate,
            sendRatchetPublic,
            receiveRatchetPublic: recipientRatchetPublic,
            sendMessageNumber: 0,
            receiveMessageNumber: 0,
            previousChainLength: 0,
            skippedKeys: new Map(),
        };
    },
    initReceiver(sharedSecret, ownRatchetKeyPair) {
        return {
            rootKey: sharedSecret,
            sendChainKey: null,
            receiveChainKey: null,
            sendRatchetPrivate: ownRatchetKeyPair.privateKey,
            sendRatchetPublic: ownRatchetKeyPair.publicKey,
            receiveRatchetPublic: null,
            sendMessageNumber: 0,
            receiveMessageNumber: 0,
            previousChainLength: 0,
            skippedKeys: new Map(),
        };
    },
    encrypt(state, plaintext) {
        if (!state.sendChainKey) {
            throw new Error('Send chain not initialized');
        }
        const { messageKey, nextChainKey } = advanceChain(state.sendChainKey);
        const { ciphertext, nonce } = encrypt(messageKey, plaintext);
        return {
            ciphertext,
            nonce,
            ratchetPublicKey: state.sendRatchetPublic,
            previousChainLength: state.previousChainLength,
            messageNumber: state.sendMessageNumber,
            nextState: {
                ...state,
                sendChainKey: nextChainKey,
                sendMessageNumber: state.sendMessageNumber + 1,
            },
        };
    },
    decrypt(state, ratchetPublicKey, previousChainLength, messageNumber, nonce, ciphertext) {
        // Check skipped keys
        const keyId = skippedKeyId(ratchetPublicKey, messageNumber);
        if (state.skippedKeys.has(keyId)) {
            const messageKey = state.skippedKeys.get(keyId);
            const plaintext = decrypt(messageKey, nonce, ciphertext);
            const newSkipped = new Map(state.skippedKeys);
            newSkipped.delete(keyId);
            return {
                plaintext,
                nextState: { ...state, skippedKeys: newSkipped },
            };
        }
        let currentState = { ...state, skippedKeys: new Map(state.skippedKeys) };
        // Check if we need a DH ratchet step
        const needsRatchet = !currentState.receiveRatchetPublic ||
            !uint8ArrayEquals(ratchetPublicKey, currentState.receiveRatchetPublic);
        if (needsRatchet) {
            // Skip remaining messages in current receiving chain
            if (currentState.receiveChainKey !== null && currentState.receiveRatchetPublic !== null) {
                currentState = skipMessages(currentState, currentState.receiveRatchetPublic, previousChainLength);
            }
            // Perform DH ratchet step (receiving)
            const dhOut = x25519.getSharedSecret(currentState.sendRatchetPrivate, ratchetPublicKey);
            const { newRootKey, chainKey: newReceiveChainKey } = dhRatchetStep(currentState.rootKey, dhOut);
            // Generate new sending ratchet keypair
            const newSendRatchetPrivate = randomBytes(32);
            const newSendRatchetPublic = x25519.getPublicKey(newSendRatchetPrivate);
            const dhOut2 = x25519.getSharedSecret(newSendRatchetPrivate, ratchetPublicKey);
            const { newRootKey: finalRootKey, chainKey: newSendChainKey } = dhRatchetStep(newRootKey, dhOut2);
            currentState = {
                ...currentState,
                rootKey: finalRootKey,
                sendChainKey: newSendChainKey,
                receiveChainKey: newReceiveChainKey,
                sendRatchetPrivate: newSendRatchetPrivate,
                sendRatchetPublic: newSendRatchetPublic,
                receiveRatchetPublic: ratchetPublicKey,
                previousChainLength: currentState.sendMessageNumber,
                sendMessageNumber: 0,
                receiveMessageNumber: 0,
            };
        }
        // Skip messages in current receiving chain if needed
        currentState = skipMessages(currentState, ratchetPublicKey, messageNumber);
        // Decrypt with current receive chain
        if (!currentState.receiveChainKey) {
            throw new Error('Receive chain not initialized');
        }
        const { messageKey, nextChainKey } = advanceChain(currentState.receiveChainKey);
        const plaintext = decrypt(messageKey, nonce, ciphertext);
        return {
            plaintext,
            nextState: {
                ...currentState,
                receiveChainKey: nextChainKey,
                receiveMessageNumber: currentState.receiveMessageNumber + 1,
            },
        };
    },
};
function skipMessages(state, ratchetPublicKey, until) {
    if (!state.receiveChainKey) {
        return state;
    }
    const skip = until - state.receiveMessageNumber;
    if (skip > MAX_SKIP) {
        throw new Error(`Too many skipped messages: ${skip} > ${MAX_SKIP}`);
    }
    let chainKey = state.receiveChainKey;
    const newSkipped = new Map(state.skippedKeys);
    for (let i = state.receiveMessageNumber; i < until; i++) {
        const { messageKey, nextChainKey } = advanceChain(chainKey);
        newSkipped.set(skippedKeyId(ratchetPublicKey, i), messageKey);
        chainKey = nextChainKey;
    }
    return {
        ...state,
        receiveChainKey: chainKey,
        receiveMessageNumber: until,
        skippedKeys: newSkipped,
    };
}
function uint8ArrayEquals(a, b) {
    if (a.length !== b.length)
        return false;
    for (let i = 0; i < a.length; i++) {
        if (a[i] !== b[i])
            return false;
    }
    return true;
}
//# sourceMappingURL=double-ratchet.js.map