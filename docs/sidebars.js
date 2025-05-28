/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  gettingStarted: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'intro',
        'getting-started/getting-started-introduction',
        'getting-started/installation',
        'getting-started/quickstart',
      ],
    },
  ],
  userGuide: [
    {
      type: 'category',
      label: 'User Guide',
      items: [
        'user-guide/video-management',
        'user-guide/user-management',
        'user-guide/analytics',
        'user-guide/security',
      ],
    },
  ],
  apiReference: [
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api/api-overview',
        'api/authentication',
        'api/video-api',
        'api/user-api',
        'api/analytics-api',
        'api/webhooks',
      ],
    },
  ],
  development: [
    {
      type: 'category',
      label: 'Development',
      items: [
        'development/getting-started',
        'development/development-workflow',
        'development/development-testing',
        'development/development-deployment',
      ],
    },
  ],
  architecture: [
    {
      type: 'category',
      label: 'Architecture',
      items: [
        'architecture/system-architecture',
        'architecture/frontend-architecture',
        'architecture/backend-architecture',
        'architecture/database-architecture',
        'architecture/storage-architecture',
      ],
    },
  ],
  security: [
    {
      type: 'category',
      label: 'Security',
      items: [
        'security/security-guide',
        'security/security-authentication',
        'security/security-data-protection',
        'security/security-compliance',
      ],
    },
  ],
  contributing: [
    {
      type: 'category',
      label: 'Contributing',
      items: [
        'contributing/guidelines',
        'contributing/code-of-conduct',
        'contributing/pull-requests',
      ],
    },
  ],
};

module.exports = sidebars; 