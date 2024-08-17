import {Inter} from "next/font/google";
import "./globals.css";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "Fantasy Football Draft",
    description: "Enemies crushed, and driven before you; lamentations of the women have been heard.",
};

export default function RootLayout({children}) {
    return (
        <html lang="en">
        <body className={inter.className}>
        {children}
        </body>
        </html>
    );
}
