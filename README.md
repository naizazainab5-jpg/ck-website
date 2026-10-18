# CK Traders & CK Sons website

Open `index.html` to preview. Owner panel: `admin.html`.
Until Firebase is connected, edits save only in the browser you edit in (demo mode).

## Make owner edits live for every customer (Firebase, free Spark plan)
1. console.firebase.google.com > create project > add a Web app > copy the config into `FIREBASE_CONFIG` in `data.js`.
2. Build > Authentication > Sign-in method > enable Email/Password > Users > add the owner's email + password.
3. Build > Firestore Database > create > Rules tab, paste, Publish:

    rules_version = '2';
    service cloud.firestore {
      match /databases/{db}/documents {
        match /site/{doc} {
          allow read: if true;
          allow write: if request.auth != null;
        }
      }
    }

4. Host the folder anywhere (Firebase Hosting, Netlify, GitHub Pages). Add your hosting domain under Authentication > Settings > Authorized domains.

## Adding photos
Resize to about 800px wide, copy into `images/`, then type the path (e.g. `images/rice.jpg`) in the admin panel.

## Fonts
Josefin Sans (SIL Open Font Licence) is used. The Gondens DEMO font is personal-use only, so it is not included.
