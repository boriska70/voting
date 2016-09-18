var request = require('request');

describe('UI testing', function () {

  var autHost=process.env.autHost; //'+autHost+'
  var indexName, choice1, choice2, choice1Counter=0, choice2Counter=0;

  before(function (done) {
    var options = {
      url: 'http://'+autHost+'/votesapi/config',
      method: 'GET',
      json: true
    };
    request(options, function (error, resp, body) {
      expect(resp.statusCode).equal(200);
      indexName = body.indexName;
      choice1 = body.choice1;
      choice2 = body.choice2;
      console.log('Choice 1: ' + choice1 + ', choice 2: ' + choice2);
      console.log('Index name: ' + indexName);
      done();
    })
  });

  before(function (done) {
    var options = {
      url: 'http://'+autHost+'/votesapi/votes',
      method: 'GET',
      json: true
    };
    request(options, function (error, resp, body) {
      expect(resp.statusCode).equal(200);
      for (var i in body) {
        if (body[i].key === choice1) {
          choice1Counter = body[i].doc_count;
        } else {
          choice2Counter = body[i].doc_count;
        }
      }
      console.log('Choice 1 counter: ' + choice1Counter + ', choice 2 counter: ' + choice2Counter);
      done();
    })
  });

  after(function (done) {

    var options = {
      url: 'http://'+autHost+'/votesapi/votes',
      method: 'GET',
      json: true
    };
    request(options, function (error, resp, body) {
      expect(resp.statusCode).equal(200);
      for (var i in body) {
        if (body[i].key === choice1) {
          //vote test voted for choice1 - it should be higher than in the beginning
          expect(body[i].doc_count > choice1Counter).true;
        }
      }
      done();
    })
  });


  it('open ui', function (done) {
    var options = {
      url: 'http://'+autHost+'/votes',
      method: 'GET',
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    };
    request(options, function (error, resp, body) {
      expect(resp.statusCode).equal(200);
      expect(body.indexOf('You decide! Vote...') > 0).true;
      done();
    })
  });

  it('vote', function (done) {

    var options = {
      url: 'http://'+autHost+'/votes/vote/' + choice1,
      method: 'GET',
      followAllRedirects: true,
      headers: {
        'Content-Type': 'text/html; charset=utf-8'
      }
    };
    request(options, function (error, resp, body) {
      expect(resp.statusCode).equal(200);
      expect(body.indexOf('VOTING RESULTS') > 0).true;
      done();
    })
  });

});
