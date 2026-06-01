// Windows dev-server fix for Slidev v52 + a LOCAL theme (`theme: ./theme`).
//
// THE BUG (dev only; `slidev build` is unaffected):
//   Slidev builds the `/@slidev/conditional-styles` virtual module by feeding
//   the theme root into Vite's `import.meta.glob(..., { base: "/" })`. For a
//   local theme the root is resolved with Windows backslashes while the user
//   root is forward-slashed; with `base:"/"` on Windows the glob expands to a
//   mangled specifier with a drive letter in the MIDDLE, e.g.
//       ../Users/.../laws-of-learning/C:/Users/.../theme/styles/index.ts
//   The dev server's `vite:import-analysis` cannot normalize that URL, so every
//   page request 500s ("Failed to resolve import ... Does the file exist?").
//   At build time the glob is filesystem-expanded by the bundler and the broken
//   dev URL is never produced, which is why `slidev build` works clean.
//
// THE FIX: a post-transform pass over that one virtual module that rewrites any
// import specifier carrying an absolute `<DRIVE>:/...` segment into a valid
// Vite `/@fs/<DRIVE>:/...` file import. Verified: with this plugin the module
// resolves 200 and the deck renders; without it the same request 500s.
//
// Cross-talk reusable: drop this `setup/vite-plugins.ts` into any Slidev deck
// that uses a local `theme: ./theme` on Windows. It is a no-op on non-mangled
// specifiers and on macOS/Linux.

export default function () {
  return [
    {
      name: 'slidev-win-local-theme-glob-fix',
      enforce: 'post' as const,
      transform(code: string, id: string) {
        if (!id.includes('/@slidev/conditional-styles'))
          return null
        // Keep everything from the drive letter onward; drop the bogus
        // "../<userRoot>/" prefix the Windows glob prepended.
        const fixed = code.replace(
          /from\s+"[^"]*?([A-Za-z]:\/[^"]*?)"/g,
          (_m, abs) => `from "/@fs/${abs}"`,
        )
        if (fixed === code)
          return null
        return { code: fixed, map: null }
      },
    },
  ]
}
