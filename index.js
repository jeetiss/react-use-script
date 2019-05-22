import {useRef, useEffect, useReducer} from 'react'

const useLatestRef = value => {
  const ref = useRef(value)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref
}

// eslint-disable-next-line object-property-newline
const merge = (state, newState) => ({...state, ...newState})
const runRef = (ref, args) => ref.current && ref.current(...args)

export const useScript = (url, {onLoad, onError, onComplete} = {}) => {
  const [{loaded, error}, setState] = useReducer(merge, {
    loaded: false,
    error: null,
  })

  const savedLoad = useLatestRef(onLoad)
  const savedError = useLatestRef(onError)
  const savedComplete = useLatestRef(onComplete)

  useEffect(() => {
    const script = document.createElement('script')

    script.src = url
    script.async = 1

    const loadedFine = () => {
      setState({loaded: true})
      runRef(savedLoad)
      runRef(savedComplete)
    }

    const loadedWithError = error => {
      setState({error})
      runRef(savedError, [error])
      runRef(savedComplete)
    }

    script.addEventListener('load', loadedFine)
    script.addEventListener('error', loadedWithError)
    document.body.appendChild(script)

    return () => {
      script.removeEventListener('load', loadedFine)
      script.removeEventListener('error', loadedWithError)
      script.parentNode.removeChild(script)
    }
  }, [savedComplete, savedError, savedLoad, url])

  return [loaded, error]
}
