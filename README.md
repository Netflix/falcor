Falcor Website
==============

To Develop the Site
-------------------

1. Clone the repo
2. Install jekyll: `gem install jekyll`
3. Install required node modules: `npm install`.
4. Install gulp globally with `npm install -g gulp`.
5. Run `gulp serve` and wait for the build to finish and pop up a page

Then change any files you like and it will notify you, autorebuild, and refresh as necessary.

When you're ready to push, just commit everything and push to gh-pages as usual.

Configuring the Navigation
--------------------------

Please see the documented code in `_data/navigation.yml` to configure the main top nav.

The nav currently only supports two levels currently, but can be extended to support more when necessary.

Code blocks
------------------

Rather than using triple-backticks, please use the highlight Liquid Tag like so

```
{% highlight languageName %}
// some code in that language
{% endhighlight %}
```

This will automatically format and apply syntax highlighting to the code snippet.

Page Level Variables
--------------------

Every page can use jekyll's [frontmatter](http://jekyllrb.com/docs/frontmatter/ "Front Matter") system to define a number of fields:
- **title**: Sets the page title tag. Defaults to the value in _config.yml if absent. Also has a sitewide prefix that can be customized, also in _config.yml.
- **description**: Sets the meta description tag. Defaults to the value in _config.yml if absent.


TODO list
-----------------------------

P1
- find/make better syntax highlighting theme
- add open graph metadata to base template
- verify social sharing metadata is set up and results in clean share visuals
- Proper docs integration
- basic syntax highlighting
- add small footer that just acts like bottom padding
- fix intro animation in firefox
- have a style for js, a style for console, and a style for output for code blocks

P2
- figure out how to leave replay button in on mobile without cluttering the hero banner
- Style TOC - second pass
- Fix minor safari horizontal scrollbar issue in `pre`s
- more docs, of course!

Ideas
- Link to next + previous page in menu section at the bottom of each page
