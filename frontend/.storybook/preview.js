import "../src/app/styles/base.css"
import "../src/app/styles/fonts.css"
import "../src/app/styles/main.css"

/** @type { import('@storybook/vue3').Preview } */
const preview = {
  parameters: {
    actions: { argTypesRegex: "^on[A-Z].*" },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/,
      },
    },
    backgrounds: {
      default: "light",
      values: [
        {
          name: "light",
          value: "#ffffff",
        },
        {
          name: "dark",
          value: "#181818",
        },
      ],
    },
  },
}

export default preview