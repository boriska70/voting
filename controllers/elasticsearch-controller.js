'use strict';

var log4js = require('log4js');
var logger = log4js.getLogger('elasticsearch-controller.js');

var config = require('../helpers/config');

var elasticsearch = require('elasticsearch');
var Q = require('q');

var client = null;
// Limit logging message to the 1st success for periodical run of connection check
var connectionLogged = false;
// Keep a final state of connection (ready/not  ready) including index readiness
var esReady = false;

function setParameters() {
  config.setEsHost(function () {
    config.setIndexName(function () {
      logger.debug('ES parameters set');
    })
  })
}

// prepare client configuration and start client init
function esConnectionWatcher() {
      setInterval(initClient, 5000);
}

// Connect to ES and create index, if not existing
function initClient() {
  return Q.Promise(function (resolve, reject) {
      if (!client) {
        client = new elasticsearch.Client({
          host: config.getEsHost(),
          log: 'info'
        });
      }
      if (!client) {
        connectionLogged = false;
        esReady = false;
        reject('Failed to create Elasticsearch client');
      } else {
        client.ping({
            requestTimeout: 5000
          }, function (error) {
            if (error) {
              logger.error('Elastic is dead:' + error.message);
              client = null;
              connectionLogged = false;
              esReady = false;
              reject(new Error(error.message));
            } else {
              if (!connectionLogged) {
                logger.info('Elasticsearch connection is OK');
                connectionLogged = true;
              }
              indexExists(config.getIndexName()).then(function (resp) {
                if (resp) {
                  logger.trace('ES connection is OK and index is ready');
                  esReady = true;
                  resolve();
                } else {
                  logger.info('Creating index ' + config.getIndexName());
                  indexCreate(config.getIndexName()).then(function (status) {
                    logger.trace('Index creation has completed with status ' + status)
                    esReady = true;
                    resolve();
                  }, function (err) {
                    logger.error('Cannot create index: ' + err.message ? err.message : error);
                    esReady = false;
                    reject();
                  })
                }
              }, function (resp) {
                logger.error('Failed to check index existence, response code: ' + resp);
                esReady = false;
                reject();
              });
            }
          }
        )
      }
    }
  )
}

function isEsReady() {
  return esReady;
}

function indexVote(selection, ip) {
  return Q.fcall(function (resolve, reject) {
    client.index({
      index: config.getIndexName(),
      type: 'voteResults',
      refresh: true,
      body: {
        voteTime: new Date().toISOString(),
        voteResult: selection,
        voterIP: ip
      }
    }).then(function () {
      resolve();
    }, function (error) {
      logger.error(error.message);
      reject(error.message);
    })
  })
}

function showVotesSummary() {
  return Q.Promise(function (resolve, reject) {
    client.search({
      index: config.getIndexName(),
      searchType: 'count',
      size: 2,
      body: {
        'aggs': {
          'voteResult': {
            'terms': {
              'field': 'voteResult',
              'include': [config.getChoice(true, false), config.getChoice(false, false)],
              'size': 2,
              'order': {'_count': 'desc'}
            }
          }
        }
      }
    }).then(function (data) {
      if (data.aggregations.voteResult.buckets) {
        if (data.aggregations.voteResult.buckets && data.aggregations.voteResult.buckets instanceof Array) {
          resolve(data.aggregations.voteResult.buckets);
        } else {
          resolve('[]');
        }
      }
    }, function (err) {
      logger.error('error:' + err.message);
      reject(err.message);
    })
  });
}

function indexExists(indName) {
  return client.indices.exists({
    index: indName
  })
}

function indexCreate(indName) {
  return client.indices.create({
    index: indName,
    body: {
      mappings: {
        voteResults: {
          properties: {
            voteResult: {'type': 'string', 'index': 'not_analyzed'},
            voteTime: {'type': 'date'},
            voterIP: {'type': 'string', 'index': 'not_analyzed'}
          }
        }
      }
    }
  })
}

exports.watchES = esConnectionWatcher;
exports.indexVote = indexVote;
exports.showVotesSummary = showVotesSummary;
exports.setESParams = setParameters;
exports.isEsReady = isEsReady;
