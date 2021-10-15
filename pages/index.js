import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function Home({ filmler }) {
    return (
        <>
            <Head>
                <title>Contentful + nextjs</title>
                <meta name="description" content="Generated by create next app" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <main className={styles.main}>
                <h1 className={styles.title}>Contentful + nextjs</h1>
                <div className={styles.grid}>
                    <ul>
                        {filmler.map(({ baslik, slug, date, aciklama }) => {
                            return (
                                <li key={slug}>
                                    <h3>
                                        <Link href={`/${slug}`}>
                                            <a>{baslik}</a>
                                        </Link>
                                    </h3>
                                    <span>{date}</span>
                                    <p>{aciklama}</p>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            </main>
        </>
    );
}

export async function getStaticProps() {
    const result = await fetch(
        `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}/environments/master`,
        {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.CONTENTFUL_DELIVERY_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                query: `
                    query {
                        filmCollection {
                            items {
                                baslik
                                slug
                                date
                                aciklama
                            }
                        }
                    }
            `,
            }),
        }
    );

    if (!result.ok) {
        console.error(result);
        return {};
    }

    const { data } = await result.json();
    const filmler = data.filmCollection.items;

    return {
        props: {
            filmler,
        },
    };
}
