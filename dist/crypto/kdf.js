import { hkdf } from '@noble/hashes/hkdf';
import { sha256 } from '@noble/hashes/sha256';
export function deriveKey(ikm, salt, info, length) {
    return hkdf(sha256, ikm, salt, info, length);
}
export function advanceChain(chainKey) {
    const messageKey = hkdf(sha256, chainKey, 'networkselfmd-msg-v1', '', 32);
    const nextChainKey = hkdf(sha256, chainKey, 'networkselfmd-chain-v1', '', 32);
    return { messageKey, nextChainKey };
}
//# sourceMappingURL=kdf.js.map