export default {
  branches: ['master'],
  tagFormat: 'pcf-helper-run@v${version}',
  plugins: [
    ['@semantic-release/commit-analyzer', {
      releaseRules: [
        { scope: 'pcf-helper-run', type: 'feat', release: 'minor' },
        { scope: 'pcf-helper-run', type: 'fix', release: 'patch' },
        { scope: 'pcf-helper-run', type: 'perf', release: 'patch' },
        // commits without this scope won't trigger a release
        { scope: '!pcf-helper-run', release: false },
      ],
    }],
    '@semantic-release/release-notes-generator',
    ['@semantic-release/npm', {
      npmPublish: true,
      pkgRoot: '.',
    }],
    '@semantic-release/git',
    ['@semantic-release/github', {
      releaseNameTemplate: 'pcf-helper-run@v<%= nextRelease.version %>',
    }],
  ],
};