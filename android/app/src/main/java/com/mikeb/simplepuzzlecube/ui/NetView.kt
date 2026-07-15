// The 2D net renderer — the classic cross-of-6-faces unfolding, drawn purely from the
// immutable UiState snapshot. Analog of the web 2D view's sticker grid, but (unlike the
// web 2D view) it participates in pacing: CubeScreen acknowledges each pending move after
// a short presentation delay, which is what resumes a paced driver.
package com.mikeb.simplepuzzlecube.ui

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.aspectRatio
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.mikeb.simplepuzzlecube.engine.OrientationKey
import com.mikeb.simplepuzzlecube.engine.Position

// Which cubie shows at (row, col) of a face's 3×3 sticker grid in the standard net:
//
//                [top]
//   [left] [front] [right] [back]
//               [bottom]
//
// Rows/cols are 0..2, top-left origin, each face oriented as you'd see it after
// unfolding the cube with the front face kept facing you.
private fun stickerPosition(face: OrientationKey, row: Int, col: Int): Position = when (face) {
    OrientationKey.front -> Position(X = col - 1, Y = 1 - row, Z = 1)
    OrientationKey.top -> Position(X = col - 1, Y = 1, Z = row - 1)
    OrientationKey.bottom -> Position(X = col - 1, Y = -1, Z = 1 - row)
    OrientationKey.left -> Position(X = -1, Y = 1 - row, Z = col - 1)
    OrientationKey.right -> Position(X = 1, Y = 1 - row, Z = 1 - col)
    OrientationKey.back -> Position(X = 1 - col, Y = 1 - row, Z = -1)
}

@Composable
private fun FaceGrid(
    face: OrientationKey,
    byPosition: Map<Position, CubieState>,
    modifier: Modifier = Modifier
) {
    Column(modifier = modifier.aspectRatio(1f), verticalArrangement = Arrangement.spacedBy(2.dp)) {
        for (row in 0..2) {
            Row(
                modifier = Modifier.weight(1f).fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(2.dp)
            ) {
                for (col in 0..2) {
                    val faceColor = byPosition[stickerPosition(face, row, col)]
                        ?.orientation?.get(face)
                        ?.let { COLORS.getValue(it) }
                    androidx.compose.foundation.layout.Box(
                        modifier = Modifier
                            .weight(1f)
                            .aspectRatio(1f)
                            .clip(RoundedCornerShape(3.dp))
                            .background(faceColor ?: Color.DarkGray)
                            .border(1.dp, Color(0x33000000), RoundedCornerShape(3.dp))
                    ) {}
                }
            }
        }
    }
}

@Composable
fun NetView(cubies: List<CubieState>, modifier: Modifier = Modifier) {
    val byPosition = cubies.associateBy { it.position }
    Column(modifier = modifier, verticalArrangement = Arrangement.spacedBy(4.dp)) {
        // top row: spacer, top face
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            androidx.compose.foundation.layout.Spacer(modifier = Modifier.weight(1f))
            FaceGrid(OrientationKey.top, byPosition, Modifier.weight(1f).padding(0.dp))
            androidx.compose.foundation.layout.Spacer(modifier = Modifier.weight(2f))
        }
        // middle row: left, front, right, back
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            FaceGrid(OrientationKey.left, byPosition, Modifier.weight(1f))
            FaceGrid(OrientationKey.front, byPosition, Modifier.weight(1f))
            FaceGrid(OrientationKey.right, byPosition, Modifier.weight(1f))
            FaceGrid(OrientationKey.back, byPosition, Modifier.weight(1f))
        }
        // bottom row: spacer, bottom face
        Row(modifier = Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
            androidx.compose.foundation.layout.Spacer(modifier = Modifier.weight(1f))
            FaceGrid(OrientationKey.bottom, byPosition, Modifier.weight(1f))
            androidx.compose.foundation.layout.Spacer(modifier = Modifier.weight(2f))
        }
    }
}
