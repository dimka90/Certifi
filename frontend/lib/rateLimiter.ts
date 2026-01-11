
export class RateLimiter {
    private tokens: number;
    private lastRefill: number;
    private readonly maxTokens: number;
    private readonly refillRate: number; // tokens per ms

    constructor(maxTokens: number, refillIntervalMs: number) {
        this.tokens = maxTokens;
        this.maxTokens = maxTokens;
        this.refillRate = maxTokens / refillIntervalMs;
        this.lastRefill = Date.now();
    }

    tryConsume(): boolean {
        this.refill();
        if (this.tokens >= 1) {
            this.tokens -= 1;
            return true;
        }
        return false;
    }

    private refill() {
        const now = Date.now();
        const elapsed = now - this.lastRefill;
        const refillAmount = elapsed * this.refillRate;

        this.tokens = Math.min(this.maxTokens, this.tokens + refillAmount);
        this.lastRefill = now;
    }

    getRemainingTokens(): number {
        this.refill();
        return Math.floor(this.tokens);
    }
}

// Default export of a global instance for UI-level limiting
export const globalRateLimiter = new RateLimiter(5, 10000); // 5 requests every 10 seconds
