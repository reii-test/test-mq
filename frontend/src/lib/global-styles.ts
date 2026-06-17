"use client"

import { createGlobalStyle } from "styled-components"

export const GlobalStyles = createGlobalStyle`
  * {
    box-sizing: border-box;
  }

  html,
  body {
    margin: 0;
    padding: 0;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    background: #f0f2f5;
    color: #1a1d23;
    font-size: 15px;
  }

  a {
    color: inherit;
    text-decoration: none;
  }

  input, select, button {
    font-family: inherit;
    font-size: 0.9rem;
  }
`
