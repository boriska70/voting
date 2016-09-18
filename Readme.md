#Voting application
to be used as AUT

Environment variables:
- esHost (default: localhost:9200)
- indexName (default: votes)
- choice1 (1st choice for voting, default: none)
- choice2 (2nd choice for voting, default: none)
- LOG_LEVEL (log level, default: debug)

UI:  
/votes - display voting screen  
/votes/:selection - vote  
/votes/list - see current results  

Rest API:  
/votesapi/config - display current configuration built based on the environment variables  
/votesapi/votes - see current results

Notes:
- Index is created on startup, if does not exist

Testing:
- Run all tests: npm test  
- Unit tests: npm run test:unit  
- E2E tests  
  - Environment variable required: autHost pointing to voting app (for example, localhost:3000)  
  - Run tests and get the results in test_results/xunit.xml: npm run test:e2e  
  - Run tests and see the results in stdout: npm run test:e2estdout  


Dockerization:  
- Build
  - docker build -f Dockerfile -t gaiadocker/voting .
  - docker build -f Dockerfile.e2e -t gaiadocker/voting-e2e .
- Run
  - docker run -d --name es -p 9200:9200 -p 9300:9300 elasticsearch:2.3.4 elasticsearch -Des.network.host=0.0.0.0 -Des.network.bind_host=0.0.0.0 -Des.cluster.name=voting-es-cluster -Des.node.name=$(hostname)
  - docker run -d --name voting-aut -p 3000:3000 -e esHost=172.17.0.1:9200 -e indexName=voting -e choice1="Big Cat" -e choice2="Small Dog"  gaiadocker/voting
  - docker run -d --name voting-e2e -e autHost=172.17.0.1:3000 gaiadocker/voting-e2e
- NOTES:
  - gaiadocker/voting-e2e keeps test results in /src/test_results/xunit.xml file
