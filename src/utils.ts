import React from 'react'
import fuzzaldrinPlus from 'fuzzaldrin-plus'

import { User } from './users'

export function searchUsers(users: User[], term: string) {
  const results = fuzzaldrinPlus.filter(users, term, { key: 'name' })
  return results
}

export function useFocusWithKeyboard(
  inputRef: React.RefObject<HTMLInputElement>,
  onEscape?: () => void,
) {
  React.useEffect(() => {
    let keys: string[] = []

    function onKeyDown(e: WindowEventMap['keydown']) {
      if (!e.repeat && typeof e.key === 'string') {
        keys.push(e.key)
      }
    }

    function onKeyUp(e: WindowEventMap['keyup']) {
      if (e.key === 'Escape') {
        onEscape?.()
      }

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
