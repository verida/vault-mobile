export type Stateful<T> =
  | {
      readonly loading: true
    }
  | {
      readonly loading: false
      readonly result: T
    }
  | {
      readonly loading: false
      readonly error: Error
    }
