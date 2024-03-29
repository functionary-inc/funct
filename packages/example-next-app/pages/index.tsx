import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from 'styles/Home.module.css'
// calling directly into the package to have autoreload
// since this is only for dev it's fine
import { useFunctionary } from '../../react/lib'
import Link from 'next/link'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const { person, group, setApiKey } = useFunctionary({
    debug: true,
    baseURL: 'https://dev-slack-crm.localsymphony.io/api/v1',
  })

  // setApiKey('func_dc03effd7989b279ca076af11fc783f6775a8b60cfd8d945')

  return (
    <>
      <Head>
        <title>Create Next App</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className={styles.description}>
          <Link href={'/aNewPage'}>
            <button>Go To NEW PAGE</button>
          </Link>
          <button onClick={() => person.identify(['new-test-test'])}>TEST Identify For Person</button>

          <button onClick={() => group.identify(['hello-world'])}>TEST Identify For group</button>

          <button onClick={() => person.group(['hello-world'])}>Assign person to group</button>

          <button
            onClick={() => {
              person.reset()
              group.reset()
            }}
          >
            reset ctx
          </button>

          <button onClick={() => person.track('button_pressed')}>TEST event for person</button>

          <button onClick={() => group.track('org_button_pressed')}>TEST event for group</button>
        </div>

        <div className={styles.center}>
          <Image className={styles.logo} src="/next.svg" alt="Next.js Logo" width={180} height={37} priority />
          <div className={styles.thirteen}>
            <Image src="/thirteen.svg" alt="13" width={40} height={31} priority />
          </div>
        </div>

        <div className={styles.grid}>
          <a
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Docs <span>-&gt;</span>
            </h2>
            <p className={inter.className}>Find in-depth information about Next.js features and&nbsp;API.</p>
          </a>

          <a
            href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Learn <span>-&gt;</span>
            </h2>
            <p className={inter.className}>Learn about Next.js in an interactive course with&nbsp;quizzes!</p>
          </a>

          <a
            href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Templates <span>-&gt;</span>
            </h2>
            <p className={inter.className}>Discover and deploy boilerplate example Next.js&nbsp;projects.</p>
          </a>

          <a
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
            className={styles.card}
            target="_blank"
            rel="noopener noreferrer"
          >
            <h2 className={inter.className}>
              Deploy <span>-&gt;</span>
            </h2>
            <p className={inter.className}>Instantly deploy your Next.js site to a shareable URL with&nbsp;Vercel.</p>
          </a>
        </div>
      </main>
    </>
  )
}
