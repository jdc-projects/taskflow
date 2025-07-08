import type { Metadata } from "next";
import { MantineProvider, ColorSchemeScript, createTheme } from "@mantine/core";
import { Montserrat } from "next/font/google";
import "@mantine/core/styles.css";
import "./globals.css";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500"],
});

const theme = createTheme({
  colors: {
    dark: [
      '#C9C9C9',
      '#b8b8b8',
      '#828282',
      '#696969',
      '#424242',
      '#3b3b3b',
      '#2e2e2e',
      '#242424',
      '#1f1f1f',
      '#141414',
    ],
  },
  fontFamily: montserrat.style.fontFamily,
  primaryColor: 'blue',
});

export const metadata: Metadata = {
  title: "TaskFlow",
  description: "A minimalistic task management application",
  icons: {
    icon: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <ColorSchemeScript />
      </head>
      <body className={montserrat.className}>
        <MantineProvider theme={theme} defaultColorScheme="light">
          {children}
        </MantineProvider>
      </body>
    </html>
  );
}
