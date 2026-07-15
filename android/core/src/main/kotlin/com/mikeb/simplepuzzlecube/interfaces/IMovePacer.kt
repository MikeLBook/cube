// Port of ../src/interfaces/IMovePacer.ts.
package com.mikeb.simplepuzzlecube.interfaces

// The one thing the solver knows about the outside world: a pacer whose `settled()`
// resumes once the presentation has fully presented the latest move (instantly for a
// headless run, animation-end for a view, motor completion for a robot). TS
// `settled(): Promise<void>` → a suspend fun; a rejected promise → a throw.
interface IMovePacer {
    suspend fun settled()
}
