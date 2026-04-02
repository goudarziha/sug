export interface IVisitor {
    id: string
    fingerprint_hash: string
    created_at: string
    last_seen_at: string
    visit_count: number
    segment?: TSegment
}

export interface ISignal {
    fingerprint_hash?: string
    user_agent?: string
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    landing_path?: string
    language?: string
    referrer_domain?: string
    referrer_path?: string
    raw_payload?: string
}

export interface ISignalRow {
    visitor: IVisitor
    signal: ISignal
}

export interface ISignalRequest {
    utm_source?: string
    utm_medium?: string
    utm_campaign?: string
    referrer_domain?: string
    referrer_path?: string
    landing_path?: string
    raw_payload?: Record<string, unknown>
    language?: string
    user_agent?: string
}

export type TSegment =
    "paid-sports" |
    "paid-education" |
    "social-linkedin" |
    "social-facebook" |
    "sports-vertical" |
    "education-vertical" |
    "direct-traffic";