export declare const MessageType: {
    readonly IdentityHandshake: 1;
    readonly GroupSync: 2;
    readonly SenderKeyDistribution: 3;
    readonly GroupMessage: 4;
    readonly DirectMessage: 5;
    readonly GroupManagement: 6;
    readonly TTYARequest: 7;
    readonly TTYAResponse: 8;
    readonly NetworkAnnounce: 9;
    readonly Ack: 255;
};
export type MessageTypeValue = (typeof MessageType)[keyof typeof MessageType];
export interface IdentityHandshakeMessage {
    type: typeof MessageType.IdentityHandshake;
    edPublicKey: Uint8Array;
    noisePublicKey: Uint8Array;
    signature: Uint8Array;
    displayName?: string;
    protocolVersion: number;
    timestamp: number;
}
export interface GroupSyncMessage {
    type: typeof MessageType.GroupSync;
    groupId: Uint8Array;
    members: Uint8Array[];
    epoch: number;
    timestamp: number;
}
export interface SenderKeyDistributionMessage {
    type: typeof MessageType.SenderKeyDistribution;
    groupId: Uint8Array;
    chainKey: Uint8Array;
    chainIndex: number;
    signingPublicKey: Uint8Array;
    timestamp: number;
}
export interface GroupEncryptedMessage {
    type: typeof MessageType.GroupMessage;
    groupId: Uint8Array;
    senderFingerprint: string;
    chainIndex: number;
    ciphertext: Uint8Array;
    nonce: Uint8Array;
    timestamp: number;
}
export interface DirectEncryptedMessage {
    type: typeof MessageType.DirectMessage;
    recipientFingerprint: string;
    senderFingerprint: string;
    ratchetPublicKey: Uint8Array;
    previousChainLength: number;
    messageNumber: number;
    ciphertext: Uint8Array;
    nonce: Uint8Array;
    timestamp: number;
}
export interface GroupManagementMessage {
    type: typeof MessageType.GroupManagement;
    groupId: Uint8Array;
    action: 'create' | 'invite' | 'join' | 'leave' | 'kick' | 'promote';
    targetFingerprint?: string;
    groupName?: string;
    timestamp: number;
}
export interface TTYARequestMessage {
    type: typeof MessageType.TTYARequest;
    visitorId: string;
    message: string;
    ipHash: string;
    timestamp: number;
}
export interface TTYAResponseMessage {
    type: typeof MessageType.TTYAResponse;
    visitorId: string;
    message: string;
    timestamp: number;
}
export interface NetworkAnnounceMessage {
    type: typeof MessageType.NetworkAnnounce;
    groups: Array<{
        groupId: Uint8Array;
        name: string;
        selfMd: string;
        memberCount: number;
    }>;
    timestamp: number;
}
export interface AckMessage {
    type: typeof MessageType.Ack;
    messageId: string;
    timestamp: number;
}
export type ProtocolMessage = IdentityHandshakeMessage | GroupSyncMessage | SenderKeyDistributionMessage | GroupEncryptedMessage | DirectEncryptedMessage | GroupManagementMessage | TTYARequestMessage | TTYAResponseMessage | NetworkAnnounceMessage | AckMessage;
export interface AgentIdentity {
    edPrivateKey: Uint8Array;
    edPublicKey: Uint8Array;
    xPrivateKey: Uint8Array;
    xPublicKey: Uint8Array;
    fingerprint: string;
    displayName?: string;
}
export interface PeerInfo {
    publicKey: Uint8Array;
    fingerprint: string;
    displayName?: string;
    online: boolean;
    lastSeen: number;
    trusted: boolean;
}
export interface GroupInfo {
    groupId: Uint8Array;
    name: string;
    memberCount: number;
    role: 'admin' | 'member';
    createdAt: number;
    joinedAt: number;
    selfMd?: string;
    isPublic?: boolean;
}
export interface GroupMessage {
    id: string;
    groupId: Uint8Array;
    sender: PeerInfo;
    content: string;
    timestamp: number;
}
export interface DirectMessage {
    id: string;
    sender: PeerInfo;
    content: string;
    timestamp: number;
}
export interface GroupInvite {
    groupId: Uint8Array;
    groupName: string;
    inviter: PeerInfo;
    timestamp: number;
}
export interface TTYAVisitorRequest {
    visitorId: string;
    message: string;
    ipHash: string;
    timestamp: number;
}
//# sourceMappingURL=types.d.ts.map