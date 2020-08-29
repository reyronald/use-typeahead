import React from 'react'

import { SimpleDemo } from './SimpleDemo'
import { TopNav } from './TopNav'

import './styles.scss'

export default function App() {
  const [hash, setHash] = React.useState('')

  React.useEffect(() => {
    document.title = 'reyronald - useTypeahead'

    function listener() {
      setHash(window.location.hash)
    }
    window.addEventListener('hashchange', listener)
    return () => {
      window.removeEventListener('hashchange', listener)
    }
  }, [])

  if (hash === '#simple') {
    return <SimpleDemo />
  } else if (hash === '#topnav') {
    return <TopNav />
  } else {
    return (
      <main>
        <h1>useTypeahead</h1>

        <p>
          See Source at{' '}
          <a href="https://github.com/reyronald/use-typeahead">
            https://github.com/reyronald/use-typeahead
          </a>
        </p>

        <p>
          Open in CodeSandbox{' '}
          <a href="https://codesandbox.io/s/github/reyronald/use-typeahead">
            https://codesandbox.io/s/github/reyronald/use-typeahead
          </a>
        </p>

        <p>
          — <a href="https://github.com/reyronald">Ronald Rey</a>
        </p>

        <hr />

        <p>
          <a href="#simple">Simple Demo</a>
        </p>
        <p>
          <a href="#topnav">Top Nav Demo</a>
        </p>
      </main>
    )
  }
}
