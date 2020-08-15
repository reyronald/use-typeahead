import React from 'react'
import { BehaviorSubject } from 'rxjs'
import {
  debounceTime,
  filter,
  distinctUntilChanged,
  tap,
  switchMap,
  retry,
} from 'rxjs/operators'

const minLength = 2
export const debounceDueTime = 200

export type UseTypeaheadProps<T> = {
  search(query: string): Promise<T[]>
  onEnter(suggestion: T, selectedOption: HTMLLIElement): void
}

export function useTypeahead<T>({ search, onEnter }: UseTypeaheadProps<T>) {
  const behaviorSubjectRef = React.useRef(new BehaviorSubject(''))
  const behaviorSubject = behaviorSubjectRef.current

  const [isOpen, setIsOpen] = React.useState(false)
  const [value, setValue] = React.useState('')
  const [suggestions, setSuggestions] = React.useState<T[] | null>(null)
  const [selected, setSelected] = React.useState<null | number>(null)

  const inputRef = React.useRef<HTMLInputElement>(null)

  React.useEffect(() => {
    const subscription = behaviorSubject
      .pipe(
        tap((query: string) => {
          const nextIsOpen = query.length >= minLength
          setIsOpen(nextIsOpen)
          if (!nextIsOpen) {
            setSuggestions(null)
          }
        }),
        debounceTime(debounceDueTime),
        distinctUntilChanged(),
        filter((query: string) => query.length >= minLength),
        switchMap((query: string, _: number) => {
          return search(query)
        }),
        retry(0),
      )
      .subscribe(
        (value) => {
          setSuggestions(value)
        },
        (error) => {
          console.error(error)
          throw error
        },
      )

    return () => subscription.unsubscribe()
  }, [behaviorSubject, search])

  React.useEffect(() => {
    behaviorSubject.next(value)
  }, [behaviorSubject, value])

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { value } = e.currentTarget
    setValue(value)
  }

  function handleKeyUp(e: React.KeyboardEvent<HTMLElement>) {
    if (
      ['ArrowDown', 'PageDown', 'ArrowUp', 'PageUp', 'Home', 'End'].includes(
        e.key,
      )
    ) {
      e.preventDefault()
    }

    const pageScrollSize = 262

    const input = e.currentTarget as HTMLInputElement
    const listbox = getListBox(input)

    switch (e.key) {
      case 'ArrowDown':
        setSelected((prev) => {
          if (suggestions == null) {
            return null
          }
          if (prev == null) {
            return 0
          } else {
            return Math.min(prev + 1, suggestions.length - 1)
          }
        })
        break
      case 'PageDown':
        if (listbox) {
          if (listbox.scrollBy) {
            listbox.scrollBy({ top: pageScrollSize, behavior: 'smooth' })
          } else {
            listbox.scrollTop += pageScrollSize
          }
        }
        break
      case 'End':
        setSelected(suggestions == null ? null : suggestions.length - 1)
        break
      case 'ArrowUp':
        setSelected((prev) => {
          if (suggestions == null || prev == null) {
            return null
          }
          return Math.max(prev - 1, 0)
        })
        break
      case 'PageUp':
        if (listbox) {
          if (listbox.scrollBy) {
            listbox.scrollBy({ top: -pageScrollSize, behavior: 'smooth' })
          } else {
            listbox.scrollTop -= pageScrollSize
          }
        }
        break
      case 'Home':
        setSelected(selected == null ? null : 0)
        break
      case 'Escape':
        clear()
        break
      case 'Enter':
        const activeDescendantId = input.getAttribute('aria-activedescendant')
        const selectedOption = activeDescendantId
          ? (document.getElementById(activeDescendantId) as HTMLLIElement)
          : null

        if (selected != null && suggestions != null && selectedOption) {
          const suggestion = suggestions[selected]
          if (suggestion != null) {
            onEnter(suggestion, selectedOption)
          }
        }
        break
      default:
        // noop
        break
    }
  }

  useScrollToSelected(selected, inputRef)

  const clear = React.useCallback(function clear() {
    setValue('')
    setIsOpen(false)
    setSelected(null)
    setSuggestions(null)
  }, [])

  return {
    inputRef,
    isOpen,
    setIsOpen,
    suggestions,
    setSuggestions,
    value,
    setValue,
    handleChange,
    handleKeyUp,
    selected,
    setSelected,
    clear,
  }
}

function useScrollToSelected(
  selected: null | number,
  inputRef: React.RefObject<HTMLInputElement>,
) {
  React.useEffect(() => {
    const input = inputRef.current
    if (selected != null && input) {
      const activeDescendantId = input.getAttribute('aria-activedescendant')
      const selectedOption = activeDescendantId
        ? document.getElementById(activeDescendantId)
        : null

      const listbox = getListBox(input)

      if (
        selectedOption &&
        listbox &&
        listbox.scrollHeight > listbox.clientHeight
      ) {
        const scrollBottom = listbox.clientHeight + listbox.scrollTop
        const elementBottom =
          selectedOption.offsetTop + selectedOption.offsetHeight
        if (elementBottom > scrollBottom) {
          listbox.scrollTop = elementBottom - listbox.clientHeight
        } else if (selectedOption.offsetTop < listbox.scrollTop) {
          listbox.scrollTop = selectedOption.offsetTop
        }
      }
    }
  }, [selected])
}

function getListBox(input: HTMLInputElement) {
  const controlsElementId = input.getAttribute('aria-controls')
  const listbox = controlsElementId
    ? document.getElementById(controlsElementId)
    : null
  return listbox
}
