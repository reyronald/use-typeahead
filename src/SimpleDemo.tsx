import * as React from 'react'

import { User, users } from './users'
import { useFocusWithKeyboard, searchUsers } from './utils'
import { useTypeahead } from './useTypeahead'

import './SimpleDemo.scss'

export function SimpleDemo() {
  const [pickedSuggestion, setPickedSuggestion] = React.useState<null | User>(
    null,
  )

  const onPick = (suggestion: User) => {
    setPickedSuggestion(suggestion)
    clear()
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
            <ul id="search-listbox" className="search-listbox scrollbar">
              {suggestions?.map((suggestion, index) => (
                <li
                  key={suggestion.id}
                  aria-selected={index === selected}
                  id={`search-listbox-option-${index}`}
                  role="option"
                  className="search-listbox-suggestion"
                  onClick={() => onPick(suggestion)}
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
