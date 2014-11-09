# REST API for Didgeridoo IDE

## Description
This repo is for developing the REST API. You must think to this API as the center of all common operations in Didgeridoo.

It will provide endpoints to manage user information, projects and files. All of these behind an OAuth2 protocol to maintain user information secure at the same time we provide 3rd party developers to create better plugins for the IDE.

> **IMPORTANT:** This API should not provide endpoints for creating or deleting users, though you may see some of these endpoints available during development just for testing purposes.

## Read (and improve) the docs

There is a [docs branch](https://github.com/fmvilas/didgeridoo-api/tree/docs) in this repo where you can read further information of this API. Also feel free to open issues, create branches, create pull requests. Whatever you think it can improve this API, docs, development process, WHATEVER.

## How to contribute

Follow this workflow: http://nvie.com/posts/a-successful-git-branching-model/.

I highly recommend you to read how it works. **Even if you think you know, read it again.**

##Installing
Please, have a look at the [guide placed in the **docs** branch](https://github.com/fmvilas/didgeridoo/tree/docs).

## License

(The MIT License)

Copyright (c) 2014 Francisco Méndez <fmvilas@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the 'Software'), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
