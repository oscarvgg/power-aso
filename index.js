#!/usr/bin/env node

var Table = require('cli-table3');
var memoize = require('memoizee');
const program = require('commander');

const app = {};
const aso = require('aso');
app.g = aso('gplay');
app.i = aso('itunes');

const ora = require('ora');
const spinner = ora('Searching')

program
  .usage('<cmd> [options] \n')

program
  .command('scores')
  .description('The scores function gathers several statistics about a keyword and builds difficulty and traffic scores that can be used to evaluate the convenience of targeting that keyword.')
  .option('-s, --store <store>', 'i (iTunes connect) or g (Google Play).')
  .option('-k, --keyword <keyword>', 'Keyword you want to score.')
  .action(args => {
    spinner.start();
    var fn = function (store, keyword) {
      return app[store].scores(keyword);
    };
    var memoized = memoize(fn, {
      'promise': true,
      'maxAge': 86400000,
      'preFetch': true
    });
    memoized(args.store, args.keyword)
      .then(handleKeywordResult)
      .catch(handle_error);
  })

program
  .command('suggest')
  .description('The suggest function returns a list of suggestions consisting of the most commonly used keywords among a given set of apps. There are several strategies to select that set of apps.')
  .option('-s, --store <store>', 'i (iTunes connect) or g (Google Play).')
  .option('--strategy <STRATEGY>', 'the strategy used to get suggestions (E.g. CATEGORY, SIMILAR, COMPETITION, ARBITRARY, KEYWORDS or SEARCH). Defaults to CATEGORY.', parseStrategy)
  .option('-n, --num <int>', 'the amount of suggestions to get in the results. Defaults to 30.', parseInt)
  .option('-a, --app-id <app-id>', 'store app ID (for iTunes both numerical and bundle IDs are supported). Required for the CATEGORY, SIMILAR and COMPETITION strategies.')
  .option('-A, --apps <apps>', 'Array of store app IDs separated by comas. Required for the ARBITRARY strategy.', parseStringArray)
  .option('-k, --keywords <keywords>', 'Array of keywords separated by comas. Required for the KEYWORDS and SEARCH strategies.', parseStringArray)
  .action(args => {
    spinner.start();
    var options = { 
      'strategy': args.strategy, 
      'num': args.num, 
      'appId': args.appId, 
      'apps': args.apps, 
      'keywords': args.keywords
    };
    var fn = function (store, options) {
      return app[store].suggest(options);
    };
    var memoized = memoize(fn, {
      'promise': true,
      'maxAge': 86400000,
      'preFetch': true
    });
    memoized(args.store, options)
      .then(printListResult)
      .catch(handle_error);
  })

program
  .command('visibility')
  .description('The visibility function gives an estimation of the app\'s discoverability within the store. The scores are built aggregating how well the app ranks for its target keywords, the traffic score for those keywords and how the app ranks in the top global and category rankings.')
  .option('-s, --store <store>', 'i (iTunes connect) or g (Google Play).')
  .option('-a, --app-id <app-id>', 'App Id/Bundle identifier')
  .action(args => {
    spinner.start();
    var fn = function (store, appId) {
      return app[store].visibility(appId);
    };
    var memoized = memoize(fn, {
      'promise': true,
      'maxAge': 86400000,
      'preFetch': true
    });
    memoized(args.store, args.appId)
      .then(handleVisibilityResult)
      .catch(handle_error);
  })

program
  .command('app')
  .description('The app function returns an array of keywords extracted from title and description of the app. The only argument is the Google Play ID of the application (the ?id= parameter on the url).')
  .option('-s, --store <store>', 'i (iTunes connect) or g (Google Play).')
  .option('-a, --app-id <app-id>', 'App Id.')
  .action(args => {
    var fn = function (store, appId) {
      return app[store].app(appId);
    };
    var memoized = memoize(fn, {
      'promise': true,
      'maxAge': 86400000,
      'preFetch': true
    });
    memoized(args.store, args.appId)
      .then(printListResult)
      .catch(handle_error);
  })

function parseStrategy(strategy) {
  switch (strategy) {
    case 'CATEGORY':
    case 'category':
    case 'cat':
      return 'category';
    case 'COMPETITION':
    case 'competition':
    case 'com':
      return 'competition';
    case 'SIMILAR':
    case 'similar': 
    case 'sim':
      return 'similar';
    case 'ARBITRARY':
    case 'arbitrary': 
    case 'arb':
      return 'arbitrary';
    case 'KEYWORDS':
    case 'keywords': 
    case 'key':
      return 'keywords';
    case 'SEARCH': 
    case 'search': 
    case 'sea':
      return 'search';
    default:
      return 'category';
  }
}

function parseStringArray(array) {
  return array.split(',');
}

function handleKeywordResult(result) {
  spinner.stop();
  var table = new Table({ head: ['Traffic', 'Difficulty', 'Competitors'] });
  table.push([
    result.traffic.score, 
    result.difficulty.score, 
    result.difficulty.competitors.score
  ]);
  console.log(table.toString());
  process.exit(0)
}

function printListResult(result) {
  spinner.stop();
  console.log(result.join('\n'));
  process.exit(0)
}

function formatKeywordVisibility(keywords) {
  var result = [];
  for (let mainKey in keywords) {
    
    if (keywords.hasOwnProperty(mainKey)) {
      const metricsObject = keywords[mainKey]
      var metricsArray = [
        metricsObject['traffic'],
        metricsObject['rank'],
        metricsObject['score']
      ];
      const row = {};
      row[mainKey] = metricsArray;
      result.push(row);
    }
  }
  return result;
}

function formatCollectionVisibility(collections) {
  return [
    {'global': [collections.global.rank || 'N/A', collections.global.score]},
    {'category': [collections.category.rank || 'N/A', collections.category.score]},
  ];
}

function handleVisibilityResult(result) {
  var apps = formatKeywordVisibility(result.keywords);
  var collections = formatCollectionVisibility(result.collections);

  spinner.stop();
  console.log('Score: ' + result.score);

  var keywordsTable = new Table({ head: ['Keyword', 'Traffic', 'Rank', 'Score'] });
  keywordsTable.push(...apps);
  console.log(keywordsTable.toString());

  var collectionsTable = new Table({ head: ['Collections', 'global', 'category'] });
  collectionsTable.push(...collections);
  console.log(collectionsTable.toString());

  process.exit(0)
}

function handleResult(res) {
  spinner.stop();
  console.log(JSON.stringify(res, null, 2));
  process.exit(0)
}
function handle_error(err) {
  spinner.stop();
  console.error(err);
  process.exit(1);
}

program.parse(process.argv)