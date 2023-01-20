import Head from 'next/head'
import Image from 'next/image'
import { Inter } from '@next/font/google'
import styles from 'styles/Home.module.css'
// calling directly into the package to have autoreload
// since this is only for dev it's fine
import { useFunctionary } from '../../react/lib'

export default function ANewPage() {
  // const { addEvent } = useFunctionary()

  return (
    <>
      <main className={styles.main}>
        <div className={styles.description}>
          <button
            onClick={
              () => undefined
              // addEvent({ name: 'test_test', ts: new Date().getTime() }, { ids: ['new-id-hell'], model: 'customer' })
            }
          >
            TEST SOMETHING
          </button>
        </div>
      </main>
    </>
  )
}
