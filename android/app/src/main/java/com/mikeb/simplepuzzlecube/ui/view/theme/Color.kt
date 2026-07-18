package com.mikeb.simplepuzzlecube.ui.view.theme

import androidx.compose.ui.graphics.Color
import com.mikeb.simplepuzzlecube.engine.Face

// Design tokens ported from the web views' shared palette
// (src/presentations/3DWeb/3DWeb.css :root, kept consistent with the 2D net's index.css).
val Panel = Color(0xFF22232B) // --panel
val Panel2 = Color(0xFF2C2D37) // --panel-2
val Panel3 = Color(0xFF353643) // --panel-3
val PanelBorder = Color(0xFF3B3C4A) // --border
val TextPrimary = Color(0xFFECEDF3) // --text
val Muted = Color(0xFF9A9BAD) // --muted

val AccentX = Color(0xFFE0566A) // --accent-x (primary action, 'scrambling')
val AccentY = Color(0xFF34C47C) // --accent-y ('solved')
val AccentZ = Color(0xFF4F86FF) // --accent-z (brand, 'solving')
val AccentCube = Color(0xFFB78BFF) // --accent-cube

val BgTop = Color(0xFF15151D) // body gradient start
val BgBottom = Color(0xFF0F0F15) // body gradient end
val BgGlow = Color(0xFF2A2B3C) // the radial glow behind the stage
val Plastic = Color(0xFF14141B) // cubie face base plastic (cubieDom.ts)

// Sticker colours (config.ts COLORS — the index.css palette).
val COLORS: Map<Face, Color> = mapOf(
    Face.Y to Color(0xFFFFD43B),
    Face.R to Color(0xFFD92B3C),
    Face.B to Color(0xFF2256D6),
    Face.G to Color(0xFF1EAA5B),
    Face.O to Color(0xFFFF7A18),
    Face.W to Color(0xFFF4F4F0)
)
