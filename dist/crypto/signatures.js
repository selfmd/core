import { ed25519 } from '@noble/curves/ed25519';
export function sign(message, privateKey) {
    return ed25519.sign(message, privateKey);
}
export function verify(signature, message, publicKey) {
    try {
        return ed25519.verify(signature, message, publicKey);
    }
    catch {
        return false;
    }
}
//# sourceMappingURL=signatures.js.map