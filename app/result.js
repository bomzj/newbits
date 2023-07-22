import { Either } from "ramda-fantasy"

export const isError = result => is(Either, result) && Either.isLeft(result)
export const isOk = result => is(Either, result) && Either.isRight(result)