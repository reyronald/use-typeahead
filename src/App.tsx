import * as React from 'react'

import { User, users } from './users'
import { searchUsers } from './utils'
import { useTypeahead } from './useTypeahead'

import './styles.scss'

export default function App() {
  const [pickedSuggestion, setPickedSuggestion] = React.useState<null | User>(
    null,
  )

  const {
    inputRef,
    isOpen: isShowingSuggestions,
    suggestions,
    value,
    handleChange,
    handleKeyUp,
    selected,
    clear,
  } = useTypeahead<User>({
    search: React.useCallback(async (query: string) => {
      const maxResults = 25
      return searchUsers(users, query).slice(0, maxResults)
    }, []),
    onEnter: (suggestion, _selectedOption) => {
      setPickedSuggestion(suggestion)
      clear()
    },
  })

  useFocusWithKeyboard(inputRef)

  return (
    <main>
      <p>Keyboard support:</p>

      <ul>
        <li>
          Use <kbd>Ctrl</kbd>/<kbd>Cmd</kbd> <kbd>+</kbd> <kbd>Shift</kbd>{' '}
          <kbd>+</kbd> <kbd>F</kbd> to focus the input.
        </li>

        <li>
          Use <kbd>Esc</kbd> to clear the input.
        </li>

        <li>Use the arrow keys to highlight suggestions.</li>

        <li>
          Use <kbd>Home</kbd> and <kbd>End</kbd> to highlight the first and last
          result respectively.
        </li>

        <li>
          Use <kbd>PageUp</kbd> and <kbd>PageDown</kbd> to scroll through the
          suggestions container.
        </li>

        <li>
          Use <kbd>Enter</kbd> to select a suggestion
        </li>
      </ul>

      <input
        type="text"
        autoComplete="off"
        placeholder="Search"
        aria-label="Search"
        aria-controls="search-listbox"
        aria-activedescendant={
          selected == null ? undefined : `search-listbox-option-${selected}`
        }
        aria-expanded={isShowingSuggestions}
        aria-describedby="search-description"
        aria-keyshortcuts="Control+Shift+f Meta+Shift+f"
        role="listbox"
        onChange={handleChange}
        value={value}
        ref={inputRef}
        onKeyUp={handleKeyUp}
      />

      {isShowingSuggestions && (
        <div className="search-listbox-container">
          {suggestions?.length === 0 ? (
            <p>No results</p>
          ) : (
            <ul id="search-listbox" className="search-listbox">
              {suggestions?.map((suggestion, index) => (
                <li
                  key={suggestion.id}
                  aria-selected={index === selected}
                  id={`search-listbox-option-${index}`}
                  role="option"
                  className="search-listbox-suggestion"
                >
                  {suggestion.name} ({suggestion.username})
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {pickedSuggestion && (
        <>
          <p>
            {pickedSuggestion.name} (@{pickedSuggestion.username})<br />
          </p>

          <address>
            {pickedSuggestion.phone}
            <br />
            {pickedSuggestion.email.toLowerCase()}
            <br />
          </address>
        </>
      )}
    </main>
  )
}

function useFocusWithKeyboard(inputRef: React.RefObject<HTMLInputElement>) {
  React.useEffect(() => {
    let keys: string[] = []

    function onKeyDown(e: WindowEventMap['keydown']) {
      if (!e.repeat && typeof e.key === 'string') {
        keys.push(e.key)
      }
    }

    function onKeyUp(e: WindowEventMap['keyup']) {
      if (keys.length === 3) {
        const [first, second, third] = keys
        const activatedShortcutWithControlFirst =
          (first === 'Control' || first === 'Meta') &&
          second === 'Shift' &&
          (third === 'f' || third === 'F')
        const activatedShortcutWithShiftFirst =
          first === 'Shift' &&
          (second === 'Control' || second === 'Meta') &&
          (third === 'f' || third === 'F')

        if (
          activatedShortcutWithControlFirst ||
          activatedShortcutWithShiftFirst
        ) {
          inputRef.current?.focus()
        }
      }
      keys = keys.filter((key) => key.toUpperCase() !== e.key?.toUpperCase())
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)

    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [inputRef])
}
