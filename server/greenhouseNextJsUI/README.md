# Step 5

## Carbon UI for Greenhouse

UI using IBM Carbon Design System React components.

## Create NextJS 13 app

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
