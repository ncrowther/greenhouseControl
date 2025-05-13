# Step 5

## Carbon UI for Greenhouse

UI using IBM Carbon Design System React components.

## Build

Build and start

Install the Next.js app’s dependencies with:

yarn

After the dependencies are installed, create a build with:

yarn build


## Start

Run in Dev mode:
```bash
yarn dev
```

Configure paths in `jsconfig.json`

```
{
  "compilerOptions": {
    "baseUrl": "./src",
    "paths": {
      "@/components/*": ["components/*"],
      "@/app/*": ["app/*"]
   }
  }
}
```
