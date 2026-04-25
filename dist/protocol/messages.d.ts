import type { ProtocolMessage } from './types.js';
export declare const MAX_FRAME_SIZE = 1048576;
export declare function encodeMessage(message: ProtocolMessage): Uint8Array;
export declare function decodeMessage(bytes: Uint8Array): ProtocolMessage;
export declare function frameMessage(message: ProtocolMessage): Uint8Array;
export declare function parseFrame(buffer: Uint8Array): {
    message: ProtocolMessage;
    bytesConsumed: number;
} | null;
//# sourceMappingURL=messages.d.ts.map