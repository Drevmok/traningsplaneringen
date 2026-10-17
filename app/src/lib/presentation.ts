/** Call from the click that starts Kör passet. Fullscreen from an effect is rejected. */
export function enterPresentation(): void {
  const root = document.documentElement
  if (document.fullscreenElement || !root.requestFullscreen) return
  void root.requestFullscreen().catch(() => {})
}
