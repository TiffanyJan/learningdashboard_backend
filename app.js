const dbService = require('./dbservice');
const express = require('express');
const app = express();
const cors = require('cors');

app.use(express.json());
app.use(cors());

app.get('/', function(req,res){
    res.json({message:"hello"})
})

app.get('/resources', function (request, response) {
    dbService.getResources()
    .then(function(results){
      response.json(results);
    })
    .catch(function(error){
      //something went wrong
      response.status(500);
      response.json(error);
    });
  })


  app.post('/resources', function (request, response) {
    const title = request.body.title;
    const url = request.body.url;
    const description = request.body.description;
    const userName = request.body.userName;
    const dateAdded = request.body.dateAdded;
    const resourceId = request.body.resourceId;
    const resourceTags = request.body.resourceTags;

  
    dbService.addResource(title, url, description, userName, dateAdded)
    .then(function(results){
      response.json(results);
    })
    .then(dbService.applyTags(resourceId, resourceTags))
    .then(function(results){
        response.json(results);
      })
    .catch(function(error){
      response.status(500);
      response.json(error);
    });
  })
  
  app.post('/resources/:resourceId', function (request, response) {
    const resourceId = request.params.resourceId;
    const resourceTags = request.body.resourceTags;

    dbService.applyTags(resourceId, resourceTags)
    .then(function(results){
        response.json(results);
      })
    .catch(function(error){
      response.status(500);
      response.json(error);
    });
  })

  module.exports = app;