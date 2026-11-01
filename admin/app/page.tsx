import Link from "next/link";
import { readDataFile, readReleases, type DataFile } from "@admin/lib/dataFiles";

// Read from disk on every request, so the counts follow whatever was just saved.
export const dynamic = "force-dynamic";

const count = async (name: DataFile) => (await readDataFile<unknown[]>(name)).length;

export default async function Dashboard() {
    const [posts, videos, releases, products, instruments, effects, amplifiers, faq] = await Promise.all([
        count("posts"),
        count("videos"),
        readReleases().then((all) => Object.keys(all).length),
        count("products"),
        count("instruments"),
        count("effects"),
        count("amplifiers"),
        count("frequentlyAskedQuestions")
    ]);

    const cards = [
        { href: "/posts/", label: "Posts", count: posts },
        { href: "/videos/", label: "Videos", count: videos },
        { href: "/releases/", label: "Releases", count: releases },
        { href: "/products/", label: "Products", count: products },
        { href: "/equipment/", label: "Equipment", count: instruments + effects + amplifiers },
        { href: "/faq/", label: "FAQ", count: faq }
    ];

    return (
        <>
            <h1>Dashboard</h1>
            <p className="admin-note">
                Edits are saved straight to <code>src/data</code> and <code>public/data</code> in this checkout. Review them with{" "}
                <code>git diff</code> and commit as usual; nothing here deploys anything.
            </p>
            <ul className="admin-cards">
                {cards.map((card) => (
                    <li key={card.href}>
                        <Link href={card.href}>
                            <span className="admin-card-count">{card.count}</span>
                            <span>{card.label}</span>
                        </Link>
                    </li>
                ))}
            </ul>
        </>
    );
}
