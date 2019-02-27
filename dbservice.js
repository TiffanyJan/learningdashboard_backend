const mysql = require("mysql");

const dummyTagList = [
    "JavaScript",
    "Conditionals",
    "Axios",
    "HTML",
    "AWS",
    "Arrays",
    "React",
    "Bootstrap",
    "mySQL",
    "Tutorials",
    "Loops",
    "JS_Express",
    "CSS",
    "Testing_TDD",
    "Professional_Development"
  ]
  

function getDatabaseConnection() {
    return mysql.createConnection({
        host: process.env.RDS_HOST,
        user: process.env.RDS_USER,
        password: process.env.RDS_PASSWORD,
        database: process.env.RDS_DATABASE 
    });
};

function sendQuery(query, params) {
    const connection = getDatabaseConnection();
    return new Promise(function(resolve, reject) {
        connection.query(query, params, function(error, results, fields) {
            if (error) {
                connection.destroy();
                return reject(error);
            } 
            else {
                connection.end(function(err){
                    return resolve(results);
                });
                ;
            }
        });
    });
};

function getResources(){
    const query = `SELECT resources.*, GROUP_CONCAT(tags.tagName) AS resourceTags FROM 
                resources LEFT JOIN taggings on resources.resourceId=taggings.resourceId 
                LEFT JOIN tags ON tags.tagId=taggings.tagId 
                GROUP BY resources.resourceId
                ORDER BY resources.dateAdded DESC`
    return sendQuery(query)
    .then(function(results){
        console.log(results)
        //resourceTags field is sent back as comma seperated list ...so pass to array
        let resources = results;
        for(i=0; i<resources.length-1; i++){
            console.log("inside loop" + JSON.stringify(resources[i]))
            //if there are no tags don't try to split them
            if(resources[i].resourceTags != null){
                resources[i].resourceTags = resources[i].resourceTags.split(',')
            } 
        }

        console.log(JSON.stringify(resources))
        return resources
    })
};

function getResourcesTop(){
    const query = `SELECT resources.*, GROUP_CONCAT(tags.tagName) AS resourceTags FROM 
                resources LEFT JOIN taggings on resources.resourceId=taggings.resourceId 
                LEFT JOIN tags ON tags.tagId=taggings.tagId 
                GROUP BY resources.resourceId
                ORDER BY resources.dateAdded DESC
                LIMIT 5`
    return sendQuery(query)
    .then(function(results){
        //resourceTags field is sent back as comma seperated list ...so pass to array
        let resources = results;
        for(i=0; i<resources.length; i++){
            //if there are no tags don't try to split them into an array
            if(resources[i].resourceTags != null){
                resources[i].resourceTags = resources[i].resourceTags.split(',')
            }
        }
        return resources
    })
}

function searchByTags(arrayOfTags){
    console.log(arrayOfTags)
    const query = `SELECT t2.* FROM
                    (SELECT resources.resourceId FROM 
                    resources LEFT JOIN taggings on resources.resourceId=taggings.resourceId 
                    LEFT JOIN tags ON tags.tagId=taggings.tagId 
                    WHERE tags.tagName IN (?)) t1
                    LEFT JOIN
                    (SELECT resources.*, GROUP_CONCAT(tags.tagName) AS resourceTags FROM
                    resources LEFT JOIN taggings on resources.resourceId=taggings.resourceId
                    LEFT JOIN tags ON tags.tagId=taggings.tagId
                    GROUP BY resources.resourceId) t2
                    ON t1.resourceId=t2.resourceId
                    ORDER BY t2.dateAdded DESC`
    const params = arrayOfTags
    return sendQuery(query, [params])
    .then(function(results){
        //resourceTags field is sent back as comma seperated list ...so pass to array
        let resources = results;
        for(i=0; i<resources.length; i++){
            //if there are no tags don't try to split them into an array
            if(resources[i].resourceTags != null){
                resources[i].resourceTags = resources[i].resourceTags.split(',')
            }
        }
        return resources
    })
}


//JADE TO IMPLEMENT 3 steps to storing a resource
function addResource(title, url, description, userName, dateAdded) {
    const data  =  {
    title: title,
    url: url,     
    description: description, 	
    userName: userName,
    dateAdded: dateAdded
    };

    const query = "INSERT INTO learning_resources SET ?"
    const params = data
    return sendQuery(query, params);
}

//JADE TO WRITE
//Delete a resource from taggings table and THEN from resources table....idealliy would do this in a single sql
//procedure but for now if you do it in this order there is no risk that it gets deleted from resources table and then 
//someone picks it up in a search before its deleted from taggings table
function deleteResource(resourceId){

}

module.exports = {
    getResources,
    addResource,
    getResourcesTop,
    searchByTags,
    deleteResource
};