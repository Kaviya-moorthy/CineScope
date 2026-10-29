# CineScope: Movie Discovery & Streaming Availability Finder

A frontend-only React app for discovering real movies in 23 languages and finding legal places to watch them in India (or another country). All movie data and posters come from the TMDB API. There is no demo mode and no sample data: if the API cannot be reached you see an error with a Retry button.

CineScope does not host or stream films.

## Features

- Home: featured trending movie with backdrop; carousels for Trending, Popular, Top rated, Upcoming, Recently released; Popular Tamil, Telugu, Hindi, Malayalam, Kannada, English, Korean and Japanese; Free to watch; Free with ads; your platforms; recommendations; recently viewed. Each row has View all.
- Explore: title search (partial matches, debounced, stale requests cancelled), original-language filter for 23 languages, genre, year, minimum rating, provider, availability type, sort by popularity, rating or release date, Load More, Clear all filters.
- Details: poster, backdrop, overview, genres, runtime, rating, original language, cast, director, trailer (YouTube, loads only when you click), similar movies, Where to Watch, watchlist and favourites.
- Where to Watch: subscription, free, free with ads, rent and buy shown separately for the chosen country (default India; change it from the globe selector in the navbar).
- Cards show the real poster, title, year, original language, rating and, once scrolled into view, the real availability types and provider names for your region.
- Free Movies, Streaming Platforms, Watchlist (watched/unwatched), Favourites, all persisted in LocalStorage.

## Languages

Indian: Tamil, Telugu, Hindi, Malayalam, Kannada, Bengali, Marathi, Punjabi, Gujarati, Odia. International: English, Korean, Japanese, Chinese, Spanish, French, German, Italian, Portuguese, Turkish, Thai, Indonesian, Arabic.

The filter uses TMDB's **original language** field. It says nothing about dubbed audio or subtitles, which TMDB does not provide; the app never claims either. Each language fetches additional pages until at least 7 results exist when TMDB has them; otherwise it shows whatever exists. Chinese uses TMDB's `zh` code (Cantonese films tagged `cn` are not included).

## Setup

1. Get a free API key: create an account at https://www.themoviedb.org, then Settings, API (docs: https://developer.themoviedb.org/docs/getting-started).
2. Copy `.env.example` to `.env` and set `VITE_TMDB_API_KEY` (or `VITE_TMDB_READ_TOKEN`).
3. Install and run:

```
npm install
npm run dev        # start the site
npm run build      # production build into dist/
npm run preview    # serve the production build
```

Without a credential the app shows a setup screen rather than any movies.

## Security

`VITE_` variables are compiled into browser code, so a TMDB key used this way is visible to every visitor and is **not secret**. TMDB keys are free and low-risk, but do not reuse one that matters. For a hidden key, put a small proxy in front of TMDB (Cloudflare Workers, Netlify or Vercel Functions, or a tiny Node server) that adds the key server-side, and point `BASE` in `src/services/movieService.js` at it. Never commit `.env` (it is in `.gitignore`).

## Where the data comes from

| Data | TMDB endpoint |
| --- | --- |
| Trending | `/trending/movie/week` |
| Popular, top rated, upcoming, recent, language, genre, year, rating, provider filters | `/discover/movie` |
| Title search | `/search/movie` |
| Details, cast, director, trailer | `/movie/{id}?append_to_response=credits,videos` |
| Similar movies | `/movie/{id}/similar` |
| Where to watch | `/movie/{id}/watch/providers` |
| Provider list for a country | `/watch/providers/movie` |

## Streaming availability limitations

- TMDB's provider data is supplied by JustWatch. It varies by country and changes often.
- TMDB gives **no prices** and **no direct deep links** to a service's title page. CineScope therefore shows no prices and links only to TMDB's regional watch page (which lists those services). A "Watch on provider" button would be fabricated, so it is not shown.
- TMDB gives no per-provider full catalogue. The Platforms page shows titles TMDB reports for that provider and country, and may be incomplete.
- Subscription, free, free-with-ads, rent and buy are never merged. "Free" appears only when the data says so.
- Text search cannot be combined with provider or availability filters (TMDB search does not support them); the app tells you.
- If you need deep links, prices or audio/subtitle languages, use a licensed data source such as the Movie of the Night "Streaming Availability" API or JustWatch's partner API, called through a backend or serverless proxy because they use secret keys and have terms of their own.

## LocalStorage

Keys: `cinescope:favourites`, `cinescope:watchlist` (with watched status), `cinescope:providers`, `cinescope:recent`, `cinescope:theme`, `cinescope:region`. Saved entries from older builds that used sample data are ignored automatically.

## Deploy

Run `npm run build`, upload `dist/` to Netlify, Vercel, Cloudflare Pages or GitHub Pages, and set the `VITE_` variable in the host's settings before building. `public/_redirects` provides single-page-app routing on Netlify and Cloudflare Pages.

## Attribution and terms

Footer text required by TMDB: "This product uses the TMDB API but is not endorsed or certified by TMDB." Also credit JustWatch for availability data. When you publish, add the TMDB logo as their branding guidelines require and review the API terms: the free API is for non-commercial use unless you have a commercial agreement. Respect their rate limits.

## Structure

```
src/components  UI building blocks (MovieCard, MovieRow, Carousel, WhereToWatch, states...)
src/pages       Home, Explore, MovieDetails, FreeMovies, StreamingPlatforms, Watchlist, Favourites, NotFound
src/context     UserData (favourites, watchlist, providers, theme, region)
src/hooks       useLocalStorage, useAsync, useMovieQuery, useInView
src/services    movieService.js (all TMDB access)
src/utils       movieHelpers.js
src/styles      global.css, components.css, pages.css
```
