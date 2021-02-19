import React from 'react'

import { User, users } from './users'
import { useFocusWithKeyboard, searchUsers } from './utils'
import { useTypeahead } from './useTypeahead'

import './TopNav.scss'

export function TopNav() {
  const [expanded, setExpanded] = React.useState(false)

  const [pickedSuggestion, setPickedSuggestion] = React.useState<null | User>(
    null,
  )

  const onPick = (suggestion: User) => {
    setPickedSuggestion(suggestion)
    setExpanded(false)
    clear()
    inputRef.current?.blur()
  }

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
      onPick(suggestion)
    },
  })

  useFocusWithKeyboard(inputRef, () => setExpanded(false))

  return (
    <>
      <div
        className={'overlay ' + (expanded ? 'overlay__visible' : '')}
        onClick={() => setExpanded(false)}
      />
      <nav>
        <div
          role="combobox"
          aria-label="Type here to search"
          aria-expanded={isShowingSuggestions}
          aria-owns="top-search-listbox"
          aria-controls="top-search-listbox"
          aria-haspopup="listbox"
          className="top-search-input-container"
        >
          <input
            ref={inputRef}
            id="top-search"
            name="top-search"
            type="text"
            autoComplete="off"
            placeholder="Type here to search"
            aria-label="Type here to search"
            aria-describedby="top-search-description"
            aria-controls="top-search-listbox"
            aria-activedescendant={
              selected == null
                ? undefined
                : `top-search-listbox-option-${selected}`
            }
            aria-keyshortcuts="Control+Shift+f Meta+Shift+f"
            onChange={handleChange}
            value={value}
            onKeyUp={handleKeyUp}
            onFocus={() => setExpanded(true)}
          />
        </div>

        <div className="top-search-drawer" aria-expanded={expanded}>
          <div
            id="top-search-description"
            className={isShowingSuggestions ? 'sr-only' : undefined}
          >
            <p>Keyboard support:</p>

            <ul>
              <li>
                Use <kbd>Ctrl</kbd> / <kbd>Cmd</kbd> <kbd>+</kbd>{' '}
                <kbd>Shift</kbd> <kbd>+</kbd> <kbd>F</kbd> to focus the input.
              </li>

              <li>
                Use <kbd>Esc</kbd> to clear the input.
              </li>

              <li>Use the arrow keys to highlight suggestions.</li>

              <li>
                Use <kbd>Home</kbd> and <kbd>End</kbd> to highlight the first
                and last result respectively.
              </li>

              <li>
                Use <kbd>PageUp</kbd> and <kbd>PageDown</kbd> to scroll through
                the suggestions container.
              </li>

              <li>
                Use <kbd>Enter</kbd> to select a suggestion
              </li>
            </ul>
          </div>

          {isShowingSuggestions && (
            <>
              {suggestions?.length === 0 ? (
                'No results 😥'
              ) : (
                <ul
                  id="top-search-listbox"
                  role="listbox"
                  aria-label="Search"
                  className="top-search-listbox scrollbar"
                >
                  {suggestions?.map((suggestion, index) => (
                    <li
                      key={suggestion.id}
                      aria-selected={index === selected}
                      id={`top-search-listbox-option-${index}`}
                      role="option"
                      className="top-search-listbox-suggestion"
                      onClick={() => onPick(suggestion)}
                    >
                      <UserCard user={suggestion} />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>
      </nav>

      <main>
        <p>
          <a href="#home">Home {'<<'}</a>
        </p>

        <h1>Top Nav Demo</h1>

        {pickedSuggestion && <UserCard user={pickedSuggestion} />}
      </main>
    </>
  )
}

function UserCard({ user }: { user: User }) {
  return (
    <>
      {user.name} (@{user.username})<br />
      <address>
        {user.phone}
        <br />
        {user.email.toLowerCase()}
        <br />
      </address>
    </>
  )
}
