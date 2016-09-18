var config = require('../../helpers/config');

describe('Config testing', function () {

  before(function () {
    process.env.indexName = 'votes2';
    process.env.esHost = 'strongHost:9200';
  });

  it('ES host name', function () {
    config.setEsHost(function () {
      expect(config.getEsHost()).equal('strongHost:9200');
    });
  });

  it('index name', function () {
    config.setIndexName(function () {
      expect(config.getIndexName()).equal('votes2');
    });
  });

  after(function () {
    delete process.env.indexName;
  })

});