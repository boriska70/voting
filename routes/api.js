'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger('api.js');

var express = require('express');
var router = express.Router();

var config = require('../helpers/config');

var esClient = require('../controllers/elasticsearch-controller');

/* Get current voting results */
router.get('/votes', function (req, res) {
  logger.trace('Going to return votes');
  esClient.showVotesSummary().then(function (buckets) {
    res.json(buckets);
  }, function (error) {
    res.send(error.message ? error.message : error);
  });
});

//Get configuration set via environment
router.get('/config', function (req, res) {
  logger.trace('Going to return configuration');
  res.json(config.getAll());
});


module.exports = router;
