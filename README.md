# Power ASO

An app store optimization tool for power users.

I created this project because ASO tools are very expensive. And as a young indie developer, I can't afford them. This one, I could use completely for free.

This project is basically a cli wrapper for facundoolano's [aso](https://github.com/facundoolano/aso). And most of the following documentation comes directly from the library's readme.

## Installation

```bash
$ sudo npm install -g power-aso
```

## Usage

```bash
$ power-aso <cmd> [options]
```

### Keyword Scores

The `scores` command gathers several statistics about a keyword and builds **difficulty** and **traffic** scores that can be used to evaluate the convenience of targeting that keyword.

```bash
$ power-aso scores [options]

Options:
-s, --store <store> i (iTunes connect) or g (Google Play).
-k, --keyword <keyword> Keyword you want to score.
```

### Keyword suggestions

The `suggest` command returns a list of commonly used keywords among a given set of apps. There are several strategies to select.

This function takes an options object with the following properties:

* `strategy`: the strategy used to get suggestions (E.g. CATEGORY, SIMILAR, COMPETITION, ARBITRARY, KEYWORDS or SEARCH). Defaults to CATEGORY.
* `num`: the amount of suggestions to get in the results. Defaults to 30.
* `appId`: store app ID (for iTunes both numerical and bundle IDs are supported). Required for the CATEGORY, SIMILAR and COMPETITION strategies.
* `apps`: array of store app IDs. Required for the ARBITRARY strategy.
* `keywords`: array of seed keywords. Required for the KEYWORDS and SEARCH strategies.

```bash
$ power-aso suggest [options]

Options:
-s, --store <store> i (iTunes connect) or g (Google Play).
--strategy <STRATEGY> the strategy used to get suggestions (E.g. CATEGORY, SIMILAR, COMPETITION, ARBITRARY, KEYWORDS or SEARCH). Defaults to CATEGORY.
-n, --num <int> the amount of suggestions to get in the results. Defaults to 30.
-a, --app-id <app-id> store app ID (for iTunes both numerical and bundle IDs are supported). Required for the CATEGORY, SIMILAR and COMPETITION strategies.
-A, --apps <apps> Array of store app IDs separated by comas. Required for the ARBITRARY strategy.
-k, --keywords <keywords> Array of keywords separated by comas. Required for the KEYWORDS and SEARCH strategies.
```
A common flow of work would be to try all the strategies for a given app, hand pick the most interesting keywords and then run the scores function on them to analyze their quality.

### App visibility score

The `visibility` command gives an estimation of the app's discoverability within the store. The scores are built aggregating how well the app ranks for its target keywords, the traffic score for those keywords and how the app ranks in the top global and category rankings.

The App ID parameter is the package id for Google Play, and either numerical or bundle ID for iTunes.

```bash
$ power-aso visibility [options]

Options:
-s, --store <store> i (iTunes connect) or g (Google Play).
-a, --app-id <app-id> App Id/Bundle identifier
```

### App keywords

The `app` command returns a list of keywords extracted from the title and description of the app. The only parameter is the Google Play ID of the application (the ?id= parameter on the url).

```bash
$ power-aso app [options]

Options:
-s, --store <store> i (iTunes connect) or g (Google Play).')
-a, --app-id <app-id> App Id.
```

