// Port of ../src/interfaces/IRubiksCubeObserver.ts.
package com.mikeb.simplepuzzlecube.interfaces

import com.mikeb.simplepuzzlecube.engine.Move

// The one-way contract presentations implement. The engine passes the move's identity
// so a presentation can present the specific change (animate the right layer, or the
// whole cube for a Rotation); `reset()` passes null (TS: no move argument).
fun interface IRubiksCubeObserver {
    fun onMove(move: Move?)
}
