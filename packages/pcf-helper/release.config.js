export default {
  branches: ['master'],
  tagFormat: 'pcf-helper@v${version}',
  plugins: [
    ['@semantic-release/commit-analyzer', {
      releaseRules: [
        { scope: 'pcf-helper', type: 'feat', release: 'minor' },
        { scope: 'pcf-helper', type: 'fix', release: 'patch' },
        { scope: 'pcf-helper', type: 'perf', release: 'patch' },
        { scope: 'pcf-helper', type: 'chore', release: 'patch' },
        // commits without this scope won't trigger a release
        { scope: '!pcf-helper', release: false },
      ],
    }],
    '@semantic-release/release-notes-generator',
    ['@semantic-release/npm', {
      npmPublish: true,
      pkgRoot: '.',
    }],
    '@semantic-release/git',
    ['@semantic-release/github', {
      releaseNameTemplate: 'pcf-helper@v<%= nextRelease.version %>',
    }],
  ],
};