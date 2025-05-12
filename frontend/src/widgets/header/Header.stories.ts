import type { Meta, StoryObj } from '@storybook/vue3';
import Header from './Header.vue';

const meta = {
  title: 'Widgets/Header',
  component: Header,
  tags: ['autodocs'],
  argTypes: {
    isAuthenticated: { control: 'boolean' },
    userName: { control: 'text' },
    isSearchLoading: { control: 'boolean' },
    onSearch: { action: 'search' },
    onLogin: { action: 'login' },
    onSignup: { action: 'signup' },
    onLogout: { action: 'logout' }
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: `
# Header Component

The Header component for VideoCloud platform follows YouTube-like design principles:
- Clean, light design
- Responsive layout that adapts to different screen sizes
- Clear visual hierarchy

## Features

- Left section with Logo component
- Center section with Search component
- Right section with Auth component
- Full responsive support from mobile to desktop

## Usage

The Header component is typically used at the top level of your application layout.

\`\`\`vue
<Header
  :isAuthenticated="userStore.isAuthenticated"
  :userName="userStore.user.username"
  :isSearchLoading="searchStore.isLoading"
  @search="handleSearch"
  @login="navigateToLogin"
  @signup="navigateToSignup"
  @logout="handleLogout"
/>
\`\`\`

## Design System Integration

This component uses other components from our design system:
- \`Logo\` from shared/ui
- \`Search\` from features/search
- \`Auth\` from features/auth

Following Feature-Sliced Design architecture, the Header is in the widgets layer, combining features together.
        `
      },
      story: {
        inline: false,
        iframeHeight: 200,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        { name: 'light', value: '#F7FAFD' },
        { name: 'dark', value: '#161B23' },
      ],
    },
    viewport: {
      viewports: {
        mobile: {
          name: 'Mobile',
          styles: {
            width: '375px',
            height: '667px',
          },
        },
        tablet: {
          name: 'Tablet',
          styles: {
            width: '768px',
            height: '1024px',
          },
        },
        desktop: {
          name: 'Desktop',
          styles: {
            width: '1280px',
            height: '800px',
          },
        },
      },
      defaultViewport: 'desktop',
    },
  },
  decorators: [
    () => ({
      template: '<div style="width: 100%;"><story /></div>',
    }),
  ],
} satisfies Meta<typeof Header>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    isAuthenticated: false,
    isSearchLoading: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Default header state showing logo, search, and login/signup buttons.'
      },
    },
  },
};

export const LoggedIn: Story = {
  args: {
    isAuthenticated: true,
    userName: 'JohnDoe',
    isSearchLoading: false
  },
  parameters: {
    docs: {
      description: {
        story: 'Header state for authenticated users showing the user avatar and username.'
      },
    },
  },
};

export const SearchLoading: Story = {
  args: {
    isAuthenticated: false,
    isSearchLoading: true
  },
  parameters: {
    docs: {
      description: {
        story: 'Header state when a search is in progress, showing a loading indicator.'
      },
    },
  },
};

export const Mobile: Story = {
  args: {
    isAuthenticated: false,
    isSearchLoading: false
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Header displayed on mobile viewport, with responsive adjustments.'
      },
    },
  },
};

export const MobileLoggedIn: Story = {
  args: {
    isAuthenticated: true,
    userName: 'JohnDoe',
    isSearchLoading: false
  },
  parameters: {
    viewport: {
      defaultViewport: 'mobile',
    },
    docs: {
      description: {
        story: 'Authenticated header on mobile viewport.'
      },
    },
  },
};
