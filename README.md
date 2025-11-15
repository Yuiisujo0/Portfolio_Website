# Portfolio — Loader + Sphere (Jean Cheah)

Libraries (vendored locally)
- Three.js (three.min.js) — included as js/lib/three.min.js
- GSAP (gsap.min.js) — included as js/lib/gsap.min.js

Why vendored and modified
- Instructor requirement: "Not using any external (somebody else's) JS link. You can use their js code, but alter it yourself."
- I have included the library files locally (js/lib/) rather than loading from CDN.

What I changed (high level)
- Camera: moved from (0,0,6) to (0,0.6,4.2) and changed FOV to 54 to alter composition.
- Geometry: increased sphere segments and radius (SphereGeometry(1.02,80,80)) for higher resolution.
- Rotation speeds: adjusted sphere rotation speeds to unique values for parallax.
- Group tilt: changed group.rotation.x/z to alter the static tilt (left-lean).
- Shader: lowered alpha threshold in fragment shader to preserve thin anti-aliased edges.
- GSAP: added a small hero-title entrance tween to the reveal timeline.
- Added comments in `js/script.js` marking each modification.

Files to inspect for changes
- js/script.js — main code, see header comments and MODIFIED markers.
- yyds.html — references to local vendor files.
- js/lib/three.min.js, js/lib/gsap.min.js — local vendor libs.

Author
- Jean Cheah (99256)