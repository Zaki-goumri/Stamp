import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Stamp",
  description: "Turn your NestJS app into an OAuth 2.0 provider.",
  base: "/Stamp/",
  cleanUrls: true,
  lastUpdated: true,
  themeConfig: {
    nav: [
      { text: "Guide", link: "/guide" },
      { text: "API reference", link: "/api-reference" },
    ],
    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "What is Stamp?", link: "/" },
          { text: "How it works", link: "/how-it-works" },
        ],
      },
      {
        text: "Guide",
        items: [{ text: "Getting started", link: "/guide" }],
      },
      {
        text: "Reference",
        items: [{ text: "API reference", link: "/api-reference" }],
      },
    ],
    socialLinks: [
      { icon: "github", link: "https://github.com/Zaki-goumri/Stamp" },
    ],
    search: { provider: "local" },
    editLink: {
      pattern: "https://github.com/Zaki-goumri/Stamp/edit/main/docs/:path",
    },
    outline: [2, 3],
  },
});
