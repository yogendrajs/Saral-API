const express = require('express');
const app = express();
const fs = require('fs');

app.use(express.json());

// to get data and parse it for further use
var data = fs.readFileSync(__dirname + '/output.json');
var obj = JSON.parse(data);

// List of all users
app.get('/courses', (req, res) => {
    var data = fs.readFileSync(__dirname + '/output.json');
    res.end(data);
});

// create new course
app.post('/courses', (req, res) => {
    if (!req.body.name || !req.body.description){
        return 'check your json file'
    }
    // console.log(obj);
    var id = obj[obj.length-1]['id'];
    var object = {
        'name': req.body.name,
        'description': req.body.description,
        'id': parseInt(id)+1
    };
    obj.push(object);
    console.log(obj);
    var json = JSON.stringify(obj);
    res.end(json);

    fs.writeFileSync('output.json', json);
});

// get course details by id
app.get('/courses/:id', (req, res) => {
    var courseId = req.params.id;

    var getCourseId = obj[courseId-1];
    // console.log(obj[obj.length-1]);
    if (courseId > obj[obj.length-1]['id']){
        return res.send('aapne galat id daali hai');
    }
    return res.json(getCourseId);
});

// edit a course by id
app.put('/courses/:id', (req, res) => {
    var courseId = req.params.id;
    var getCourseId = obj[courseId-1];
    getCourseId['name'] = req.body.name;
    getCourseId['description'] = req.body.description;

    if (req.body.name){
        if (req.body.description){
            obj.splice(courseId-1, 1, getCourseId);
        }else {
            res.end('please enter description!')
        }
    }else {
        res.end('please enter name and description! ;)')
    }
    fs.writeFileSync('output.json', JSON.stringify(obj));
        return res.json(getCourseId);
});

// get exercises of a course
var fileData = JSON.parse(fs.readFileSync('exercises.json'));
app.get('/courses/:id/exercises', (req, res) => {
    var courseLink = req.params.id;
    if (courseLink > 6){
        return res.json({
            "errorMsg": "Aapki courseId ya exerciseId mein kuch galat hai."
        });
    }
    res.json(fileData[courseLink]);
})

// create exercise of course
app.post('/courses/:id/exercises', (req, res) => {
    var courseLink = req.params.id;
    if (courseLink > 6){
        return res.json({
            "errorMsg": "Aapki courseId ya exerciseId mein kuch galat hai."
        });
    }
    var swap = 0;
    for (var property in fileData) {
        var allData = fileData[property];
        for (var i = 0; i < allData.length; i++){
            ids = allData[i]['id'];
            if (ids > swap){
                swap = ids;
            }
        }
    } //console.log(swap);
    var indexEx = swap;
    var objEx = {
        "name": req.body.name,
        "content": req.body.content,
        "hint": req.body.hint,
        "courseId": courseLink,
        "id": indexEx+1
    };
    fileData[courseLink].push(objEx);
    var revParse = JSON.stringify(fileData, null, 2);
    fs.writeFileSync('exercises.json', revParse);
    res.end(JSON.stringify(objEx));
});

// get exercise by Id
app.get("/courses/:id/exercises/:is", (req,res) => {
    var courseLink = req.params.id;
    var exerciseLink = req.params.is;
    var count = 0;
    if (courseLink > 6){
        return res.json({
            "errorMsg": "Aapki courseId ya exerciseId mein kuch galat hai."
        });
    }
    var paricularEx = fileData[courseLink];
    for (var i = 0; i < paricularEx.length; i++){
        if (paricularEx[i]['id'] == exerciseLink){
            count++;
            res.json(paricularEx[i]);
        }
    }if (count == 0){res.json({errorMsg: "this exercise id doesn't exist"})}

});

// edit exercise by id
app.put('/courses/:id/exercises/:is', (req, res) => {
    var courseLink = req.params.id;
    var exerciseLink = req.params.is;
    var count = 0;
    if (courseLink > 6){
        return res.json({
            "errorMsg": "Aapki courseId ya exerciseId mein kuch galat hai."
        });
    }var particularEx = fileData[courseLink];
    for (var i = 0; i < particularEx.length; i++){
        if (particularEx[i]['id'] == exerciseLink){
            count++;
            var putData = particularEx[i];
            putData.name = req.body.name;
            putData.content = req.body.content;
            putData.hint = req.body.hint;

            console.log(particularEx);
            // var accessKey = putData[Object.keys(putData)[2]];
            // console.log(accessKey);
            fs.writeFileSync('exercises.json', JSON.stringify(fileData[courseLink]));
            res.json(putData);
        }
    }if (count == 0){res.json({errorMsg: "this exercise id doesn't exist"})};
});

// get submissions of an exercise
app.get('/courses/:id/exercises/:is/submissions', (req, res) => {
    var courseLink = parseInt(req.params.id);
    var exerciseLink = parseInt(req.params.is);
    var getFx = fs.readFileSync('submissions.json');
    var parse = JSON.parse(getFx);
    var count = 0;
    var showingArr = [];
    for (var i = 0; i < parse.length; i++){
        if (courseLink == parse[i]['courseId'] &&  parse[i]['exerciseId'] == exerciseLink){
            count++;
            showingArr.push(parse[i]);
        }
    }if (count == 0){
        return res.json({errorMsg: "Check your courseId or exerciseId. Kuch galat diya hai aapne."});
    }else {
        console.log(showingArr);
        return res.json(showingArr);
    }
});

//create admissions of an exercise
app.post('/courses/:id/exercises/:is/submissions', (req, res) => {
    var courseLink = req.params.id;
    var exerciseLink = req.params.is;

    var getFx = fs.readFileSync('submissions.json');
    var parse = JSON.parse(getFx);

    var indexEx = parse.length+1;
    var postObj = {
        "id": indexEx,
        "courseId": courseLink,
        "exerciseId": exerciseLink,
        "content": req.body.content,
        "userName": req.body.userName
    };
    parse.push(postObj);
    fs.writeFileSync('submissions.json', JSON.stringify(parse, null, 2));
    res.json(postObj);

});

var server = app.listen(8080, () => {
    const port = server.address().port;
    console.log(`the port is listening at ${port}`);
});