[![Build Status](https://secure.travis-ci.org/agrimaldi/j.nome.s.png)](http://travis-ci.org/agrimaldi/j.nome.s)

## Introduction

#### What is j.nome.s

j.nome.s is a fast, simple, lightweight genome browser.
It is built on top of [expressjs][expressjs] and [Node.JS][nodejs],
and uses [MongoDB][mongodb] for storing the data.

#### Why j.nome.s

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

#### Who

j.nome.s is an ongoing project initiated by Alexis GRIMALDI and supervised by Avetis KAZARIAN.

---

## Summary

- [Installation](#a1)
    - [Pre-requisites](#a1-1)
    - [Installation](#a1-2)
    - [Updating](#a1-3)
    - [Testing](#a1-4)
    - [Running the j.nome.s server](#a1-5)
- [Loading datasets](#a2)
    - [Reference genome](#a2-1)
    - [Non quantitative data](#a2-2-1)
    - [Quantitative data](#a2-2-2)
- [Configuration](#a3)
 * [Global](#a3-1)
 * [Non-quantitative data tracks](#a3-2-2-1)
 * [Quantitative data tracks](#a3-2-2-2)

---

<a name="a1">
## Installation

<a name="a1-1">
#### Pre-requisites

Before installation, please ensure that you installed [Node.JS][nodejs] and [MongoDB][mongodb].
Check their web pages for more information.

In order to get the node module dependencies required to run j.nome.s, you will also
need [NPM][npm], the node package manager.
Please follow the instructions provided on the [NPM website][npm] to install npm alongside node. Starting from nodejs 0.8, npm should be included.

<a name="a1-2">
#### Setting up the j.nome.s server

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

<a name="a1-3">
#### Updating

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

<a name="a1-4">
#### Running tests

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

<a name="a1-5">
#### Running the server

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

---

<a name="a2">
## Loading datasets

All the data and metadata is stored in a [MongoDB][mongodb] instance, with a precise schema :

1. The name of the database is the ID of the corresponding dataset.
2. Inside the database, the reference genome sequence is stored in a GridFS, resulting in the `fs.files` and `fs.chunks` collections.
3. The data of your tracks must be contained in a collection in JFF format (a JSON equivalent to the [GFF][gff] format), JWIG format (a JSON equivalent of the [bedgraph][bedgraph] format), or in a [bigwig][bigwig] file.

<a name="a2-1">
### Reference genome
To load a new reference genome, use the `loadFastaRef.py` script provided in the `bin/` folder.

```
./loadFastaRef.py -h
usage: loadFastaRef.py [-h] [-i [FILE]] [-d DATABASE] [-D]

Load in MongoDB a FASTA file containing a reference genome.

optional arguments:
-h, --help            show this help message and exit
-i [FILE], --infile [FILE]
                      Input file.
-d DATABASE, --database DATABASE
                      MongoDB database where the data is stored.
-D, --debug           Debug mode.
```
Just specify the name of the mongo database to use for the new dataset and the FASTA file containing the reference genome, and you are good to go.

<a name="a2-2">
### Data

<a name="a2-2-1">
#### Non quantitative data

The JFF format follows the [GFF specifications][gff] with the only required field being `_id`, which must be a unique integer in the collection.
```json
{
    "seqid" : "scaffold_1",
    "source" : "assembly",
    "type" : "gap",
    "start" : 910,
    "end" : 960,
    "score" : null,
    "strand" : null,
    "phase" : null,
    "_id" : 0
}
```
To load non-quantitative data (such as a gene annotation), your raw data must be in JFF format. To convert a gff file into jff, a dedicated script is included in the `bin/` folder:
```bash
$ ./bin/gff2json.py -h
usage: gff2json.py [-h] [-i [FILE]] [-o [FILE]] [-g {2, 3}]

optional arguments:
  -h, --help            show this help message and exit
  -i [FILE], --in [FILE]
                        Input file.
  -o [FILE], --out [FILE]
                        Output file.
  -g {2, 3}, --gff_version {2, 3}
                        GFF version of the file to parse.
```
The script will detect any additional values in the ninth field, and include them nicely in the JSON structure.
Then use the [mongoimport][mongoimport] command to load it in the dataset of your choice.
Typically, it would be something like :
```bash
$ mongoimport -d myDataset -c myTrack --file myTrackData.json
```
Check the [MongoDB documentation][mongodoc] for more details.

<a name="a2-2-2">
#### Quantitative data
Quantitative data are currently rendered as profiles, that is a basic X-Y plot.
      
The raw data should be stored in a tsv or csv file format similar to the [BedGraph format][bedgraph]:
```csv
seqid           start   end     score
scaffold_1      0       26      0
scaffold_1      26      80      1
scaffold_1      80      130     2
scaffold_1      130     157     3
scaffold_1      157     259     4
```
The bedgraph data can be loaded as is in mongodb and queries can be performed directly on in mongodb. Alternativeley, the bedgraph file can be converted to a bigwig file thanks to a dedicated script.

<a name="a2-2-2-1">
##### Direct-mongodb adaptor
To directly load the bedgraph file in mongodb, use the script provided in the `./bin` folder
```bash
$ ./bin/load_bed_profile.py -h
usage: load_bed_profile.py [-h] -i INFILE -d DATABASE -c COLLECTION [-r]

  ||    Script used to easily load bed profiles.
  ||
  ||       The data should be formated as follow:
  ||
  ||           scaffold_1      0       26      0
  ||           scaffold_1      26      80      1
  ||           scaffold_1      80      130     2
  ||           scaffold_1      130     157     3
  ||           scaffold_1      157     259     4
  ||
  ||       where columns correspond to (from left to right): seqid, start, end, score
        
optional arguments:
  -h, --help            show this help message and exit
  -i INFILE, --infile INFILE
                        Input file.
  -d DATABASE, --db DATABASE
                        Database to use.
  -c COLLECTION, --collection COLLECTION
                        Collection to use.
  -r, --drop            Drop the collection if it already exists.
```
It will take care of loading the data and creating relevant indexes required for high performance of mongodb in queries handling.
If you wish to represent oriented profiles (one profile for each strand, all in the same track), profiles for each strand should be generated in the following format :
```csv
seqid           strand  start   end     score
scaffold_1      +        0       26      0
scaffold_1      +        26      80      1
scaffold_1      +        80      130     2
scaffold_1      +        130     157     3
scaffold_1      +        157     259     4
```
and imported in mongodb **in the same** collection using `./bin/load_bed_profile.py`

<a name="a2-2-2-2">
##### Bigwig file adaptor
A better option is to use the [bigwig][bigwig] format, since it is both faster and less memory hungry. Bigwig files are also significantly smaller than their bedgraph counterparts (up to 6 times smaller). Libraries necessary for handling such files are provided by Jim Kent and are part of the UCSC genome browser. Both the libraries and nodejs bindings are compiled during j.nome.s installation.
Using it is quite straightforward. A utility script is generated in the `./bin` directory during the setup phase.
It can be used to convert [bedgraph][bedgraph] files in [bigwig][bigwig]
```bash
$ ./bin/wigToBigWig 
wigToBigWig v 4 - Convert ascii format wig file (in fixedStep, variableStep
or bedGraph format) to binary big wig format.
usage:
   wigToBigWig in.wig chrom.sizes out.bw
Where in.wig is in one of the ascii wiggle formats, but not including track lines
and chrom.sizes is two column: <chromosome name> <size in bases>
and out.bw is the output indexed big wig file.
Use the script: fetchChromSizes to obtain the actual chrom.sizes information
from UCSC, please do not make up a chrom sizes from your own information.
options:
   -blockSize=N - Number of items to bundle in r-tree.  Default 256
   -itemsPerSlot=N - Number of data points bundled at lowest level. Default 1024
   -clip - If set just issue warning messages rather than dying if wig
                  file contains items off end of chromosome.
   -unc - If set, do not use compression.
```
The locations of the bigwig files will have to be provided in the configuration of the track that should make use of it.
See the [appropriate section](https://github.com/agrimaldi/j.nome.s/wiki/Configuration) about configuring datasets and tracks.

---

<a name="a3">
## Configuration

Everything in j.nome.s can easily be configured via simple and consistent JSON configuration files.
These configuration files can be found in `j.nome.s/config`.
It is strongly advised that you create a separate branch for editing and adding configuration files. See the [Installation section](https://github.com/agrimaldi/j.nome.s/wiki/Configuration#wiki-Installation) for more information.

<a name="a3-1">
### Global configuration
The only required file is **global.json** which contains general settings. You
can then add as many configuration files as you need, one per dataset.
The `config/global.json` file provides the following information :
```javascript
{
    "datasets": {    
        "Xentr42": { // Each entry contains metadata of a dataset. The key must be the name of the corresponding mongo database.
            "file": "Xentr42.json" // The name of the configuration file associated to the dataset. The scope is config/
          , "name": "Xentr42" // the name of the dataset, which can be used for display.
          , "description": "Xenopus tropicalis genome v4" // A short description of the dataset.
        }
    }
  , "style": { // Each entry maps a style name to raphael style-attributes. This is where you can customize the look of j.nome.s
        "bgrules": { // The rules used for the background.
            "stroke": "#eee"
        }
      , "ruler": { // The ruler with precise graduations.
            "stroke": "#000"
        }
      , "selectedspan": { // The rectangle showing the currently selected region.
            "fill": "#00ABFA"
          , "fill-opacity": 0.2
          , "stroke-width": 2
        }
      , "selectionspan": { // The rectangle showing the region being selected via mouse dragging.
            "fill": "#00ABFA"
          , "fill-opacity": 0.3
          , "stroke-width": 2
        }
    }
}
```

<a name="a3-2">
### Datasets configuration
Each dataset should have a separate associated file, which is specified in the `./config/global.json` file

<a name="a3-2-1">
#### Dataset specific metadata
The dataset specific configuration should begin with the following key:
```javascript
{
    "dbname": "SacCer-demo",
//  ...
}
```

<a name="a3-2-2">
#### Tracks
After specifying the database name, each track is included in the `tracks` dictionary.
```javascript
"tracks": {
    "ensembl_genes": { // Should match the collection name in mongodb
        "id": "ensembl_genes" // Should match the collection name in mongodb
      , "name": "Ensembl genes" // Name of the track
      , "description": "Ensembl genes" // Short description of the track
      , "type": ( "ref" | "profile" | "oriented-profile" ) // The type of the track. Determines how it will be displayed 
      , "style": {
//          ... Style to display
        }
    }
}
```

<a name="a3-2-2-1">
##### Non-quantitative data tracks
Non-quantitative data (such as gene annotation) should be configured this way. Note the `"type": "ref"` field.
```javascript
"ensembl_genes": {
    "id": "ensembl_genes"
  , "name": "Ensembl genes"
  , "description": "Ensembl genes"
  , "type": "ref" // Use "ref" for non-quantitative data
  , "backend": "json"
  , "style": {
        "fill": "purple" // The color of each block
      , "stroke": "black" // The color of the outer line
    }
}
```

<a name="a3-2-2-2">
##### Quantitative data tracks
Quantitative data can be displayed either from mongodb or a bigwig file.

<a name="a3-2-2-2-1">
###### MongoDB adaptor
In case the data is queried from mongodb, the backend can be set to "json" (although it is the default value).

<a name="a3-2-2-2-1-1">
####### Standard
```javascript
"rnaseq": {
    "id": "rnaseq"
  , "name": "RNASeq data"
  , "description": "RNA-Seq data from SRR002051"
  , "type": "profile" // Here the type should be set to "profile".
  , "backend": "json" // Use "json" backend when querying mongodb directly
  , "style": {
        "gutter": 25 // Mandatory
      , "shade": true
      , "nostroke": true // Do not draw a line delimiting the profile, only colorizing the area under the curve
      , "axis": "0 0 1 1" // Where should the axis labels be (top right bottom left)
      , "axisxstep": 10 // Number of ticks on the X axis
      , "axisystep": 4 // Number of ticks on the Y axis
    }
}
```

<a name="a3-2-2-2-1-2">
####### Oriented
```javascript
"rnaseq_oriented": {
    "id": "rnaseq_oriented"
  , "name": "RNASeq data (oriented)"
  , "description": "RNA-Seq data from SRR002051 (oriented)"
  , "type": "oriented-profile" // Here the type should be set to "oriented-profile" to display 2 profiles on the same track.
  , "backend": "json" // Use "json" backend when querying mongodb directly
  , "style": {
//      ...
      , "colors": [
            "#555599" // Color of the profile
          , "#ffffff" // Mandatory. Set to same color as the background (white)
        ]
    }
}
```

<a name="a3-2-2-2-2">
###### Bigwig adaptor
To use bigwig files, the `"backend"` should be set to `"bigwig"`

<a name="a3-2-2-2-2-1">
####### Standard
```javascript
"rnaseq_bigwig": {
    "id": "rnaseq_bigwig"
  , "name": "RNASeq data (bigwig)"
  , "description": "RNA-Seq data from SRR002051 (bigwig)"
  , "type": "profile"
  , "backend": "bigwig" // Set the backend to "bigwig"
  , "file": "./test/store/SRR002051_chrI-II-III-IV.profile.bw" // Full path to the bigwig file
  , "style": {
//      ... Same as for non-oriented profiles from mongodb
    }
}
```

<a name="a3-2-2-2-2-2">
####### Oriented
```javascript
"rnaseq_bigwig_oriented": {
    "id": "rnaseq_bigwig_oriented"
  , "name": "Oriented RNASeq data (bigwig)"
  , "description": "Oriented RNA-Seq data from SRR002051 (bigwig)"
  , "type": "profile"
  , "files": { // Full paths to the bigwig files containing the sense and antisense strand data.
        "plus_strand": "./test/store/oriented/SRR002051_top_chrI-II-III-IV.profile.bw"
      , "minus_strand": "./test/store/oriented/SRR002051_bottom_chrI-II-III-IV.profile.bw"
    }
  , "backend": "bigwig" // Set the backend to "bigwig"
  , "style": {
//      ... Same as for oriented profiles from mongodb
    }
}
```


[mongodoc]: http://www.mongodb.org/display/DOCS/Home
[mongoimport]: http://www.mongodb.org/display/DOCS/Import+Export+Tools
[gff]: http://www.sanger.ac.uk/resources/software/gff/spec.html
[bedgraph]: https://cgwb.nci.nih.gov/goldenPath/help/bedgraph.html
[bigwig]: http://genome.ucsc.edu/goldenPath/help/bigWig.html
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