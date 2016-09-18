'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger('elasticsearch-controller.js');

var esHost;
var choices = [];
var indexName = 'votes';

function setEsHost(callback) {
  if (process.env.esHost) {
    esHost = process.env.esHost;
  } else {
    esHost = 'localhost:9200';
  }
  logger.info('Elasticsearch host is set to ' + esHost);
  callback();
}

function getEsHost() {
  return esHost;
}

function setIndexName(callback) {
  if (process.env.indexName) {
    indexName = process.env.indexName;
  }
  logger.info('Index name is set to '+indexName);
  callback();
}

function getIndexName() {
  return indexName;
}

function setChoices(callback) {
  if (process.env.choice1 && process.env.choice1 != undefined) {
    choices[0] = process.env.choice1;
  } else {
    choices[0] = 'none';
  }
  if (process.env.choice2 && process.env.choice2 != undefined) {
    choices[1] = process.env.choice2;
  } else {
    choices[1] = 'none';
  }
  callback();
}

function getChoice(isFirst, toLower) {
  if (toLower) {
    if (isFirst) {
      return choices[0].toLowerCase();
    } else {
      return choices[1].toLowerCase();
    }
  } else {
    if (isFirst) {
      return choices[0];
    } else {
      return choices[1];
    }
  }
}

function getAll() {
  return {
    esHost: esHost,
    indexName: indexName,
    choice1: choices[0],
    choice2: choices[1]
  };
}

exports.setEsHost = setEsHost;
exports.getEsHost = getEsHost;
exports.setChoices = setChoices;
exports.getChoice = getChoice;
exports.getAll = getAll;
exports.setIndexName = setIndexName;
exports.getIndexName = getIndexName;