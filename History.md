
0.9.6 / 2012-07-17 
==================

  * Fix some document fields not appearing in tooltip
  * Fix qtips not staying in the window viewport

0.9.5 / 2012-07-16 
==================

  * Updated version dates
  * Fix non-oriented features. Closes #3
  * Update package version

0.9.4 / 2012-07-15 
==================

  * Order tooltip metadata
  * Throw error if GlyphBase abstract classes are not implemented
  * Use qtip2 to display tooltips
  * Use bbox instead of genomic position for collision detection.
  * Custom cursor for tooltips
  * Dynamic selection of glyph / oriented-glyph
  * Update raphaeljs to 2.1

0.9.3 / 2012-07-11 
==================

  * Fix undefined doc.names

0.9.2 / 2012-07-11 
==================

  * Display names above features in a size dependent manner
  * Tests whether profiles are composed of only zeros
  * Fix track names in track selector

0.9.0 / 2012-07-10 
==================

  * Added support for querying oriented bigwig files
  * Test dataset for oriented bigwig

0.8.3 / 2012-07-10 
==================

  * Use interfaces to C functions to eliminate C++ warnings
  * Inhibit warnings only for Jim Kent's library

0.8.2 / 2012-07-09 
==================

  * Added hmmstats

0.8.1 / 2012-07-09 
==================

  * Fix make test
  * Use <@(_inputs) and <@(_outputs)
  * osx warnings
  * Add specific flags for configurations
  * Removed support for node 0.4
  * Use vanilla src files from Jim Kent's lib.
  * Add travis config file

0.8.0 / 2012-07-08 
==================

  * osx specific flags
  * Use bindings to load compiled node modules
  * Add zlib to the required libraries
  * Compile wigToBigWig via node-gyp
  * Async bigwig query
  * Removed useless emitLines()
  * Fix node crash when bigwig files cannot be opened
  * Update for node 0.8
  * Removed waf-script
  * Builld bigwig support with node-gyp
  * local compiling of Jim Kent's libraries
  * Added Jim Kent native libraries
  * Deserialize bigwig data for representation.
  * Added support for querying bigwig file from a track
  * Python script to query bigwig files
  * Added tool necessary for generation of bigwig files
  * Included generation of bigwig file in demo package

0.7.5 / 2012-02-29 
==================

  * Disable caching

0.7.4 / 2012-02-28
==================

  * Added 0 baseline in oriented profiles
  * Fixed bug preventing navigation UI to show-up on first load. Closes #19
  * ui elements independance
  * Balanced profiles height proportions

0.7.3 / 2012-02-27
==================

  * Remove artifacts of dual popups
  * Added double label when hovering oriented profiles.
  * Functional oriented profiles rescaling
  * Fix oriented profiles crashing when rescaling

0.7.2 / 2012-02-27
==================

  * Center oriented profiles on 0
  * Fix buttons css in firefox
  * Added black stroke to ref glyphs

0.7.1 / 2012-02-26 
==================

  * Fix input fields in firefox. Closes #10

0.7.0 / 2012-02-26
==================

  * Fix selection rectangle in firefox. Closes #11
  * Quick fix to properly display oriented profiles
  * Draw oriented profiles. Closes #9
  * Use async.js to request strand specific data in parallel
  * Added tests for oriented profiles
  * Various fixes : - support for loading oriented profiles - updated devDependencies - added try/catch workaround to tests
  * removed seqid from processProfile's output
  * Added test for cache[ON]/[OFF]
  * Expose TrackRef and TrackProfile for testing
  * Added chai to devDependecies
  * Added rule to remove the demo data. Closes #6
  * Added mocha in devDependencies

0.6.0 / 2012-02-11 
==================

  * Updated expressjs to 2.5.8, and current version to 0.6.0
  * Cache data.
  * Use apprise for the dialog box.
  * Check if input type is a number
  * Updated raphaeljs to 2.0
  * Fix bug in start / end swapping. Closes #4
  * Fixed bugged profile representation at extremities. Closes #3
  * Updated jquery and jquery-ui

0.5.0 / 2012-02-08 
==================

  * Fixes bad _id handling by buffalo (mongolian >= 0.1.15)
  * Update mongolian to 0.1.17

0.4.12 / 2012-02-06 
==================

  * Updated expressjs to 2.5.7, for node 0.6.x support.
  * Optimized a bit the way the values are passed to g.linechart

0.4.11 / 2012-02-01 
==================

  * Fix processProfile with node v0.6.x. Closes #1
  * Removed unnecessary sessionStore

0.4.10 / 2012-01-30 
==================

  * Track title down 2px
  * Gene annotaions ('ref' type in config) are now oriented.
  * New script to easily load profiles.

0.4.9 / 2012-01-29
==================

  * Updated dependencies.
  * Added popup of the position along the x-axis
  * Fixed bug in empty profiles processing.
  * Functional gff2json tool.
  * UI improvements
  * Corrected offset display bug when zooming on profiles
  * Added spinner while loading ajax.
  * Better organisation of browsing controls
  * Better CSS.
  * Sliding panel for track selection.
  * Better handling of form values.

0.4.8 / 2011-07-22
==================

  * Fixed bug in profiles if Y values = 0.

0.4.7 / 2011-07-19 
==================

  * Improved profile caching mechanism to play well with huge references (> 10M).
  * Better looking selection rectangle.

0.4.6 / 2011-07-18 
==================

  * Corrected typos.
  * Fixed bug causing the app to crash if an empty array is passed to processProfile().

0.4.5 / 2011-07-17 
==================

  * Fixed bug when submitting parameters via the form from a blank page.
  * Fixed bug in seqid metadata fetching when switching dataset.

0.4.4 / 2011-07-17 
==================

  * Fixed bug in loadFastaRef.py

0.4.3 / 2011-07-17 
==================

  * Improved profile handling performance by caching data.

0.4.2 / 2011-07-17 
==================

  * Fixed bug in profile rendering for views less than 2kb.

0.4.1 / 2011-07-15 
==================

  * Fixed bug in navigation and tracks alignment.

0.4.0 / 2011-07-13 
==================

  * Fixed bug in the lazy track refresh if position 0 was part of the view.
  * Improved history navigation.
  * Improved form validation.
  * Switched to node-mongolian (from mongoose) for performance reasons.
  * Implemented profile tracks visualisation.

0.3.2 / 2011-06-20 
==================

  * Fixed visual bug in track reordering.
  * Better centering of output-gui.

0.3.1 / 2011-06-20 
==================

  * Lazier track and navigation refresh.
  * Documents in a track are ordered.

0.3.0 / 2011-06-18 
==================

  * Possibility to reorder tracks by drag & drop.
  * The order of tracks is remembered.
  * query and render only new selected tracks is view does not change.
  * Favicon redesigned.
  * Display overlapping elements of a track on different Y-axis.

0.2.0 / 2011-06-14 
==================

  * Fixed selection going beyond boundaries.
  * Fixed non-existing SEQID.
  * Fixed SEQID position overflow.
  * Use ID instead of name in track rendering.
  * Display the track name in the SVG canvas.
  * Use configuration files for styles.
  * Handle 500 and 404 errors.
  * Link to generated API documentation.
  * Wrote 'about' section.
  * Wrote 'documentation' section.
  * Wrote package.json to keep track of dependencies.

0.0.1 / 2011-06-11 
==================

  * Navigation via rulers.
