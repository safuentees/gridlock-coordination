import { AmbientLight, DirectionalLight, LightingEffect } from "@deck.gl/core"

type RGB = [number, number, number]
export const DENSITY_PALETTE: readonly [RGB, RGB, RGB] = [[13, 148, 136], [94, 164, 128], [245, 158, 11]]
export const DENSITY_LEGEND_GRADIENT = `linear-gradient(to right, ${DENSITY_PALETTE.map(color => `rgb(${color.join(" ")})`).join(", ")})`
// Metres required by PolygonLayer; this is bounded display exaggeration, never a fact.
export const DENSITY_DISPLAY_HEIGHT_MAX_METERS = 6_000
export const DENSITY_MATERIAL = { ambient: 0.55, diffuse: 0.55, shininess: 24, specularColor: [0, 0, 0] as RGB }

/** One effect per adapter lifetime. Shadows are omitted; only raised polygons shade. */
export function createDensityLighting(): LightingEffect {
  return new LightingEffect({
    ambient: new AmbientLight({ color: [255, 255, 255], intensity: 1 }),
    directional: new DirectionalLight({ color: [255, 255, 255], intensity: 0.95, direction: [-1, -3, -4] }),
  })
}
