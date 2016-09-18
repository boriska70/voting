'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger('votes.js');

var express = require('express');
var router = express.Router();

var config = require('../helpers/config');

var esClient = require('../controllers/elasticsearch-controller');

/* GET votes listing. */
router.get('/list', function (req, res) {
  esClient.showVotesSummary().then(function (buckets) {

    res.render('results', {title: 'Voting results', data: buckets});


  }, function (error) {
    res.send(error.message);
  });
});

router.get('/', function (req, res) {
  res.render('vote', {title: 'Vote now!', choice1: config.getChoice(true, false), choice2: config.getChoice(false, false)});
});

router.get('/vote/:choice', function (req, res) {
  logger.trace(req.params.choice + ' from ' + req.ip);
  esClient.indexVote(req.params.choice, req.ip).then(function () {
    setTimeout(function () {
      res.redirect('/votes/list');
    }, 300);
  }, function (error) {
    res.render('error', {
      message: 'System failure happened, please vote again',
      error: error
    });
  });
});


module.exports = router;
