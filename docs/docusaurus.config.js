// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

import {themes as prismThemes} from 'prism-react-renderer';

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'VideoCloud Documentation',
  tagline: 'A comprehensive video hosting platform',
  favicon: 'img/favicon.ico',

  url: 'https://docs.videocloud.com',
  baseUrl: '/',
  
  onBrokenLinks: 'ignore', // Change from 'warn' to 'ignore' to allow build with broken links
  onBrokenAnchors: 'ignore', // Ignore broken anchors as well

  // GitHub pages deployment config
  organizationName: 'kirull1',
  projectName: 'videocloud',

  // Internationalization configuration
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    localeConfigs: {
      en: {
        htmlLang: 'en-US',
        label: 'English',
      },
      ru: {
        htmlLang: 'ru-RU',
        label: 'Русский',
      },
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
          path: 'content',
          editUrl: ({locale, versionDocsDirPath, docPath}) => {
            if (locale !== 'en') {
              return `https://crowdin.com/project/videocloud/${locale}`;
            }
            return `https://github.com/yourusername/video-cloud/edit/main/${versionDocsDirPath}/${docPath}`;
          },
          include: ['**/*.{md,mdx}'],
          exclude: [
            '**/_*.{js,jsx,ts,tsx,md,mdx}',
            '**/_*/**',
            '**/*.test.{js,jsx,ts,tsx}',
            '**/__tests__/**',
          ],
        },
        blog: false,
        theme: {
          customCss: './styles/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: 'img/docusaurus-social-card.jpg',
      navbar: {
        title: 'VideoCloud',
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'gettingStarted',
            position: 'left',
            label: 'Getting Started',
            to: '/getting-started/getting-started-introduction',
          },
          {
            type: 'docSidebar',
            sidebarId: 'userGuide',
            position: 'left',
            label: 'User Guide',
            to: '/user-guide/video-management',
          },
          {
            type: 'docSidebar',
            sidebarId: 'apiReference',
            position: 'left',
            label: 'API Reference',
            to: '/api/api-overview',
          },
          {
            to: '/faq',
            label: 'FAQ',
            position: 'left',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/kirull1/videocloud',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        copyright: `Copyright © ${new Date().getFullYear()} VideoCloud. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config; 