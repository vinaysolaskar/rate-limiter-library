function setRateLimitHeaders(res, limit, remaining, reset) {
    res.set('X-RateLimit-Limit', limit);
    res.set('X-RateLimit-Remaining', remaining);
    res.set('X-RateLimit-Reset', reset);
    // For 429, also set Retry-After
    if (res.statusCode === 429) {
        res.set('Retry-After', Math.ceil((reset - Date.now()) / 1000));
    }
}

module.exports =  setRateLimitHeaders;