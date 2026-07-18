package com.mikeb.simplepuzzlecube.ui.view.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

// The web views are dark-only, so the app is too — one fixed scheme built from the
// ported tokens. No dynamic color: Material You would override the palette.
private val CubeColorScheme = darkColorScheme(
    primary = AccentZ,
    onPrimary = Color.White,
    secondary = AccentX,
    onSecondary = Color.White,
    tertiary = AccentCube,
    background = BgBottom,
    onBackground = TextPrimary,
    surface = Panel,
    onSurface = TextPrimary,
    surfaceVariant = Panel2,
    onSurfaceVariant = Muted,
    outline = PanelBorder,
    error = AccentX
)

@Composable
fun SimplePuzzleCubeTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = CubeColorScheme,
        typography = Typography,
        content = content
    )
}
