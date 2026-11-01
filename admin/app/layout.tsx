import type { ReactNode } from "react";
import Link from "next/link";
import "./admin.css";

export const metadata = {
    title: "Dehli Musikk admin",
    robots: { index: false, follow: false }
};

const SECTIONS = [
    { href: "/", label: "Dashboard" },
    { href: "/posts/", label: "Posts" },
    { href: "/videos/", label: "Videos" },
    { href: "/releases/", label: "Releases" },
    { href: "/products/", label: "Products" },
    { href: "/equipment/", label: "Equipment" },
    { href: "/faq/", label: "FAQ" }
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    return (
        <html lang="en">
            <body>
                <header className="admin-header">
                    <strong>Dehli Musikk admin</strong>
                    <nav>
                        {SECTIONS.map((section) => (
                            <Link key={section.href} href={section.href}>
                                {section.label}
                            </Link>
                        ))}
                    </nav>
                </header>
                <main className="admin-main">{children}</main>
            </body>
        </html>
    );
}
