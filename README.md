# PlayCanvas-Pathfinding
This is a standalone example of pathfinding using the PlayCanvas Engine. To see it in action check out https://jhinrichs.com/examples/pathfinding/

I've seen a few examples out there for the Recast portion, but not so much on the Detour functionality.  This is a simple implementation of both.

Clicking on the platform will cause the Actor to navigate to the point clicked using the most advantageous path. If you click and drag away from the platform you can rotate the camera.  

# Tech Used
The technologies used are listed below.  I tend to only use the PlayCanvas editor for assets and handle the code / scripts externally. I decided to use Javascript ES6 (as opposed to React) to hilite the use of the latest Playcanvas ESM script formats.  Typescript is used for the main application. The proprietary PlayCanvas script format have some requirements that don't appear to transfer to Typescript real well so I didn't use Typescript for those.  Used Tailwind for the little bit of CSS needed.  Vite is the builder.

Javascript ES6 / ESM  
Typescript  
Tailwind CSS  
Playcanvas Engine  
Recast / Detour Libraries (https://github.com/isaac-mason/recast-navigation-js)  
Vite  

# Command Line prompts
npm install  
npx vite  
npx vite build  
