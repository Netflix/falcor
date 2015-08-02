### Falcor Website JSDoc Theme

Based on the default JSDoc 3 template, with a completely rewritten nav and a number of other improvements.

To easily modify it, take a look at the code in navigation.tmpl. Layout.tmpl, container.tmpl.

The main container.tmpl file has jekyll front matter in it so the falcor site can use it. If you'd like to use the template both inside and outside the site, it should be as simple as moving the front matter to layout.tmpl, then using the default template's ability to swap out layout.tmpl to have your own standalone template frame.

When working with the navigation, you'll notice it generates a long menu with a lot of extra information. That is there so it can be easily styled as you wish with a few lines of CSS. For example, it tracks the active page, so you can adapt which parts of the navigation are visible in a given context.

Like the default template for JSDoc 3, it uses: [the Taffy Database library](http://taffydb.com/) and the [Underscore Template library](http://documentcloud.github.com/underscore/#template).
