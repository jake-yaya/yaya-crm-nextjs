"use client";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import Navbar from "../components/NavBar";
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>
          <Navbar />
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
