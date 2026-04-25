import { xchacha20poly1305 } from '@noble/ciphers/chacha';
import { randomBytes } from '@noble/hashes/utils';
export function encrypt(key, plaintext) {
    const nonce = randomBytes(24);
    const cipher = xchacha20poly1305(key, nonce);
    const ciphertext = cipher.encrypt(plaintext);
    return { ciphertext, nonce };
}
export function decrypt(key, nonce, ciphertext) {
    const cipher = xchacha20poly1305(key, nonce);
    return cipher.decrypt(ciphertext);
}
//# sourceMappingURL=aead.js.map