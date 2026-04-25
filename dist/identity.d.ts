import type { AgentIdentity } from './protocol/types.js';
export declare function zBase32Encode(data: Uint8Array): string;
export declare function fingerprintFromPublicKey(edPublicKey: Uint8Array): string;
export declare function generateIdentity(displayName?: string): AgentIdentity;
//# sourceMappingURL=identity.d.ts.map