type CallbackType = () => void;

export class EventEmitter {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  callbacks: any

  constructor() {
    this.callbacks = {}
  }

  on(_names: string, callback: CallbackType) {
    if (_names === '') {
      console.error('Wrong Names')
      return false
    }

    // Resolve names
    const names = this.resolveNames(_names)

    // Each name
    names.forEach((_name: string) => {
      // Resolve name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
      const name: any = this.resolveName(_name)

      // Create namespace if not exist
      if (!(this.callbacks[name.namespace] instanceof Object)) {
        this.callbacks[name.namespace] = {}
      }

      // Create callback if not exist
      if (!(this.callbacks[name.namespace][name.value] instanceof Array)) {
        this.callbacks[name.namespace][name.value] = []
      }

      // Add callback
      this.callbacks[name.namespace][name.value].push(callback)
    })

    return this
  }

  off(_names: string) {
    // Errors
    if (_names === '') {
      console.warn('Wrong Name')
      return false
    }

    // Resolve names
    const names = this.resolveNames(_names)

    // Each name
    names.forEach((_name) => {
      // Resolve name
      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
      const name: any = this.resolveName(_name)

      // Remove namespace
      if (name.namespace !== 'base' && name.value === '') {
        delete this.callbacks[name.namespace]
      } else if (name.namespace === 'base') {
        // Try to remove from each namespace
        for (const namespace in this.callbacks) {
          if (
            this.callbacks[namespace] instanceof Object &&
            this.callbacks[namespace][name.value] instanceof Array
          ) {
            delete this.callbacks[namespace][name.value]

            // Remove namespace if empty
            if (Object.keys(this.callbacks[namespace]).length === 0) {
              delete this.callbacks[namespace]
            }
          }
        }
      } else if (
        this.callbacks[name.namespace] instanceof Object &&
        this.callbacks[name.namespace][name.value] instanceof Array
      ) {
        // Specified namespace
        delete this.callbacks[name.namespace][name.value]

        // Remove namespace if empty
        if (Object.keys(this.callbacks[name.namespace]).length === 0) {
          delete this.callbacks[name.namespace]
        }
      }
    })

    return this
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
  trigger(_name: string, _args: any[] = []) {
    // Errors
    if (_name === '') {
      console.warn('Wrong Name')
      return false
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
    let finalResult: any
    let result = null

    // Default args
    const args = !(_args instanceof Array) ? [] : _args

    // Resolve names (should on have one event)
    const nameArr = this.resolveNames(_name)

    // Resolve name
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
    const name: any = this.resolveName(nameArr[0])

    // Default namespace
    if (name.namespace === 'base') {
      // Try to find callback in each namespace
      for (const namespace in this.callbacks) {
        if (
          this.callbacks[namespace] instanceof Object &&
          this.callbacks[namespace][name.value] instanceof Array
        ) {
          // eslint-disable-next-line no-loop-func, @typescript-eslint/no-explicit-any -- TODO
          this.callbacks[namespace][name.value].forEach((callback: any) => {
            result = callback.apply(this, args)
            if (finalResult === undefined) {
              finalResult = result
            }
          })
        }
      }
    } else if (this.callbacks[name.namespace] instanceof Object) {
      if (name.value === '') {
        console.warn('Wrong Name')
        return this
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
      this.callbacks[name.namespace][name.value].forEach((callback: any) => {
        result = callback.apply(this, args)
        if (finalResult === undefined) {
          finalResult = result
        }
      })
    }

    return finalResult
  }

  resolveNames(_names: string) {
    let names = _names
    names = names.replace(/[^a-zA-Z0-9 ,/.]/g, '')
    names = names.replace(/[,/]+/g, ' ')
    return names.split(' ')
  }

  resolveName(name: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- TODO
    const newName: any = {}
    const parts = name.split('.')
    newName.original = name
    newName.value = parts[0]
    newName.namespace = 'base' // Base namespace

    // Specified namespace
    if (parts.length > 1 && parts[1] !== '') {
      newName.namespace = parts[1]
    }

    return newName
  }
}
