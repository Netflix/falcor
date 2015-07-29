<!-- This bit has to be html to achieve the 3 column layout -->
<div class="row row-gap-medium">
  <div class="col-sm-4">
    {% capture the_include %}{% include homepage-key-feature-1.md %}{% endcapture %}
    {{ the_include | markdownify }}
  </div>
  <div class="col-sm-4">
    {% capture the_include %}{% include homepage-key-feature-2.md %}{% endcapture %}
    {{ the_include | markdownify }}
  </div>
  <div class="col-sm-4">
    {% capture the_include %}{% include homepage-key-feature-3.md %}{% endcapture %}
    {{ the_include | markdownify }}
  </div>
</div>


### Things to check out in the current site draft (newest first):

The intro animation on mobile doesn't have a replay button, as I haven't yet found a place for it that doesn't interfere with the aesthetics of the main hero banner. For now, you can <a class="repeat-intro-anim-hack-link">Click here to re-run the intro animation on mobile</a>

Tables of contents are now in and I've done a first pass at styling them. I plan to do a second pass and polish them up once the other remaining big task it out of the way (docs integration).

Menus for both mobile and desktop are fully styled.

There are some syntax highlighting examples on the getting started pages. Updates to that coming soon.

{% include something.html %}

