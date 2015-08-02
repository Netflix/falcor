Falcor Website
==============

To Develop the Site
-------------------

1. Clone the repo
2. Install jekyll: `gem install jekyll`
3. Install required node modules: `npm install`.
4. Install gulp globally with `npm install -g gulp`.
5. Run `gulp serve` and wait for the build to finish and pop up a page

Then change any files you like and it will notify you, autorebuild less/html/md, and refresh as necessary.

When you're ready to push, just commit everything and push to gh-pages as usual. If you're worried, you can also do a manual rebuild before pushing with `gulp build-all`.

Configuring the Navigation
--------------------------

Please see the documented code in `_data/navigation.yml` to configure the main top nav.

The nav currently only supports two levels currently, but can be extended to support more when necessary.

Page Crosslink Helper
---------------------
There's a simple link to page id helper you can use like this:
```
{% include link.to id="router" text="Falcor Router" %}
```

Where you can replace the id with any page's id, or even a variable (`id=site.data.my_favorite_page_id`), and it will always keep the correct url to that page, even if it's moved or renamed.


Code blocks
------------------

You can use triple tildes with the language specified and your code will be automatically syntax highlighted!
Use the language shell/sh/bash to get terminal colors, or the special language output (so `~~~output`) to get a dark variant of the main highlighting theme so you can show a user's input and the server's response with contrasting themes.


Page Level Variables
--------------------

Every page can use jekyll's [frontmatter](http://jekyllrb.com/docs/frontmatter/ "Front Matter") system to define a number of fields:
- **title**: Sets the page title tag. Defaults to the value in _config.yml if absent. Also has a sitewide prefix that can be customized, also in _config.yml.
- **description**: Sets the meta description tag. Defaults to the value in _config.yml if absent.


TODO list
-----------------------------

P1
- add open graph metadata to base template
- verify social sharing metadata is set up and results in clean share visuals
- fix intro animation in firefox
- improve type styles on api docs
- finish documenting this repo

P2
- add small footer that just acts like bottom padding? I can't find any other sites that do this, so I'm not sure if we want to.
- figure out how to leave replay button in on mobile without cluttering the hero banner 

idea: put the few large tables in the api docs into forcibly size-restricted containers that scroll so they can't overflow.