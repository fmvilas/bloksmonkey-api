# API Docs

## REST API

### Summary

* [Root Endpoint](#root-endpoint)
* [Headers](#headers)
* [Users](#users)
    * [Getting a single user](#getting-a-single-user)
    * [Updating a user](#updating-a-user)
* [Projects](#projects)
    * [Getting a single project](#getting-a-single-project)
    * [List projects](#list-projects)
    * [List all public projects](#list-all-public-projects)
    * [Create a project](#create-a-project)
    * [Update a proejct](#update-a-project)
    * [Delete a project](#delete-a-project)
* [Files](#files)
    * [Getting a file](#getting-a-file)
    * [Create a file](#create-a-file)
    * [Update a file](#update-a-file)
    * [Delete a file](#delete-a-file)
    * [List files in a project](#list-files-in-a-project)
* [OAuth2 API](#oauth2-api)
    * [Steps to authorize your application](#steps-to-authorize-your-application)
    * [Scopes](#scopes)

### Root Endpoint

All request should be made to ```http://bloksmonkey.com/api/v1```.

### Headers

Unless otherwise specified, these are the header fields and values that every response should have:

```
Status: 200 OK
Content-Encoding: gzip
Content-Length: 274
Content-Type: application/json; charset=utf-8
Date: Sun, 26 Oct 2014 16:47:28 GMT
ETag: "737060cd8c284d8af7ad3082f209582d"
```

Accepted request headers are:

```
If-Match: "737060cd8c284d8af7ad3082f209582d"
If-None-Match: "737060cd8c284d8af7ad3082f209582d"
```

The rest will be ignored.

### Users

#### Getting a single user

```
GET /users/:id
```

###### OAuth scope requirements

You'll need authorization for ```user_info``` or ```user``` scope.

###### Example

```
GET /users/1
```

###### Response

```js
// Status: 200 OK

{
    "id": 1,
    "email": "user@email.com",
    "name": "Jon",
    "avatar_url": "http://www.gravatar.com/avatar/f3bad9b06a1b0512c5c837f28dddd985.png",
    "created_at": "2014-10-24T20:39:12Z",
    "updated_at": "2014-10-25T21:09:02Z"
}
```

#### Updating a user

```
PATCH /users/:id
```

###### Parameters

|Name           |Type       |Description
|---------------|-----------|-------------------------------
|name           |string     |The new name of the user
|avatar_url     |string     |The new avatar URL

###### OAuth scope requirements

You'll need authorization for ```user``` scope.

###### Example

```
PATCH /users/1

{
    "name": "Jon Nieve",
    "avatar_url": "http://www.gravatar.com/avatar/jon-nieve.png",
}
```

###### Response

```js
// Status: 200 OK

{
  "id": 1,
  "email": "user@email.com",
  "name": "Jon Nieve",
  "avatar_url": "http://www.gravatar.com/avatar/jon-nieve.png",
  "created_at": "2014-10-24T20:39:12Z",
  "updated_at": "2014-10-25T21:09:02Z"
}
```


---


### Projects

#### Getting a single project

```
GET /projects/:id
```

###### OAuth scope requirements

You'll need authorization for ```project_read``` or ```project``` scope if you want to retrieve a private project.

###### Response

```js
// Status: 200 OK

{
    "id": 92348237,
    "name": "My awesome project",
    "description": "My not-so-awesome description.",
    "visibility": "public",
    "owner_id": 1,
    "created_at": "2014-10-24T20:39:12Z",
    "updated_at": "2014-10-25T21:09:02Z"
}
```

#### List projects

Provides an array of projects optionally filtered by user, role and visibility.

```
GET /projects
```

###### Parameters

|Name           |Type       |Description
|---------------|-----------|-----------------------------------------------|
|user_role      |string     |Role of the user in the project. Can be "any", "owner" or "member". Default: "any".
|visibility     |string     |Visibility of the project. Can be "any", "public" or "private". Default: "any".

###### OAuth scope requirements

You'll need authorization for ```project_read``` or ```project``` scope if you want to retrieve user projects.

###### Response

```js
// Status: 200 OK

[{
    "id": 92348237,
    "name": "My awesome project",
    "description": "My not-so-awesome description.",
    "visibility": "public",
    "owner_id": 1,
    "created_at": "2014-10-24T20:39:12Z",
    "updated_at": "2014-10-25T21:09:02Z"
},
{
    "id": 92348238,
    "name": "Another awesome project",
    "description": "Another not-so-awesome description.",
    "visibility": "private",
    "owner_id": 1,
    "created_at": "2014-11-27T20:39:12Z",
    "updated_at": "2014-11-27T21:09:02Z"
}]
```

#### Create a project

```
POST /projects
```

###### Parameters

|Name           |Type       |Description
|---------------|-----------|-----------------------------------------------
|name           |string     |Required. The name of the project.
|description    |string     |A short description of the project.
|visibility     |string     |Can be "public" or "private". Default: "public".

###### OAuth scope requirements

You'll need authorization for:

* ```project``` scope to create a project.

###### Response

```js
// Status: 201 OK

{
    "id": 92348240,
    "name": "My new project",
    "description": "My new project needs an awesome description.",
    "visibility": "public",
    "owner_id": 1,
    "created_at": "2014-12-24T20:39:12Z",
    "updated_at": "2014-12-24T20:39:12Z"
}
```

#### Update a project

```
PATCH /projects/:id
```

###### OAuth scope requirements

You'll need authorization for:

* ```project``` scope to update a project.

###### Example

```
PATCH /projects/92348240

{
    "description": "Winter is coming."
}
```

###### Response

```js
// Status: 200 OK

{
    "id": 92348240,
    "name": "My new project",
    "description": "Winter is coming.",
    "visibility": "public",
    "owner_id": 1,
    "created_at": "2014-12-24T20:39:12Z",
    "updated_at": "2014-12-24T20:41:12Z"
}
```

#### Delete a project

```
DELETE /projects/:id
```

###### OAuth scope requirements

You'll need authorization for:

* ```project``` scope to delete a project.

###### Example

```
DELETE /projects/92348240
```

###### Response

```js
// Status: 200 OK

{
    "status": 200,
    "message": "Project deleted succesfully"
}
```


---


### Files

#### Getting a file

```
GET /projects/:id/files/:filename
GET /projects/:id/files/:filename/content
```

###### Parameters

Name            |Type       |Description
----------------|-----------|-----------
path            |string     |Path to the file. Default: /.


###### OAuth requirements

You'll need authorization for:

* ```project_files_read``` or ```project_files``` scope to get a file which belongs to a private project.


###### Example

```
GET /projects/:id/files/index.html
```

###### Response

```javascript
// Status: 200 OK

{
    "name": "index.html",
    "path": "/",
    "full_path": "/index.html",
    "encoding": "utf-8",
    "project_id": 92348240,
    "user_id": 1,
    "size": 98,
    "type": "file",
    "mime": "text/html",
    "created_at": "2014-12-24T20:39:12Z",
    "updated_at": "2014-12-24T20:39:12Z"
}
```

###### Example: Getting the raw content of a file

```
GET /projects/:id/files/index.html/content
```

###### Response

```html
Status: 200 OK
Content-Type: text/plain; charset=utf-8

<html>
    <head>
        <title>Winterfell</title>
    </head>
    <body>
        Winter is comming...
    </body>
</html>
```

#### Create a file

```
POST /projects/:id/files
POST /projects/:id/files/:filename/content
```

###### Parameters

Name            |Type       |Description
----------------|-----------|-----------
path            |string     |Path to the file. Default: /.


###### OAuth requirements

When creating a file, you'll need authorization for:

* ```project_files``` scope to delete a file which belongs to a project.


###### Example

```
POST /projects/:id/files

{
    "name": "index.html",
    "type": "file"
}
```

###### Response

```javascript
// Status: 201 OK

{
    "name": "index.html",
    "path": "/",
    "full_path": "/index.html",
    "encoding": "utf-8",
    "project_id": 92348240,
    "user_id": 1,
    "size": 0,
    "type": "file",
    "mime": "text/html",
    "created_at": "2014-12-24T20:39:12Z",
    "updated_at": "2014-12-24T20:39:12Z"
}
```

###### Example: Creating a file in /js directory and with initial content

```
POST /projects/:id/files/main.js/content?path=/js&type=file

content of the file here...
```

###### Response

```javascript
// Status: 201 OK

{
    "name": "main.js",
    "path": "/js/",
    "full_path": "/js/main.js",
    "encoding": "utf-8",
    "project_id": 92348240,
    "user_id": 1,
    "size": 1228,
    "type": "file",
    "mime": "application/javascript",
    "created_at": "2014-12-24T20:39:12Z",
    "updated_at": "2014-12-24T20:39:12Z"
}
```

#### Update a file

```
PATCH /projects/:id/files/:filename
PUT /projects/:id/files/:filename/content
```

###### Parameters

Name            |Type       |Description
----------------|-----------|-----------
path            |string     |Path to the file. Default: /.


###### OAuth requirements

When updating a file, you'll need authorization for:

* ```project_files``` scope to update a file which belongs to a project.

###### Example

```
PUT /projects/:id/files/index.html/content

new content of the file here...
```

###### Response

```javascript
// Status: 200 OK

{
    "name": "index.html",
    "path": "/",
    "full_path": "/index.html",
    "encoding": "utf-8",
    "project_id": 92348240,
    "user_id": 1,
    "size": 986,
    "type": "file",
    "mime": "text/html",
    "created_at": "2014-12-24T20:39:12Z",
    "updated_at": "2014-12-29T19:06:54Z"
}
```

###### Example: Updating file information

```
PATCH /projects/:id/files/index.html

{
    "name": "index.php",
    "path": "/my_website/"
}
```

###### Response

```javascript
// Status: 200 OK

{
    "name": "php",
    "path": "/my_website/",
    "full_path": "/my_website/index.php",
    "encoding": "utf-8",
    "project_id": 92348240,
    "user_id": 1,
    "size": 986,
    "type": "file",
    "mime": "text/html",
    "created_at": "2014-12-24T20:39:12Z",
    "updated_at": "2014-12-29T19:06:54Z"
}
```

#### Delete a file

```
DELETE /projects/:id/files/:filename
```

###### Parameters

Name            |Type       |Description
----------------|-----------|-----------
path            |string     |Path to the file. Default: /.


###### OAuth requirements

When deleting a file, you'll need authorization for:

* ```project_files``` scope to delete a file which belongs to a project.


###### Example

```
DELETE /projects/:id/files/index.html
```

###### Response

```js
// Status: 200 OK

{
    "status": 200,
    "message": "File deleted succesfully"
}
```

#### List files in a project

```
GET /projects/:id/files
```

###### Parameters

Name            |Type       |Description
----------------|-----------|-----------
path            |string     |Path to inspect. Default: /.
recursive       |boolean    |Whether to list directories recursively or not. Default: *false*.
hidden          |boolean    |Whether to show hidden files or not. Default: *false*.
fields          |list       |A comma-separated list of fields you want to include in the response. Default: *name, path, type*.

###### OAuth requirements

You will need authorization for:

* ```project_files_read``` or ```project_files``` scope to list files in a private project.


###### Example

```
GET /projects/:id/files
```

###### Response

```javascript
// Status: 200 OK

{
    "files": [{
                "name": "index.html",
                "path": "/",
                "type": "file"
            },
            {
                "name": "images",
                "path": "/",
                "type": "dir"
            },
            {
                "name": "js",
                "path": "/",
                "type": "dir"
            }]
}
```

###### Example

```
GET /projects/:id/files?hidden=true&fields=name,path,type,size,created_at,updated_at
```

###### Response

```javascript
// Status: 200 OK

{
    "files": [{
                "name": "index.html",
                "path": "/",
                "type": "file",
                "size": 986,
                "created_at": "2014-12-24T20:39:12Z",
                "updated_at": "2014-12-29T19:06:54Z"
            },
            {
                "name": ".git",
                "path": "/",
                "type": "dir",
                "size": 0,
                "created_at": "2014-12-24T20:39:12Z",
                "updated_at": "2014-12-24T20:39:12Z"
            },
            {
                "name": "images",
                "path": "/",
                "type": "dir",
                "size": 0,
                "created_at": "2014-12-24T20:39:12Z",
                "updated_at": "2014-12-24T20:39:12Z"
            },
            {
                "name": "js",
                "path": "/",
                "type": "dir",
                "size": 0,
                "created_at": "2014-12-24T20:39:12Z",
                "updated_at": "2014-12-24T20:39:12Z"
            }]
}
```

---

### OAuth2 API

#### Steps to authorize your application

This is the description of the OAuth2 flow for 3rd party web applications.

##### 1. Redirect users to authorize your application

```
GET http://bloksmonkey.com/api/v1/oauth2/authorize
```

###### Parameters

Name            |Type   |Description
--------------- |------ |------------
client_id       |string |**Required**. The client ID you received from BloksMonkey when registered your app.
redirect_uri    |string |The URL in your app where users will be sent after authorization.
scope           |string |A comma separated list of scopes.
state           |string |An unguessable random string. It is used to protect against cross-site request forgery attacks.

##### 2. BloksMonkey redirects back to your site

If the user accepts your request, BloksMonkey redirects back to your site with a temporary ```code``` parameter as well as the ```state``` you provided in the previous step in a state parameter. If the states don’t match, the request has been created by a third party and the process should be aborted.

Exchange the ```code``` for a token:

```
POST http://bloksmonkey.com/api/v1/oauth2/access_token
```

###### Parameters

Name            |Type   |Description
--------------- |------ |------------
client_id       |string |**Required**. The client ID you received from BloksMonkey when registered your app.
client_secret   |string |**Required**. The client secret you received from BloksMonkey when registered your app.
code            |string |**Required**. The code you received as a response to the previous step.
redirect_uri    |string |The URL in your app where users will be sent after authorization.

###### Response

By default, the response will take the following form:

```js
{
    "access_token": "e72e16c7e42f292c6912e7710c838347ae178b4a",
    "scope": "user,project",
    "token_type": "bearer"
}
```

##### 3. Use the access token to access the API

The access token allows you to make requests to the API on behalf of a user.

```
GET http://bloksmonkey.com/api/v1/users/1?access_token=e72e16c7e42f292c6912e7710c838347ae178b4a
```

#### Scopes

Name            |Description
--------------- |------------
user            |Grants read/write access to **profile info only**. Note that ```email``` can't be modified.
project         |Grants read/write access for public and private projects. It includes authorization to read/write files in a project.
delete_project  |Grants access to delete projects.


## Client API

### (Place documentation here)
