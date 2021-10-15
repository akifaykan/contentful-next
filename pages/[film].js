import Head from 'next/head';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

export default function filmPage({ film }) {
    const datex = new Date(film.date)
    return (
        <>
            <Head>
                <title>{film.baslik}</title>
                <meta name="description" content={film.aciklama} />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className={styles.main}>
                <h1 className="mt4 titlex">{film.baslik}</h1>
                <div className="video">
                    <iframe
                        width="560"
                        height="315"
                        src={film.videoUrl}
                        title={film.baslik}
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                    ></iframe>
                </div>
                <span>Tarih: {datex.toLocaleDateString()}</span>
                <div className={styles.grid}>{film.aciklama}</div>
                <h5>
                    <Link href="/">
                        <a>&larr; [Anasayfaya Dön]</a>
                    </Link>
                </h5>
            </main>
        </>
    );
}

export async function getStaticProps({ params }) {
    const { film } = params;

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
                    query GetFilm($slug:String!) {
                        filmCollection(where:{slug:$slug}, limit: 1) {
                            items {
                                baslik
                                slug
                                videoUrl
                                aciklama
                                date
                            }
                        }
                    }
                `,
                variables: {
                    slug: film,
                },
            }),
        }
    );

    if (!result.ok) {
        console.error(result);
        return {};
    }

    const { data } = await result.json();

    const [filmData] = data.filmCollection.items;

    return {
        props: {
            film: filmData,
        },
    };
}

export async function getStaticPaths() {
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
                                slug
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
    const filmlerSlug = data.filmCollection.items;

    const paths = filmlerSlug.map(({ slug }) => {
        return {
            params: {
                film: slug,
            },
        };
    });

    return {
        paths,
        fallback: false,
    };
}
