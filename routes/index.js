/**
 * An example of a REST API for auto completing a search query.
 * This example uses a static JSON file for the data but it can 
 * easily be replaced with a DB (e.g., mongoDB) or any other 
 * source
 */
var express = require('express');
var url = require('url');
var fs = require("fs");
var jsonquery = require("json-query");

var router = express.Router();
var dataLoaded = false;
var db;

/* Default - GET home page */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'AutoComplete API Example' });
});

/**
 * Loads country data from a JSON file and parses it into
 * 'db' (array of countries).
 * Note that each array item contains more than just the country name
 */
function loadData() {
  dataLoaded = true;
  var data = fs.readFileSync("countries.json");
  db = JSON.parse(data);
}

/**
 * Called with a query string to retrieve a JSON represnetation
 * of the relevant auto-complete options.
 * On success, returns a JSON in the following format:
 * [{ "name": "country1"}, { "name": "country2"}]
 * 
 * On Failure (empty of missing query string or no results),
 * returns a JSON with {}
 * 
 * @param {string} query the query string
 * @returns JSON
 */
function getAutocomplete(query, startswith) {
  if (!dataLoaded)
    loadData();

  console.debug("Received "+query);

  // Ignore invalid or empty query strings
  if (query == undefined || query.length == 0)
    return JSON.stringify({});

  // Perform the actual search
  // These lines can be replaced with a DB query or other, depending on where
  // the data is stored  
  var options;  
  if (startswith == undefined || startswith == 'no' || startswith != 'yes')
    options = db.filter(item => item.name.toLowerCase().indexOf(query)>-1);
  else
    options = db.filter(item => item.name.toLowerCase().indexOf(query)==0);

  // No results
  if (options.length == 0)
    return JSON.stringify({});
  
  // Create JSON for the results
  var results = [];
  for (let i = 0 ; i < options.length; i++) {
    results.push({name: options[i].name});
  }  
  return JSON.stringify(results);
}

/**
 * Handles the API call,
 * REST:   /ac?ac=query_string&sw=yes
 */
router.get('/ac', function(req, res, next) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  var q = url.parse(req.url, true).query;
  var suggestions = getAutocomplete(q.ac, q.sw);
  res.json(
   suggestions
  );
  res.end();
});


module.exports = router;
