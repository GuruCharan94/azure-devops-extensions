module.exports = {
    ci: {
        collect: {
            method: 'node',
            additive: false,
            headful: false,
            numberOfRuns: 1,
            chromePath: false,
            url: [
                'https://www.gurucharan.in/'                
            ],	  
            settings: {
                chromeFlags: '--ignore-certificate-error',
                preset: 'desktop',
                throttling: { rttMs: 40, throughputKbps: 10 * 1024, cpuSlowdownMultiplier: 1 },
            }
        },
        assert: {
            preset: 'lighthouse:no-pwa',
            assertions: {
                'categories:performance': ['error', { minScore: 0.5 }],
                'bypass': 'off',
                'is-crawlable': 'off',
                'unused-javascript': 'off'
            },
            includePassedAssertions: false
        },
        upload: {
            target: 'temporary-public-storage',
            uploadUrlMap: false
        },
    },
}