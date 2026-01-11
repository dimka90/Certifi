
export interface CertificateIssuedEvent {
    tokenId: bigint;
    student: string;
    institution: string;
    degreeTitle: string;
    timestamp: bigint;
}

export interface InstitutionRegisteredEvent {
    institution: string;
    name: string;
    institutionID: string;
    timestamp: bigint;
}

export interface CertificateRevokedEvent {
    tokenId: bigint;
    institution: string;
    reason: string;
    timestamp: bigint;
}

export type ContractEvent =
    | { type: 'CertificateIssued', data: CertificateIssuedEvent }
    | { type: 'InstitutionRegistered', data: InstitutionRegisteredEvent }
    | { type: 'CertificateRevoked', data: CertificateRevokedEvent };
