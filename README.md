[![Build Status](https://secure.travis-ci.org/agrimaldi/j.nome.s.png)](http://travis-ci.org/agrimaldi/j.nome.s)

# Introduction

### What is j.nome.s

j.nome.s is a fast, simple, lightweight genome browser.
It is built on top of [expressjs][expressjs] and [Node.JS][nodejs],
and uses [MongoDB][mongodb] for storing the data.

### Why j.nome.s

Current genome browsers include [GBrowse][gbrowse], the [UCSC genome browser][ucsc_browser]
or [Jbrowse][jbrowse]. The main problem with those project, is that they
heavily rely on [perl][perl] and [BioPerl][bioperl] scripts in order to both crunch data
and render the output.
Although [perl][perl] is widely used by bioinformaticians, it is a very inelegant
language, very often leading to bloatware.
Representing genomes is not an easy task considering the huge amout of data
that has to be handled and shown in an intelligible way.

j.nome.s aims to provide a simple genome browser environment, convenient to
both the user, and the developer.
It is based on [Node.JS][nodejs], which allowed to build a custom non
IO-blocking server application. The data is stored in a 
[MongoDB][mongodb] database, providing a scallable and
efficient way to respectively store and access huge amount of data.

### Who

j.nome.s is an ongoing project initiated by Alexis GRIMALDI and supervised by Avetis KAZARIAN.

---

# Installation

### <a id="Pre_requisites"></a>Pre-requisites

Before installation, please ensure that you installed [Node.JS][nodejs] and [MongoDB][mongodb].
Check their web pages for more information.

In order to get the node module dependencies required to run j.nome.s, you will also
need [NPM][npm], the node package manager.
Please follow the instructions provided on the [NPM website][npm] to install npm alongside node. Starting from nodejs 0.8, npm should be included.

### Setting up the j.nome.s server

Clone the repository from github, and install the module dependencies.
```bash
$ git clone git://github.com/agrimaldi/j.nome.s.git
$ cd j.nome.s
$ npm install
```
Finally, you should create a local branch specifically for your personal datasets
```bash
$ git branch my-dataset
$ git checkout my-dataset
```

### Updating

To update j.nome.s to the latest version, pull from the repository
```bash
$ git checkout master
$ git pull origin master
```
If your configuration files are on a separate branch (which you should do), rebase with
```bash
$ git checkout my-branch
$ git rebase master
```

### Running tests

To run the tests, just go with
```bash
$ make test
```
This will setup a demo dataset (of Saccharomyces cerevisiae), run various tests, and remove the demo dataset.
If you wish to keep the demo dataset around, just run
```bash
$ make install-demo
```
To remove it, run
```bash
$ make remove-demo
```

### Running the server

To run the j.nome.s server, simply execute
```bash
$ node app.js
```
from the root directory j.nome.s

Alternatively, if you wish a more robust running instance, we suggest to use [forever](forever).
To install it system wide, simple run the following :
```bash
$ npm install -g forever
```
Running the j.nome.s server in daemon mode through [forever](forever) is as simple as
```bash
$ forever start app.js
```

Either way, once the j.nome.s server is up and running, point your browser to the machine running it on port 3000.
If j.nome.s is accessed on the same machine as the server, point your browser to `http://localhost:3000/`
If you want to remotely access j.nome.s, point your browser to `http://www.myjnomesserver.com:3000/`


[npm]: http://npmjs.org/
[forever]: https://github.com/nodejitsu/forever/
[gbrowse]: http://www.gbrowse.org/index.html
[ucsc_browser]: http://genome.ucsc.edu/
[jbrowse]: http://jbrowse.org/
[perl]: http://www.perl.org/
[bioperl]: http://www.bioperl.org/
[expressjs]: http://expressjs.com/
[nodejs]: http://nodejs.org/
[mongodb]: http://www.mongodb.org/
[mongolian]: https://github.com/marcello3d/node-mongolian