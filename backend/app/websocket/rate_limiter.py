import time
from collections import defaultdict


class RateLimiter:
    def __init__(self):
        self.user_requests = defaultdict(list)

    def is_allowed(self, user_id: str, limit=15, window=5):
        now = time.time()
        requests = self.user_requests[user_id]

        self.user_requests[user_id] = [
            r for r in requests if now - r < window
        ]

        if len(self.user_requests[user_id]) >= limit:
            return False

        self.user_requests[user_id].append(now)
        return True


rate_limiter = RateLimiter()